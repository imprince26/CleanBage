import Collection from '../models/collectionModel.js';
import Route from '../models/routeModel.js';
import Report from '../models/reportModel.js';
import { handleError } from '../utils/errorHandler.js';

export const getAssignedBins = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {
            assignedCollector: req.user.id,
            isActive: true
        };

        // Apply filters
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        if (req.query.wasteType && req.query.wasteType !== 'all') {
            query.wasteType = req.query.wasteType;
        }

        if (req.query.fillLevel && req.query.fillLevel !== 'all') {
            switch (req.query.fillLevel) {
                case 'overflow':
                    query.fillLevel = { $gte: 80 };
                    break;
                case 'high':
                    query.fillLevel = { $gte: 60, $lt: 80 };
                    break;
                case 'medium':
                    query.fillLevel = { $gte: 40, $lt: 60 };
                    break;
                case 'low':
                    query.fillLevel = { $lt: 40 };
                    break;
            }
        }

        // Search functionality
        if (req.query.search) {
            query.$or = [
                { binId: { $regex: req.query.search, $options: 'i' } },
                { 'location.address.street': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sorting
        let sort = {};
        if (req.query.sort) {
            const [field, direction] = req.query.sort.split(':');
            sort[field] = direction === 'desc' ? -1 : 1;
        } else {
            sort = { lastCollected: -1 };
        }

        const bins = await Collection.find(query)
        .populate('lastCollectionReport', 'collectionDate status fillLevelBefore fillLevelAfter notes')
        .sort(sort)
        .skip(skip)
        .limit(limit);

        const total = await Collection.countDocuments(query);

        res.status(200).json({
            success: true,
            data: bins,
            total,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get bin details
// @route   GET /api/collector/bins/:id
// @access  Private/Collector
export const getBinDetails = async (req, res) => {
    try {
        const bin = await Collection.findOne({
            _id: req.params.id,
            assignedCollector: req.user.id
        }).populate('reportedBy', 'name avatar')
          .populate('lastCollectionReport');

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: 'Bin not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bin
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get bin collection history
// @route   GET /api/collector/bins/:id/history
// @access  Private/Collector
export const getBinHistory = async (req, res) => {
    try {
        const reports = await Report.find({
            bin: req.params.id,
            collector: req.user.id
        }).sort({ collectedAt: -1 });

        res.status(200).json({
            success: true,
            data: reports
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Submit collection report
// @route   POST /api/collector/bins/:id/report
// @access  Private/Collector
export const submitReport = async (req, res) => {
    try {
        const bin = await Collection.findOne({
            _id: req.params.id,
            assignedCollector: req.user.id
        });

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: 'Bin not found'
            });
        }

        const report = await Report.create({
            bin: bin._id,
            collector: req.user.id,
            fillLevel: req.body.fillLevel,
            wasteType: req.body.wasteType,
            status: req.body.status,
            notes: req.body.notes,
            images: req.body.images || []
        });

        // Update bin status
        bin.lastCollectionReport = report._id;
        bin.lastCollected = new Date();
        bin.status = 'collected';
        bin.fillLevel = 0;
        await bin.save();

        res.status(201).json({
            success: true,
            data: report
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get collector stats
// @route   GET /api/collector/stats
// @access  Private/Collector
export const getCollectorStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            totalCollections: await Report.countDocuments({ collector: req.user.id }),
            todayCollections: await Report.countDocuments({
                collector: req.user.id,
                createdAt: { $gte: today }
            }),
            completionRate: 0,
            avgResponseTime: 0
        };

        // Calculate completion rate
        const totalAssignments = await Collection.countDocuments({
            assignedCollector: req.user.id
        });
        
        if (totalAssignments > 0) {
            const completedCollections = await Collection.countDocuments({
                assignedCollector: req.user.id,
                status: 'collected'
            });
            stats.completionRate = (completedCollections / totalAssignments) * 100;
        }

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get active routes
// @route   GET /api/collector/routes/active
// @access  Private/Collector
export const getActiveRoutes = async (req, res) => {
    try {
        const routes = await Route.find({
            collector: req.user.id,
            status: { $in: ['pending', 'in_progress'] }
        }).populate('bins.bin');

        res.status(200).json({
            success: true,
            data: routes
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get route history
// @route   GET /api/collector/routes/history
// @access  Private/Collector
export const getRouteHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {
            collector: req.user.id
        };

        // Apply filters
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        if (req.query.dateFrom || req.query.dateTo) {
            query.createdAt = {};
            if (req.query.dateFrom) {
                query.createdAt.$gte = new Date(req.query.dateFrom);
            }
            if (req.query.dateTo) {
                query.createdAt.$lte = new Date(req.query.dateTo);
            }
        }

        const routes = await Route.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('bins.bin');

        const total = await Route.countDocuments(query);

        res.status(200).json({
            success: true,
            data: routes,
            total,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get upcoming collections
// @route   GET /api/collector/collections/upcoming
// @access  Private/Collector
export const getUpcomingCollections = async (req, res) => {
    try {
        const collections = await Collection.find({
            assignedCollector: req.user.id,
            status: 'pending'
        }).sort({ scheduledTime: 1 })
          .limit(10);

        res.status(200).json({
            success: true,
            data: collections
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Update bin status
// @route   PUT /api/collector/bins/:id/status
// @access  Private/Collector
export const updateBinStatus = async (req, res) => {
    try {
        const bin = await Collection.findOneAndUpdate(
            {
                _id: req.params.id,
                assignedCollector: req.user.id
            },
            {
                status: req.body.status,
                fillLevel: req.body.fillLevel || 0
            },
            { new: true }
        );

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: 'Bin not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bin
        });

    } catch (error) {
        handleError(res, error);
    }
};

// @desc    Get collector activity
// @route   GET /api/collector/activity
// @access  Private/Collector
export const getCollectorActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        // Get recent activities from various sources
        const [collections, reports, routes] = await Promise.all([
            Collection.find({ 
                assignedCollector: req.user.id,
                lastCollected: { $exists: true }
            })
            .sort({ lastCollected: -1 })
            .limit(limit)
            .select('binId location lastCollected status'),

            Report.find({ collector: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('binId status createdAt notes'),

            Route.find({ 
                collector: req.user.id,
                status: { $in: ['completed', 'in_progress'] }
            })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .select('name status updatedAt')
        ]);

        // Transform and combine activities
        const activities = [
            ...collections.map(c => ({
                _id: c._id,
                title: `Bin #${c.binId} Collected`,
                description: `Collected waste from ${c.location?.address || 'Unknown Location'}`,
                timestamp: c.lastCollected,
                type: 'collection',
                icon: 'Truck'
            })),
            ...reports.map(r => ({
                _id: r._id,
                title: `Report Submitted`,
                description: r.notes || `Submitted report for collection`,
                timestamp: r.createdAt,
                type: 'report',
                icon: 'FileText'
            })),
            ...routes.map(r => ({
                _id: r._id,
                title: `Route ${r.status === 'completed' ? 'Completed' : 'Started'}`,
                description: `${r.name}`,
                timestamp: r.updatedAt,
                type: 'route',
                icon: 'MapPin'
            }))
        ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

        res.status(200).json({
            success: true,
            data: activities
        });

    } catch (error) {
       console.log(error);
       res.status(500).json({
            success: false,
            message: 'Failed to fetch activity'
        });
    }
};