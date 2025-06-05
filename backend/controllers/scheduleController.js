import Schedule from '../models/scheduleModel.js';
import Collection from '../models/collectionModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
export const getSchedules = async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Filters
    const filter = {};
    if (req.query.collector) filter.collector = req.query.collector;
    if (req.query.bin) filter.bin = req.query.bin;
    if (req.query.startDate || req.query.endDate) {
        filter.scheduledDate = {};
        if (req.query.startDate)
            filter.scheduledDate.$gte = new Date(req.query.startDate);
        if (req.query.endDate)
            filter.scheduledDate.$lte = new Date(req.query.endDate);
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.minPriority)
        filter.priority = { $gte: parseInt(req.query.minPriority) };

    // Sorting (default by scheduledDate asc, priority desc)
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    } else {
        sort.scheduledDate = 1;
        sort.priority = -1;
    }

    const total = await Schedule.countDocuments(filter);
    const schedules = await Schedule.find(filter)
        .populate("bin", "binId location fillLevel wasteType")
        .populate("collector", "name avatar")
        .populate("assignedBy", "name role")
        .populate("route", "name")
        .sort(sort)
        .skip(startIndex)
        .limit(limit);
    
    res.status(200).json({
        success: true,
        count: schedules.length,
        total,
        data: schedules,
    });
};

// @desc    Get single schedule
// @route   GET /api/schedules/:id
// @access  Private
export const getSchedule = async (req, res) => {
    const schedule = await Schedule.findById(req.params.id)
        .populate('bin', 'binId location fillLevel wasteType')
        .populate('collector', 'name avatar phone')
        .populate('assignedBy', 'name role')
        .populate('route', 'name')
        .populate('completionDetails.report', 'status wasteVolume');
    
    if (!schedule) {
        throw new Error(`Schedule not found with id of ${req.params.id}`, 404);
    }
    
    res.status(200).json({
        success: true,
        data: schedule
    });
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private/Admin
export const createSchedule = async (req, res) => {
    // Add assigner
    req.body.assignedBy = req.user.id;
    
    // Check if required fields are provided
    if (!req.body.bin || !req.body.collector || !req.body.scheduledDate) {
        throw new Error('Please provide bin, collector, and scheduled date', 400);
    }
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
        throw new Error('Only admins can create schedules', 403);
    }
    
    // Check if bin exists
    const bin = await Collection.findById(req.body.bin);
    if (!bin) {
        throw new Error(`Bin not found with id of ${req.body.bin}`, 404);
    }
    
    // Check if collector exists and has the right role
    const collector = await User.findOne({ 
        _id: req.body.collector, 
        role: 'garbage_collector' 
    });
    
    if (!collector) {
        throw new Error('Invalid garbage collector', 404);
    }
    
    // Set estimated fill level if not provided
    if (!req.body.estimatedFillLevel) {
        req.body.estimatedFillLevel = bin.fillLevel;
    }
    
    // Set priority based on fill level if not provided
    if (!req.body.priority) {
        if (bin.fillLevel >= 80) {
            req.body.priority = 10;
        } else if (bin.fillLevel >= 60) {
            req.body.priority = 7;
        } else if (bin.fillLevel >= 40) {
            req.body.priority = 5;
        } else {
            req.body.priority = 3;
        }
    }
    
    const schedule = await Schedule.create(req.body);
    
    // Update bin's collection schedule
    await Collection.findByIdAndUpdate(req.body.bin, {
        collectionSchedule: req.body.scheduledDate,
        assignedCollector: req.body.collector
    });
    
    // Create notification for collector
    await Notification.createNotification({
        recipient: req.body.collector,
        type: 'collection_scheduled',
        title: 'New Collection Scheduled',
        message: `You have been scheduled to collect bin ${bin.binId} on ${new Date(req.body.scheduledDate).toLocaleDateString()}.`,
        priority: 'high',
        icon: 'calendar',
        relatedTo: {
            bin: bin._id,
            schedule: schedule._id
        },
        action: {
            text: 'View Schedule',
            url: `/collector/schedule/${schedule._id}`
        }
    });
    
    res.status(201).json({
        success: true,
        data: schedule
    });
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private/Admin
export const updateSchedule = async (req, res) => {
    let schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
        throw new Error(`Schedule not found with id of ${req.params.id}`, 404);
    }
    
    // Check user is admin
    if (req.user.role !== 'admin') {
        throw new Error('Not authorized to update schedules', 403);
    }
    
    // Fields to update
    const fieldsToUpdate = {
        collector: req.body.collector,
        scheduledDate: req.body.scheduledDate,
        timeSlot: req.body.timeSlot,
        status: req.body.status,
        priority: req.body.priority,
        estimatedFillLevel: req.body.estimatedFillLevel,
        recurrence: req.body.recurrence,
        recurrenceEndDate: req.body.recurrenceEndDate,
        notes: req.body.notes,
        isOptimized: req.body.isOptimized,
        updatedBy: req.user.id
    };

    // Handle route field separately
    if (req.body.route && req.body.route !== '') {
        fieldsToUpdate.route = req.body.route;
    } else {
        fieldsToUpdate.route = null; // Set to null if empty or not provided
    }
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // If collector changed, update the bin
    if (fieldsToUpdate.collector && fieldsToUpdate.collector !== schedule.collector.toString()) {
        // Check if collector exists and has the right role
        const collector = await User.findOne({ 
            _id: fieldsToUpdate.collector, 
            role: 'garbage_collector' 
        });
        
        if (!collector) {
            throw new Error('Invalid garbage collector', 404);
        }
        
        // Update bin with new collector
        await Collection.findByIdAndUpdate(schedule.bin, {
            assignedCollector: fieldsToUpdate.collector
        });
        
        // Create notification for new collector
        await Notification.createNotification({
            recipient: fieldsToUpdate.collector,
            type: 'collection_scheduled',
            title: 'Collection Assigned',
            message: `You have been assigned to collect bin ${(await Collection.findById(schedule.bin)).binId} on ${new Date(schedule.scheduledDate).toLocaleDateString()}.`,
            priority: 'high',
            icon: 'calendar',
            relatedTo: {
                bin: schedule.bin,
                schedule: schedule._id
            }
        });
    }
    
    // If scheduled date changed, update the bin
    if (fieldsToUpdate.scheduledDate) {
        await Collection.findByIdAndUpdate(schedule.bin, {
            collectionSchedule: fieldsToUpdate.scheduledDate
        });
    }
    
    schedule = await Schedule.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: schedule
    });
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
export const deleteSchedule = async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
        throw new Error(`Schedule not found with id of ${req.params.id}`, 404);
    }
    
    // Check user is admin
    if (req.user.role !== 'admin') {
        throw new Error('Not authorized to delete schedules', 403);
    }
    
    // If schedule is pending, update bin's collection schedule
    if (schedule.status === 'pending') {
        await Collection.findByIdAndUpdate(schedule.bin, {
            collectionSchedule: null
        });
    }
    
    await schedule.deleteOne();
    
    res.status(200).json({
        success: true,
        data: {}
    });
};


// @desc    Complete schedule
// @route   PUT /api/schedules/:id/complete
// @access  Private/Garbage Collector
export const completeSchedule = async (req, res) => {
    const { fillLevel, collectionTime, reportId } = req.body;
    if (!fillLevel) throw new Error("Please provide fill level", 400);

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) throw new Error(`Schedule not found with id of ${req.params.id}`, 404);
    if (schedule.collector.toString() !== req.user.id)
        throw new Error("Not authorized to complete this schedule", 403);
    if (schedule.status !== "pending")
        throw new Error("Schedule is not in pending status", 400);

    schedule.status = "completed";
    schedule.completionDetails = {
        completedAt: new Date(),
        actualFillLevel: fillLevel,
        collectionTime: collectionTime || null,
        report: reportId || null,
    };
    await schedule.save();

    // Update bin data
    await Collection.findByIdAndUpdate(schedule.bin, {
        status: "collected",
        fillLevel: 0,
        lastCollected: new Date(),
    });

    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
        await Notification.createNotification({
            recipient: admin._id,
            type: "collection_completed",
            title: "Schedule Completed",
            message: `Schedule for bin ${(await Collection.findById(schedule.bin)).binId} has been completed.`,
            priority: "medium",
            icon: "check-circle",
            relatedTo: { bin: schedule.bin, schedule: schedule._id },
        });
    }
    
    // Generate next schedule if recurrence is set
    if (schedule.recurrence !== "none") {
        const nextDate = new Date(schedule.scheduledDate);
        switch (schedule.recurrence) {
            case "daily":
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case "weekly":
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case "biweekly":
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case "monthly":
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }
        if (!schedule.recurrenceEndDate || nextDate <= schedule.recurrenceEndDate) {
            const newSchedule = new Schedule({
                bin: schedule.bin,
                collector: schedule.collector,
                scheduledDate: nextDate,
                timeSlot: schedule.timeSlot,
                priority: schedule.priority,
                route: schedule.route,
                recurrence: schedule.recurrence,
                recurrenceEndDate: schedule.recurrenceEndDate,
                notes: schedule.notes,
                assignedBy: schedule.assignedBy,
            });
            await newSchedule.save();
            await Collection.findByIdAndUpdate(schedule.bin, {
                collectionSchedule: nextDate,
            });
        }
    }

    res.status(200).json({
        success: true,
        data: schedule,
    });
};

// @desc    Reschedule collection
// @route   PUT /api/schedules/:id/reschedule
// @access  Private/Admin or Garbage Collector
export const rescheduleCollection = async (req, res) => {
    const { newDate, reason } = req.body;
    if (!newDate) throw new Error("Please provide new date", 400);

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) throw new Error(`Schedule not found with id of ${req.params.id}`, 404);
    if (req.user.role !== "admin" && schedule.collector.toString() !== req.user.id)
        throw new Error("Not authorized to reschedule this collection", 403);
    if (schedule.status === "completed")
        throw new Error("Cannot reschedule a completed schedule", 400);

    schedule.status = "rescheduled";
    schedule.updatedBy = req.user.id;
    await schedule.save();

    const newSchedule = new Schedule({
        bin: schedule.bin,
        collector: schedule.collector,
        scheduledDate: new Date(newDate),
        timeSlot: schedule.timeSlot,
        priority: schedule.priority,
        route: schedule.route,
        recurrence: schedule.recurrence,
        recurrenceEndDate: schedule.recurrenceEndDate,
        notes: `Rescheduled from ${schedule.scheduledDate.toLocaleDateString()}. ${reason || ""}\n${schedule.notes || ""}`.trim(),
        assignedBy: req.user.id,
    });
    await newSchedule.save();

    await Collection.findByIdAndUpdate(schedule.bin, {
        collectionSchedule: new Date(newDate),
    });

    if (req.user.role === "admin") {
        await Notification.createNotification({
            recipient: schedule.collector,
            type: "collection_scheduled",
            title: "Collection Rescheduled",
            message: `Your collection for bin ${(await Collection.findById(schedule.bin)).binId} has been rescheduled to ${new Date(newDate).toLocaleDateString()}.`,
            priority: "high",
            icon: "calendar",
            relatedTo: { bin: schedule.bin, schedule: newSchedule._id },
        });
    }
    if (req.user.role === "garbage_collector") {
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
            await Notification.createNotification({
                recipient: admin._id,
                type: "collection_scheduled",
                title: "Collection Rescheduled by Collector",
                message: `Collection for bin ${(await Collection.findById(schedule.bin)).binId} has been rescheduled to ${new Date(newDate).toLocaleDateString()} by ${req.user.name}.`,
                priority: "medium",
                icon: "calendar",
                relatedTo: { bin: schedule.bin, schedule: newSchedule._id },
            });
        }
    }

    res.status(200).json({
        success: true,
        data: { oldSchedule: schedule, newSchedule },
    });
};

export const getCollectorUpcomingSchedules = async (req, res) => {
    try {
        // Verify collector authorization
        if (req.user.role !== "garbage_collector") {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this data"
            });
        }

        // Get date range from query params or use current month
        const { startDate, endDate } = req.query;
        const queryStartDate = startDate ? new Date(startDate) : new Date();
        const queryEndDate = endDate ? new Date(endDate) : new Date();

        // Set time to start and end of day respectively
        queryStartDate.setHours(0, 0, 0, 0);
        queryEndDate.setHours(23, 59, 59, 999);

        // Build query
        const query = {
            collector: req.user.id,
            scheduledDate: {
                $gte: queryStartDate,
                $lte: queryEndDate
            }
        };

        // Get schedules with populated data
        const schedules = await Schedule.find(query)
            .populate({
                path: 'bin',
                select: 'binId location fillLevel wasteType status',
                populate: {
                    path: 'location',
                    select: 'address coordinates'
                }
            })
            .populate({
                path: 'route',
                select: 'name routeNumber'
            })
            .sort({ scheduledDate: 1, priority: -1 });

        // Format schedules for calendar view
        const formattedSchedules = schedules.map(schedule => ({
            _id: schedule._id,
            scheduledDate: schedule.scheduledDate,
            status: schedule.status,
            priority: schedule.priority,
            timeSlot: schedule.timeSlot,
            bin: {
                _id: schedule.bin._id,
                binId: schedule.bin.binId,
                location: {
                    address: schedule.bin.location?.address || {},
                    coordinates: schedule.bin.location?.coordinates || []
                },
                fillLevel: schedule.bin.fillLevel,
                wasteType: schedule.bin.wasteType,
                status: schedule.bin.status
            },
            route: schedule.route ? {
                _id: schedule.route._id,
                name: schedule.route.name,
                routeNumber: schedule.route.routeNumber
            } : null,
            notes: schedule.notes,
            estimatedDuration: schedule.estimatedDuration,
            completionDetails: schedule.completionDetails || null
        }));

        // Group schedules by date for easier frontend processing
        const groupedSchedules = formattedSchedules.reduce((acc, schedule) => {
            const date = schedule.scheduledDate.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(schedule);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                schedules: formattedSchedules,
                groupedSchedules,
                total: schedules.length,
                dateRange: {
                    start: queryStartDate,
                    end: queryEndDate
                }
            }
        });

    } catch (error) {
        console.error('Error in getCollectorUpcomingSchedules:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching collector schedules',
            error: error.message
        });
    }
};

// @desc    Get schedule statistics
// @route   GET /api/schedules/stats
// @access  Private/Admin
export const getScheduleStats = async (req, res) => {
    if (req.user.role !== "admin")
        throw new Error("Not authorized to access this data", 403);
    const schedulesByStatus = await Schedule.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const schedulesByRecurrence = await Schedule.aggregate([
        { $group: { _id: "$recurrence", count: { $sum: 1 } } },
    ]);
    const schedulesByMonth = await Schedule.aggregate([
        {
            $group: {
                _id: { month: { $month: "$scheduledDate" }, year: { $year: "$scheduledDate" } },
                count: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                missed: { $sum: { $cond: [{ $eq: ["$status", "missed"] }, 1, 0] } },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    const topCollectorsAgg = await Schedule.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$collector", completedCount: { $sum: 1 } } },
        { $sort: { completedCount: -1 } },
        { $limit: 5 },
    ]);
    const populatedCollectors = await User.populate(topCollectorsAgg, {
        path: "_id",
        select: "name avatar",
    });
    const formattedCollectors = populatedCollectors.map((item) => ({
        collector: item._id,
        completedCount: item.completedCount,
    }));
    const formattedStatusCounts = {};
    schedulesByStatus.forEach((item) => {
        formattedStatusCounts[item._id] = item.count;
    });
    const formattedRecurrenceCounts = {};
    schedulesByRecurrence.forEach((item) => {
        formattedRecurrenceCounts[item._id] = item.count;
    });
    res.status(200).json({
        success: true,
        data: {
            totalSchedules: await Schedule.countDocuments(),
            pendingSchedules: await Schedule.countDocuments({ status: "pending" }),
            completedSchedules: await Schedule.countDocuments({ status: "completed" }),
            missedSchedules: await Schedule.countDocuments({ status: "missed" }),
            statusCounts: formattedStatusCounts,
            recurrenceCounts: formattedRecurrenceCounts,
            schedulesByMonth,
            topCollectors: formattedCollectors,
        },
    });
};