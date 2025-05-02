import Collection from '../models/collectionModel.js';
import Route from '../models/routeModel.js';
import Report from '../models/reportModel.js';
import Schedule from '../models/scheduleModel.js';
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

export const getBinDetails = async (req, res) => {
    try {
        const bin = await Collection.findById(req.params.id)
            .populate('assignedCollector', 'name avatar')
            .select('binId location status fillLevel lastCollected');

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

// Get bin collection history with filters
export const getBinHistory = async (req, res) => {
    try {
        const { from, to, status } = req.query;
        
        // Build query
        const query = {
            bin: req.params.id
        };

        // Add date range filter
        if (from || to) {
            query.collectedAt = {};
            if (from) query.collectedAt.$gte = new Date(from);
            if (to) query.collectedAt.$lte = new Date(to);
        }

        // Add status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        const history = await Report.find(query)
            .populate('collector', 'name')
            .sort({ collectedAt: -1 });

        res.status(200).json({
            success: true,
            data: history
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
}
  
export const getCollectorPerformance = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    const timeframeFilter = getTimeframeFilter(timeframe);

    // Get collection stats
    const [collectionStats, routeStats, recentCollections] = await Promise.all([
      Collection.aggregate([
        {
          $match: {
            collectorId: req.user._id,
            createdAt: timeframeFilter,
          }
        },
        {
          $group: {
            _id: null,
            totalCollections: { $sum: 1 },
            completedCollections: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            onTimeCollections: {
              $sum: { $cond: [{ $lte: ['$completionTime', 30] }, 1, 0] }
            },
            avgCompletionTime: { $avg: '$completionTime' },
            totalBins: { $sum: 1 },
            priorityBins: {
              $sum: { $cond: [{ $gte: ['$fillLevel', 80] }, 1, 0] }
            },
            completedPriorityBins: {
              $sum: {
                $cond: [
                  { $and: [
                    { $eq: ['$status', 'completed'] },
                    { $gte: ['$fillLevel', 80] }
                  ]},
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      Route.aggregate([
        {
          $match: {
            collectorId: req.user._id,
            createdAt: timeframeFilter
          }
        },
        {
          $group: {
            _id: null,
            totalRoutes: { $sum: 1 },
            completedRoutes: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]),

      Collection.find({
        collectorId: req.user._id,
        status: 'completed'
      })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('binId', 'binNumber location')
    ]);

    const stats = collectionStats[0] || {
      totalCollections: 0,
      completedCollections: 0,
      onTimeCollections: 0,
      avgCompletionTime: 0,
      totalBins: 0,
      priorityBins: 0,
      completedPriorityBins: 0
    };

    const routes = routeStats[0] || {
      totalRoutes: 0,
      completedRoutes: 0
    };

    // Calculate performance metrics
    const performance = {
      collectionRate: Math.round((stats.completedCollections / Math.max(stats.totalCollections, 1)) * 100),
      avgTime: Math.round(stats.avgCompletionTime || 0),
      punctuality: Math.round((stats.onTimeCollections / Math.max(stats.totalCollections, 1)) * 100),
      efficiency: Math.round(
        ((stats.completedCollections / Math.max(stats.totalCollections, 1)) +
        (stats.onTimeCollections / Math.max(stats.totalCollections, 1))) * 50
      ),
      completedRoutes: routes.completedRoutes,
      totalRoutes: routes.totalRoutes,
      collectedBins: stats.completedCollections,
      totalBins: stats.totalBins,
      priorityCompletionRate: Math.round(
        (stats.completedPriorityBins / Math.max(stats.priorityBins, 1)) * 100
      ),
      recentCollections: recentCollections.map(collection => ({
        _id: collection._id,
        binId: collection.binId?.binNumber || 'N/A',
        collectedAt: collection.completedAt,
        onTime: collection.completionTime <= 30
      }))
    };

    // Calculate achievements based on performance
    const achievements = [
      {
        _id: '1',
        name: 'Collection Master',
        description: 'Complete waste collections',
        target: 100,
        current: stats.completedCollections,
        completed: stats.completedCollections >= 100
      },
      {
        _id: '2',
        name: 'Speed Demon',
        description: 'Maintain quick collection times',
        target: 20,
        current: Math.min(20, Math.max(0, 20 - (performance.avgTime - 10))),
        completed: performance.avgTime <= 10
      },
      {
        _id: '3',
        name: 'Priority Handler',
        description: 'Handle high-priority bins',
        target: 50,
        current: stats.completedPriorityBins,
        completed: performance.priorityCompletionRate >= 90
      },
      {
        _id: '4',
        name: 'Route Champion',
        description: 'Complete collection routes',
        target: routes.totalRoutes,
        current: routes.completedRoutes,
        completed: routes.completedRoutes === routes.totalRoutes && routes.totalRoutes > 0
      },
      {
        _id: '5',
        name: 'Punctuality Pro',
        description: 'Maintain on-time collections',
        target: 100,
        current: performance.punctuality,
        completed: performance.punctuality >= 90
      }
    ];

    res.json({
      success: true,
      data: {
        ...performance,
        achievements
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// Helper function to get date filter
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

// Get collector's routes with status filter
export const getCollectorRoutes = async (req, res) => {
    try {
        const query = {
            collector: req.user.id
        };

        // Apply status filter
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        const routes = await Route.find(query)
            .populate('bins.bin', 'binId location fillLevel wasteType')
            .sort({ createdAt: -1 });

        // Calculate additional stats for each route
        const routesWithStats = routes.map(route => {
            const completedBins = route.bins.filter(bin => bin.isCollected).length;
            const priorityBins = route.bins.filter(bin => bin.bin.fillLevel > 80).length;
            
            return {
                _id: route._id,
                name: route.name,
                routeNumber: route.routeNumber,
                status: route.status,
                bins: route.bins,
                estimatedTime: route.estimatedTime,
                completedBins,
                priorityBins,
                completionRate: Math.round((completedBins / route.bins.length) * 100),
                distance: route.distance,
                startedAt: route.startedAt,
                completedAt: route.completedAt
            };
        });

        res.status(200).json({
            success: true,
            data: routesWithStats
        });
    } catch (error) {
        handleError(res, error);
    }
};

// Update route status
export const updateRouteStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const route = await Route.findOne({ 
            _id: req.params.id,
            collector: req.user.id
        });

        if (!route) {
            return res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        }

        // Update status and timestamps
        route.status = status;
        if (status === 'in_progress' && !route.startedAt) {
            route.startedAt = new Date();
        }
        if (status === 'completed' && !route.completedAt) {
            route.completedAt = new Date();
        }

        await route.save();

        res.status(200).json({
            success: true,
            data: route
        });
    } catch (error) {
        handleError(res, error);
    }
};


export const getCollectorStats = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const [todayCollections, completionRate, activeRoutes, avgResponseTime] = await Promise.all([
        Collection.countDocuments({
          collectorId: req.user._id,
          collectionDate: { $gte: today }
        }),
        Collection.aggregate([
          {
            $match: { collectorId: req.user._id }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              }
            }
          }
        ]),
        Route.countDocuments({
          collectorId: req.user._id,
          status: 'in_progress'
        }),
        Report.aggregate([
          {
            $match: {
              collectorId: req.user._id,
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              avgTime: { $avg: '$completionTime' }
            }
          }
        ])
      ]);
  
      const rate = completionRate[0] ? (completionRate[0].completed / completionRate[0].total) * 100 : 0;
  
      res.json({
        success: true,
        data: {
          todayCollections,
          completionRate: Math.round(rate),
          activeRoutes,
          avgResponseTime: Math.round(avgResponseTime[0]?.avgTime || 0)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Get recent collections
  export const getRecentCollections = async (req, res) => {
    try {
      const collections = await Collection.find({
        collectorId: req.user._id
      })
      .sort({ collectionDate: -1 })
      .limit(5)
      .populate('binId', 'binNumber location');
  
      res.json({
        success: true,
        data: collections
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Get upcoming schedules
  export const getUpcomingSchedules = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const schedules = await Schedule.find({
        collectorId: req.user._id,
        scheduledDate: { $gte: today },
        status: 'pending'
      })
      .sort({ scheduledDate: 1 })
      .limit(5)
      .populate('binId', 'binNumber location');
  
      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Get urgent bins
  export const getUrgentBins = async (req, res) => {
    try {
      const urgentBins = await Collection.find({
        collectorId: req.user._id,
        fillLevel: { $gte: 80 },
        status: { $ne: 'completed' }
      })
      .sort({ fillLevel: -1 })
      .limit(5)
      .populate('binId', 'binNumber location');
  
      res.json({
        success: true,
        data: urgentBins
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Get collector performance
  export const getPerformance = async (req, res) => {
    try {
      const [routeStats, collectionStats] = await Promise.all([
        Route.aggregate([
          {
            $match: { collectorId: req.user._id }
          },
          {
            $group: {
              _id: null,
              totalRoutes: { $sum: 1 },
              completedRoutes: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              }
            }
          }
        ]),
        Collection.aggregate([
          {
            $match: { collectorId: req.user._id }
          },
          {
            $group: {
              _id: null,
              collectionRate: {
                $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 100, 0] }
              },
              punctuality: {
                $avg: { $cond: [{ $lte: ['$completionTime', 30] }, 100, 0] }
              }
            }
          }
        ])
      ]);
  
      res.json({
        success: true,
        data: {
          completedRoutes: routeStats[0]?.completedRoutes || 0,
          totalRoutes: routeStats[0]?.totalRoutes || 0,
          collectionRate: Math.round(collectionStats[0]?.collectionRate || 0),
          punctuality: Math.round(collectionStats[0]?.punctuality || 0)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };