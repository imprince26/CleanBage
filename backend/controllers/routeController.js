import Route from '../models/routeModel.js';
import Collection from '../models/collectionModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import RewardTransaction from '../models/rewardModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

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
    
    // Filter by status
    if (req.query.status) {
        filter.status = req.query.status;
    }
    
    // Filter by collector
    if (req.query.collector) {
        filter.collector = req.query.collector;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
        filter.date = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    } else if (req.query.startDate) {
        filter.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
        filter.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.date = -1;
    }
    
    const total = await Route.countDocuments(filter);
    
    const routes = await Route.find(filter)
        .populate('collector', 'name avatar')
        .populate('bins.bin', 'binId location')
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
        .populate('collector', 'name avatar phone fcmToken')
        .populate({
            path: 'bins.bin',
            select: 'binId location type capacity lastCollected',
            populate: {
                path: 'lastCollected',
                select: 'collectedAt collectedBy'
            }
        });
    
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
    // Check if collector exists
    if (req.body.collector) {
        const collector = await User.findById(req.body.collector);
        if (!collector || collector.role !== 'garbage_collector') {
            return next(new ErrorResponse('Invalid collector ID', 400));
        }
    }
    
    // Check if bins exist
    if (req.body.bins && req.body.bins.length > 0) {
        for (const binItem of req.body.bins) {
            const bin = await Collection.findById(binItem.bin);
            if (!bin) {
                return next(new ErrorResponse(`Bin not found with id of ${binItem.bin}`, 404));
            }
        }
    }
    
    const route = await Route.create(req.body);
    
    // Notify collector if assigned
    if (req.body.collector) {
        const collector = await User.findById(req.body.collector);
        
        if (collector && collector.fcmToken) {
            // Send push notification (implement with FCM)
            // ...
        }
        
        // Create in-app notification
        await Notification.createNotification({
            recipient: req.body.collector,
            type: 'route_assigned',
            title: 'New Route Assigned',
            message: `You have been assigned a new collection route for ${new Date(route.date).toLocaleDateString()}.`,
            priority: 'high',
            icon: 'route',
            relatedTo: {
                route: route._id
            },
            action: {
                text: 'View Route',
                url: `/collector/routes/${route._id}`
            }
        });
    }
    
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
    
    // Check if collector changed
    let collectorChanged = false;
    let previousCollector = null;
    
    if (req.body.collector && route.collector && req.body.collector.toString() !== route.collector.toString()) {
        collectorChanged = true;
        previousCollector = route.collector;
        
        // Check if new collector exists
        const collector = await User.findById(req.body.collector);
        if (!collector || collector.role !== 'garbage_collector') {
            return next(new ErrorResponse('Invalid collector ID', 400));
        }
    }
    
    // Update route
    route = await Route.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    // Notify new collector if assigned
    if (collectorChanged && req.body.collector) {
        // Notify new collector
        const collector = await User.findById(req.body.collector);
        
        if (collector && collector.fcmToken) {
            // Send push notification (implement with FCM)
            // ...
        }
        
        // Create in-app notification for new collector
        await Notification.createNotification({
            recipient: req.body.collector,
            type: 'route_assigned',
            title: 'New Route Assigned',
            message: `You have been assigned a new collection route for ${new Date(route.date).toLocaleDateString()}.`,
            priority: 'high',
            icon: 'route',
            relatedTo: {
                route: route._id
            },
            action: {
                text: 'View Route',
                url: `/collector/routes/${route._id}`
            }
        });
        
        // Notify previous collector if there was one
        if (previousCollector) {
            await Notification.createNotification({
                recipient: previousCollector,
                type: 'route_reassigned',
                title: 'Route Reassigned',
                message: `A route previously assigned to you for ${new Date(route.date).toLocaleDateString()} has been reassigned.`,
                priority: 'medium',
                icon: 'route',
                relatedTo: {
                    route: route._id
                }
            });
        }
    }
    
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
    
    // Notify collector if route is deleted
    if (route.collector) {
        await Notification.createNotification({
            recipient: route.collector,
            type: 'route_cancelled',
            title: 'Route Cancelled',
            message: `A route assigned to you for ${new Date(route.date).toLocaleDateString()} has been cancelled.`,
            priority: 'high',
            icon: 'route'
        });
    }
    
    await route.deleteOne();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Update route status
// @route   PUT /api/routes/:id/status
// @access  Private/Collector
export const updateRouteStatus = catchAsync(async (req, res, next) => {
    const { status, currentLocation } = req.body;
    
    if (!status) {
        return next(new ErrorResponse('Please provide a status', 400));
    }
    
    const route = await Route.findById(req.params.id);
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is the assigned collector
    if (route.collector.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this route', 403));
    }
    
    // Update status
    route.status = status;
    
    // Update location if provided
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
        route.collectorLocation = {
            type: 'Point',
            coordinates: [currentLocation.longitude, currentLocation.latitude]
        };
    }
    
    // If status is completed, update completion details
    if (status === 'completed') {
        route.completedAt = new Date();
        
        // Check if all bins are collected
        const allCollected = route.bins.every(bin => bin.isCollected);
        
        if (!allCollected) {
            return next(new ErrorResponse('Cannot mark route as completed until all bins are collected', 400));
        }
    }
    
    // If status is in_progress, update start time
    if (status === 'in_progress' && !route.startedAt) {
        route.startedAt = new Date();
    }
    
    await route.save();
    
    // Notify admin about status change
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
        await Notification.createNotification({
            recipient: admin._id,
            type: 'route_status_update',
            title: 'Route Status Updated',
            message: `Route #${route._id.toString().slice(-6)} has been marked as ${status.replace('_', ' ')}.`,
            priority: 'low',
            icon: 'route',
            relatedTo: {
                route: route._id
            },
            action: {
                text: 'View Route',
                url: `/admin/routes/${route._id}`
            }
        });
    }
    
    res.status(200).json({
        success: true,
        data: route
    });
});

// @desc    Collect bin
// @route   POST /api/routes/:id/collect/:binId
// @access  Private/Collector
export const collectBin = catchAsync(async (req, res, next) => {
    const { wasteWeight, notes, currentLocation, images } = req.body;
    
    const route = await Route.findById(req.params.id);
    
    if (!route) {
        return next(new ErrorResponse(`Route not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is the assigned collector
    if (route.collector.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this route', 403));
    }
    
    // Find the bin in the route
    const binIndex = route.bins.findIndex(bin => bin.bin.toString() === req.params.binId);
    
    if (binIndex === -1) {
        return next(new ErrorResponse(`Bin not found in this route`, 404));
    }
    
    // Check if bin is already collected
    if (route.bins[binIndex].isCollected) {
        return next(new ErrorResponse(`Bin already collected`, 400));
    }
    
    // Update bin collection status
    route.bins[binIndex].isCollected = true;
    route.bins[binIndex].collectedAt = new Date();
    route.bins[binIndex].wasteWeight = wasteWeight || 0;
    route.bins[binIndex].notes = notes;
    
    if (images && images.length > 0) {
        route.bins[binIndex].images = images;
    }
    
    // Update route status to in_progress if it's pending
    if (route.status === 'pending') {
        route.status = 'in_progress';
        route.startedAt = new Date();
    }
    
    // Update collector location if provided
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
        route.collectorLocation = {
            type: 'Point',
            coordinates: [currentLocation.longitude, currentLocation.latitude]
        };
    }
    
    await route.save();
    
    // Update the bin's last collection
    const bin = await Collection.findById(req.params.binId);
    
    if (bin) {
        bin.lastCollected = {
            collectedAt: new Date(),
            collectedBy: req.user.id,
            route: route._id
        };
        bin.status = 'collected';
        
        await bin.save();
        
        // If bin was reported, reward the reporter
        if (bin.reporter && bin.reportedAt) {
            // Calculate days since report
            const daysSinceReport = Math.floor((new Date() - bin.reportedAt) / (1000 * 60 * 60 * 24));
            
            // Only reward if collected within 3 days of report
            if (daysSinceReport <= 3) {
                const reporter = await User.findById(bin.reporter);
                
                if (reporter) {
                    // Award points to reporter
                    const pointsAwarded = 10; // Base points
                    
                    // Create reward transaction
                    await RewardTransaction.create({
                        user: reporter._id,
                        points: pointsAwarded,
                        type: 'earned',
                        sourceType: 'bin_report',
                        source: {
                            bin: bin._id,
                            route: route._id
                        },
                        description: `Reward for reporting bin ${bin.binId}`
                    });
                    
                    // Update user's reward points
                    reporter.rewardPoints += pointsAwarded;
                    await reporter.save();
                    
                    // Notify reporter
                    await Notification.createNotification({
                        recipient: reporter._id,
                        type: 'reward_earned',
                        title: 'Points Earned',
                        message: `You earned ${pointsAwarded} points for reporting bin ${bin.binId} which has now been collected.`,
                        priority: 'medium',
                        icon: 'gift',
                        relatedTo: {
                            bin: bin._id
                        }
                    });
                }
            }
            
            // Reset reporter info
            bin.reporter = null;
            bin.reportedAt = null;
            bin.reportNotes = '';
            bin.reportImages = [];
            await bin.save();
        }
    }
    
    res.status(200).json({
        success: true,
        data: route
    });
});

// @desc    Get collector's active routes
// @route   GET /api/routes/collector/active
// @access  Private/Collector
export const getCollectorActiveRoutes = catchAsync(async (req, res, next) => {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get routes for today and future that are assigned to the collector
    const routes = await Route.find({
        collector: req.user.id,
        date: { $gte: today },
        status: { $in: ['pending', 'in_progress'] }
    })
    .populate('bins.bin', 'binId location type capacity status')
    .sort({ date: 1 });
    
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
    
    // Get total routes by status
    const routesByStatus = await Route.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Get routes by month
    const routesByMonth = await Route.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: '$date' },
                    year: { $year: '$date' }
                },
                count: { $sum: 1 },
                completedCount: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                    }
                }
            }
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1
            }
        }
    ]);
    
    // Get average completion time
    const avgCompletionTime = await Route.aggregate([
        {
            $match: {
                status: 'completed',
                startedAt: { $exists: true },
                completedAt: { $exists: true }
            }
        },
        {
            $project: {
                completionTimeMinutes: {
                    $divide: [
                        { $subtract: ['$completedAt', '$startedAt'] },
                        60000 // Convert ms to minutes
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgTime: { $avg: '$completionTimeMinutes' }
            }
        }
    ]);
    
    // Get collector performance
    const collectorPerformance = await Route.aggregate([
        {
            $match: {
                collector: { $exists: true }
            }
        },
        {
            $group: {
                _id: '$collector',
                totalRoutes: { $sum: 1 },
                completedRoutes: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                    }
                },
                pendingRoutes: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                    }
                },
                inProgressRoutes: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
                    }
                },
                cancelledRoutes: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'collector'
            }
        },
        {
            $unwind: '$collector'
        },
        {
            $project: {
                _id: 1,
                name: '$collector.name',
                avatar: '$collector.avatar',
                totalRoutes: 1,
                completedRoutes: 1,
                pendingRoutes: 1,
                inProgressRoutes: 1,
                cancelledRoutes: 1,
                completionRate: {
                    $cond: [
                        { $eq: ['$totalRoutes', 0] },
                        0,
                        {
                            $multiply: [
                                {
                                    $divide: ['$completedRoutes', '$totalRoutes']
                                },
                                100
                            ]
                        }
                    ]
                }
            }
        },
        {
            $sort: { completionRate: -1 }
        }
    ]);
    
    // Format routes by status into an object
    const formattedRoutesByStatus = {};
    routesByStatus.forEach(item => {
        formattedRoutesByStatus[item._id] = item.count;
    });
    
    res.status(200).json({
        success: true,
        data: {
            totalRoutes: await Route.countDocuments(),
            routesByStatus: formattedRoutesByStatus,
            routesByMonth,
            avgCompletionTime: avgCompletionTime.length > 0 ? Math.round(avgCompletionTime[0].avgTime) : 0,
            collectorPerformance
        }
    });
});