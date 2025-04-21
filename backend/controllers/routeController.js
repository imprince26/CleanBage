import Route from '../models/routeModel.js';
import Collection from '../models/collectionModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';
import { optimizeRoute } from '../utils/geoUtils.js';

// @desc    Get all routes
// @route   GET /api/routes
// @access  Private
export const getRoutes = catchAsync(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter
    const filter = {};
    
    // Filter by collector
    if (req.query.collector) {
        filter.collector = req.query.collector;
    }
    
    // Filter by status
    if (req.query.status) {
        filter.status = req.query.status;
    }
    
    // Filter by zone
    if (req.query.zone) {
        filter.zone = req.query.zone;
    }
    
    // Filter by active status
    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
            filter.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filter.createdAt.$lte = new Date(req.query.endDate);
        }
    }
    
    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1;
    }
    
    const total = await Route.countDocuments(filter);
    
    const routes = await Route.find(filter)
        .populate('collector', 'name avatar')
        .populate('plannedBy', 'name role')
        .populate('bins.bin', 'binId location fillLevel wasteType status')
        .sort(sort)
        .skip(startIndex)
        .limit(limit);
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    
    res.status(200).json({
        success: true,
        count: routes.length,
        pagination,
        total,
        data: routes
    });
});

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Private
export const getRoute = catchAsync(async (req, res, next) => {
    const route = await Route.findById(req.params.id)
        .populate('collector', 'name avatar phone')
        .populate('plannedBy', 'name role')
        .populate('bins.bin', 'binId location fillLevel wasteType status');
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        data: route
    });
});

// @desc    Create new route
// @route   POST /api/routes
// @access  Private/Admin
export const createRoute = catchAsync(async (req, res, next) => {
    // Add planner
    req.body.plannedBy = req.user.id;
    
    // Check if required fields are provided
    if (!req.body.collector || !req.body.startLocation || !req.body.endLocation || !req.body.bins) {
        return next(new ErrorResponse('Please provide collector, start location, end location, and bins', 400));
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Only admins can create routes', 403));
    }
    
    // Check if collector exists and has the right role
    const collector = await User.findOne({ 
        _id: req.body.collector, 
        role: 'garbage_collector' 
    });
    
    if (!collector) {
        return next(new ErrorResponse('Invalid garbage collector', 404));
    }
    
    // Validate all bins exist
    const binIds = req.body.bins.map(bin => typeof bin === 'object' ? bin.bin : bin);
    
    const bins = await Collection.find({ _id: { $in: binIds } });
    
    if (bins.length !== binIds.length) {
        return next(new ErrorResponse('One or more bins are invalid', 400));
    }
    
    // Prepare bins with order
    const formattedBins = req.body.bins.map((bin, index) => ({
        bin: typeof bin === 'object' ? bin.bin : bin,
        order: typeof bin === 'object' && bin.order ? bin.order : index,
        estimated_time: typeof bin === 'object' && bin.estimated_time ? bin.estimated_time : 5
    }));
    
    // Sort bins by order
    formattedBins.sort((a, b) => a.order - b.order);
    
    // Try to optimize route if requested
    if (req.body.optimize) {
        try {
            // Get coordinates for all bins
            const binsWithCoordinates = await Collection.find({ _id: { $in: binIds } })
                .select('location')
                .lean();
            
            const waypointCoordinates = binsWithCoordinates.map(bin => bin.location.coordinates);
            
            const optimizedRoute = await optimizeRoute(
                req.body.startLocation.coordinates,
                req.body.endLocation.coordinates,
                waypointCoordinates
            );
            
            // Reorder bins based on optimization
            const optimizedBins = optimizedRoute.optimizedWaypointOrder.map((index, newIndex) => ({
                bin: formattedBins[index].bin,
                order: newIndex,
                estimated_time: formattedBins[index].estimated_time
            }));
            
            req.body.bins = optimizedBins;
            req.body.distance = optimizedRoute.totalDistance;
            req.body.estimatedTime = optimizedRoute.totalDuration;
            req.body.optimized = true;
        } catch (error) {
            console.error('Route optimization error:', error);
            // Continue without optimization
            req.body.bins = formattedBins;
            req.body.optimized = false;
        }
    } else {
        req.body.bins = formattedBins;
    }
    
    const route = await Route.create(req.body);
    
    // Update bins with assigned collector
    await Collection.updateMany(
        { _id: { $in: binIds } },
        { 
            assignedCollector: req.body.collector,
            status: 'in-progress'
        }
    );
    
    // Create notification for collector
    await Notification.createNotification({
        recipient: req.body.collector,
        type: 'route_assigned',
        title: 'New Route Assigned',
        message: `You have been assigned a new collection route with ${binIds.length} bins.`,
        priority: 'high',
        icon: 'map',
        relatedTo: {
            route: route._id
        },
        action: {
            text: 'View Route',
            url: `/collector/routes/${route._id}`
        }
    });
    
    res.status(201).json({
        success: true,
        data: route
    });
});

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
export const updateRoute = catchAsync(async (req, res, next) => {
    let route = await Route.findById(req.params.id);
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update routes', 403));
    }
    
    // Fields to update
    const fieldsToUpdate = {
        name: req.body.name,
        description: req.body.description,
        collector: req.body.collector,
        schedule: req.body.schedule,
        vehicle: req.body.vehicle,
        vehicleCapacity: req.body.vehicleCapacity,
        notes: req.body.notes,
        isActive: req.body.isActive,
        zone: req.body.zone
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // If collector changed, update the bins
    if (fieldsToUpdate.collector && fieldsToUpdate.collector !== route.collector.toString()) {
        // Check if collector exists and has the right role
        const collector = await User.findOne({ 
            _id: fieldsToUpdate.collector, 
            role: 'garbage_collector' 
        });
        
        if (!collector) {
            return next(new ErrorResponse('Invalid garbage collector', 404));
        }
        
        // Get all bin IDs in this route
        const binIds = route.bins.map(binObj => binObj.bin);
        
        // Update bins with new collector
        await Collection.updateMany(
            { _id: { $in: binIds } },
            { assignedCollector: fieldsToUpdate.collector }
        );
        
        // Create notification for new collector
        await Notification.createNotification({
            recipient: fieldsToUpdate.collector,
            type: 'route_assigned',
            title: 'Route Assigned',
            message: `You have been assigned a collection route with ${binIds.length} bins.`,
            priority: 'high',
            icon: 'map',
            relatedTo: {
                route: route._id
            },
            action: {
                text: 'View Route',
                url: `/collector/routes/${route._id}`
            }
        });
    }
    
    route = await Route.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: route
    });
});

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
export const deleteRoute = catchAsync(async (req, res, next) => {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete routes', 403));
    }
    
    // Remove collector assignment from bins if route is active
    if (route.isActive) {
        const binIds = route.bins.map(binObj => binObj.bin);
        
        await Collection.updateMany(
            { _id: { $in: binIds } },
            { 
                assignedCollector: null,
                status: 'pending'
            }
        );
    }
    
    await route.deleteOne();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Update route status
// @route   PUT /api/routes/:id/status
// @access  Private/Garbage Collector
export const updateRouteStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const route = await Route.findById(req.params.id);
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is the assigned collector
    if (route.collector.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this route', 403));
    }
    
    // Validate status
    if (!['planned', 'in-progress', 'completed', 'canceled'].includes(status)) {
        return next(new ErrorResponse('Invalid status', 400));
    }
    
    const updates = { status };
    
    // If starting route
    if (status === 'in-progress' && route.status !== 'in-progress') {
        updates.actualStartTime = new Date();
        
        route.history.push({
            date: new Date(),
            status: 'started',
            location: route.startLocation,
            notes: 'Route started'
        });
    }
    
    // If completing route
    if (status === 'completed' && route.status !== 'completed') {
        updates.actualEndTime = new Date();
        
        route.history.push({
            date: new Date(),
            status: 'completed',
            location: route.endLocation,
            notes: 'Route completed'
        });
        
        // Calculate completion rate
        const completedBins = route.history.filter(h => h.status === 'bin_collected').length;
        updates.completionRate = Math.round((completedBins / route.bins.length) * 100);
    }
    
    const updatedRoute = await Route.findByIdAndUpdate(
        req.params.id, 
        {
            ...updates,
            history: route.history
        }, 
        {
            new: true,
            runValidators: true
        }
    );
    
    // If completed, notify admins
    if (status === 'completed') {
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.createNotification({
                recipient: admin._id,
                type: 'route_assigned',
                title: 'Route Completed',
                message: `Route ${route.name || route._id} has been completed with ${updates.completionRate}% completion rate.`,
                priority: 'medium',
                icon: 'check-circle',
                relatedTo: {
                    route: route._id
                }
            });
        }
    }
    
    res.status(200).json({
        success: true,
        data: updatedRoute
    });
});

// @desc    Collect bin on route
// @route   POST /api/routes/:id/collect/:binId
// @access  Private/Garbage Collector
export const collectBin = catchAsync(async (req, res, next) => {
    const { notes } = req.body;
    const route = await Route.findById(req.params.id);
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is the assigned collector
    if (route.collector.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this route', 403));
    }
    
    // Check if route is in progress
    if (route.status !== 'in-progress') {
        return next(new ErrorResponse('Route is not in progress', 400));
    }
    
    // Check if bin exists in route
    const binIndex = route.bins.findIndex(b => b.bin.toString() === req.params.binId);
    if (binIndex === -1) {
        return next(new ErrorResponse('Bin not found in route', 404));
    }
    
    // Get bin details
    const bin = await Collection.findById(req.params.binId);
    if (!bin) {
        return next(new ErrorResponse('Bin not found', 404));
    }
    
    // Add to history
    route.history.push({
        date: new Date(),
        status: 'bin_collected',
        location: {
            type: 'Point',
            coordinates: bin.location.coordinates
        },
        bin: bin._id,
        notes: notes || 'Bin collected'
    });
    
    // Update route capacity
    route.currentCapacityUsed += (bin.fillLevel / 100) * bin.capacity;
    
    // Mark bin as collected
    await Collection.findByIdAndUpdate(req.params.binId, {
        status: 'collected',
        fillLevel: 0,
        lastCollected: new Date()
    });
    
    // Calculate completion rate
    const completedBins = route.history.filter(h => h.status === 'bin_collected').length;
    route.completionRate = Math.round((completedBins / route.bins.length) * 100);
    
    // Check if all bins are collected
    if (completedBins === route.bins.length) {
        route.status = 'completed';
        route.actualEndTime = new Date();
        
        // Notify admins about route completion
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.createNotification({
                recipient: admin._id,
                type: 'route_assigned',
                title: 'Route Completed',
                message: `Route ${route.name || route._id} has been completed with 100% completion rate.`,
                priority: 'medium',
                icon: 'check-circle',
                relatedTo: {
                    route: route._id
                }
            });
        }
    }
    
    await route.save();
    
    res.status(200).json({
        success: true,
        data: route
    });
});

// @desc    Get collector's active routes
// @route   GET /api/routes/collector/active
// @access  Private/Garbage Collector
export const getCollectorActiveRoutes = catchAsync(async (req, res, next) => {
    // Check user is a garbage collector
    if (req.user.role !== 'garbage_collector') {
        return next(new ErrorResponse('Not authorized to access this data', 403));
    }
    
    const routes = await Route.find({
        collector: req.user.id,
        status: { $in: ['planned', 'in-progress'] },
        isActive: true
    })
    .populate('bins.bin', 'binId location fillLevel wasteType status')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: routes.length,
        data: routes
    });
});

// @desc    Get route statistics
// @route   GET /api/routes/stats
// @access  Private/Admin
export const getRouteStats = catchAsync(async (req, res, next) => {
    // Only allow admins
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this data', 403));
    }
    
    // Get total distance covered
    const totalDistance = await Route.aggregate([
        {
            $match: {
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalDistance: { $sum: '$distance' }
            }
        }
    ]);
    
    // Get average completion rate
    const avgCompletionRate = await Route.aggregate([
        {
            $match: {
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                avgCompletionRate: { $avg: '$completionRate' }
            }
        }
    ]);
    
    // Get routes by status
    const routesByStatus = await Route.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Get routes by zone
    const routesByZone = await Route.aggregate([
        {
            $group: {
                _id: '$zone',
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Format status counts into an object
    const formattedStatusCounts = {};
    routesByStatus.forEach(item => {
        formattedStatusCounts[item._id] = item.count;
    });
    
    // Format zone counts into an object
    const formattedZoneCounts = {};
    routesByZone.forEach(item => {
        formattedZoneCounts[item._id]