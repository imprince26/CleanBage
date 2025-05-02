import Collection from '../models/collectionModel.js';
import User from '../models/userModel.js';
import Report from '../models/reportModel.js';
import Route from '../models/routeModel.js';
import Schedule from '../models/scheduleModel.js';
import { RewardTransaction } from '../models/rewardModel.js';

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalCollections,
            totalUsers,
            totalReports,
            recentCollections,
            collectionStats,
            urgentBins,
            activeCollectors,
            recentReports
        ] = await Promise.all([
            Collection.countDocuments(),
            User.countDocuments(),
            Report.countDocuments(),
            Collection.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('reportedBy', 'name')
                .populate('assignedCollector', 'name'),
            Collection.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Collection.find({ fillLevel: { $gte: 80 } })
                .sort({ fillLevel: -1 })
                .limit(5)
                .populate('assignedCollector', 'name'),
            User.find({ 
                role: 'garbage_collector',
                isActive: true 
            }).countDocuments(),
            Report.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('collector', 'name')
                .populate('bin', 'binId location')
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCollections,
                totalUsers,
                totalReports,
                recentCollections,
                collectionStats,
                urgentBins,
                activeCollectors,
                recentReports
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get performance metrics
export const getPerformanceMetrics = async (req, res) => {
    try {
        const timeframe = req.query.timeframe || 'month';
        const [collectionEfficiency, collectorPerformance, routeStats] = await Promise.all([
            Collection.aggregate([
                {
                    $match: {
                        status: 'completed',
                        completedAt: getTimeframeFilter(timeframe)
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgCompletionTime: { $avg: '$completionTime' },
                        totalCollections: { $sum: 1 },
                        onTimeCollections: {
                            $sum: { $cond: [{ $lte: ['$completionTime', 30] }, 1, 0] }
                        }
                    }
                }
            ]),
            User.aggregate([
                {
                    $match: { role: 'garbage_collector' }
                },
                {
                    $lookup: {
                        from: 'collections',
                        localField: '_id',
                        foreignField: 'assignedCollector',
                        as: 'collections'
                    }
                },
                {
                    $project: {
                        name: 1,
                        totalCollections: { $size: '$collections' },
                        completedCollections: {
                            $size: {
                                $filter: {
                                    input: '$collections',
                                    as: 'collection',
                                    cond: { $eq: ['$$collection.status', 'completed'] }
                                }
                            }
                        }
                    }
                }
            ]),
            Route.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                collectionEfficiency: collectionEfficiency[0],
                collectorPerformance,
                routeStats: routeStats.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get collection analytics
export const getCollectionAnalytics = async (req, res) => {
    try {
        const [wasteStats, collectionTrends, areaStats] = await Promise.all([
            Collection.aggregate([
                {
                    $group: {
                        _id: '$wasteType',
                        totalCollections: { $sum: 1 },
                        avgFillLevel: { $avg: '$fillLevel' }
                    }
                }
            ]),
            Collection.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: '$createdAt' },
                            year: { $year: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]),
            Collection.aggregate([
                {
                    $group: {
                        _id: '$location.address.area',
                        binCount: { $sum: 1 },
                        avgFillLevel: { $avg: '$fillLevel' }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                wasteStats,
                collectionTrends,
                areaStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get system health status
export const getSystemHealth = async (req, res) => {
    try {
        const [binStatus, collectorStatus, routeStatus] = await Promise.all([
            Collection.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]),
            User.aggregate([
                {
                    $match: { role: 'garbage_collector' }
                },
                {
                    $group: {
                        _id: '$isActive',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Route.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                binStatus,
                collectorStatus,
                routeStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function for timeframe filtering
const getTimeframeFilter = (timeframe) => {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setMonth(now.getMonth() - 1);
    }

    return { $gte: startDate, $lte: now };
};

export const getBins = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};

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
                { 'location.address.street': { $regex: req.query.search, $options: 'i' } },
                { 'location.address.area': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Sorting
        let sortOptions = {};
        if (req.query.sort) {
            const [field, direction] = req.query.sort.split(':');
            sortOptions[field] = direction === 'desc' ? -1 : 1;
        } else {
            sortOptions = { createdAt: -1 };
        }

        // Execute query with pagination
        const bins = await Collection.find(query)
            .populate('assignedCollector', 'name')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Collection.countDocuments(query);

        res.status(200).json({
            success: true,
            data: bins,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new bin
export const createBin = async (req, res) => {
    try {
        const binCount = await Collection.countDocuments();
        const binId = `BIN${(binCount + 1).toString().padStart(5, '0')}`;

        const bin = await Collection.create({
            ...req.body,
            binId,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: bin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update bin
export const updateBin = async (req, res) => {
    try {
        const bin = await Collection.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                updatedBy: req.user.id,
                updatedAt: Date.now()
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('assignedCollector', 'name');

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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete bin
export const deleteBin = async (req, res) => {
    try {
        const bin = await Collection.findById(req.params.id);

        if (!bin) {
            return res.status(404).json({
                success: false,
                message: 'Bin not found'
            });
        }

        // Delete associated data (reports, schedules, etc.)
        await Promise.all([
            Report.deleteMany({ bin: bin._id }),
            Schedule.deleteMany({ bin: bin._id })
        ]);

        await bin.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Bin deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};