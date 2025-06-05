import Report from '../models/reportModel.js';
import Collection from '../models/collectionModel.js';
import Notification from '../models/notificationModel.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { getTimeframeFilter } from '../utils/dateUtils.js';

const formatAddress = (location) => {
    if (!location || !location.address) return 'No address available';
    const { street, area, landmark, city, postalCode } = location.address;
    return [street, area, landmark, city, postalCode].filter(Boolean).join(', ');
};

export const getReports = async (req, res) => {
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

    // Filter by bin
    if (req.query.bin) {
        filter.bin = req.query.bin;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
        filter.collectionDate = {};
        if (req.query.startDate) {
            filter.collectionDate.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filter.collectionDate.$lte = new Date(req.query.endDate);
        }
    }

    // Filter by status
    if (req.query.status) {
        filter.status = req.query.status;
    }

    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.collectionDate = -1;
    }

    const total = await Report.countDocuments(filter);

    const reports = await Report.find(filter)
        .populate('bin', 'binId location fillLevel wasteType')
        .populate('collector', 'name avatar')
        .populate('reviewedBy', 'name role')
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
        count: reports.length,
        pagination,
        total,
        data: reports
    });
};

export const getReport = async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('bin', 'binId location fillLevel wasteType')
        .populate('collector', 'name avatar')
        .populate('reviewedBy', 'name role');

    if (!report) {
        throw new Error(`Report not found with id of ${req.params.id}`, 404);
    }

    res.status(200).json({
        success: true,
        data: report
    });
};

export const createReport = async (req, res) => {
    try {
        req.body.collector = req.user.id;

        const imageUrls = {
            photoBefore: null,
            photoAfter: null
        };

        if (req.files) {
            if (req.files.photoBefore && req.files.photoBefore[0]) {
                try {
                    const beforeResult = await uploadImage(req.files.photoBefore[0], 'cleanbage/reports');
                    imageUrls.photoBefore = {
                        public_id: beforeResult.public_id,
                        url: beforeResult.secure_url
                    };
                } catch (error) {
                    throw new Error(`Error uploading before photo: ${error.message}`);
                }
            }

            if (req.files.photoAfter && req.files.photoAfter[0]) {
                try {
                    const afterResult = await uploadImage(req.files.photoAfter[0], 'cleanbage/reports');
                    imageUrls.photoAfter = {
                        public_id: afterResult.public_id,
                        url: afterResult.secure_url
                    };
                } catch (error) {
                    if (imageUrls.photoBefore?.public_id) {
                        await deleteImage(imageUrls.photoBefore.public_id);
                    }
                    throw new Error(`Error uploading after photo: ${error.message}`);
                }
            }
        }

        const wasteCategories = typeof req.body.wasteCategories === 'string'
            ? JSON.parse(req.body.wasteCategories)
            : req.body.wasteCategories;

        const weather = typeof req.body.weather === 'string'
            ? JSON.parse(req.body.weather)
            : req.body.weather;

        const reportData = {
            bin: req.body.bin,
            collector: req.user.id,
            collectionDate: new Date(),
            startTime: new Date(),
            status: req.body.status,
            wasteVolume: Number(req.body.wasteVolume),
            wasteMeasurementUnit: req.body.wasteMeasurementUnit,
            wasteCategories: wasteCategories,
            fillLevelBefore: Number(req.body.fillLevelBefore),
            fillLevelAfter: Number(req.body.fillLevelAfter),
            photoBefore: imageUrls.photoBefore,
            photoAfter: imageUrls.photoAfter,
            issues: req.body.issues,
            maintenanceNeeded: req.body.maintenanceNeeded === 'true',
            maintenanceDetails: req.body.maintenanceDetails,
            weather: weather,
            locationConfirmed: req.body.locationConfirmed === 'true',
            notes: req.body.notes,
        };

        const report = await Report.create(reportData);

        // Update bin status
        await Collection.findByIdAndUpdate(req.body.bin, {
            lastCollectionReport: report._id,
            lastCollected: new Date(),
            status: req.body.status === 'completed' ? 'collected' : req.body.status,
            fillLevel: Number(req.body.fillLevelAfter) || 0
        });

        res.status(201).json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error("Error creating report:", error);

        // Delete uploaded images if report creation fails
        if (req.files) {
            if (req.files.photoBefore && req.files.photoBefore[0]?.public_id) {
                await deleteImage(req.files.photoBefore[0].public_id);
            }
            if (req.files.photoAfter && req.files.photoAfter[0]?.public_id) {
                await deleteImage(req.files.photoAfter[0].public_id);
            }
        }

        res.status(500).json({
            success: false,
            message: error.message || "Error creating report"
        });
    }
};

export const updateReport = async (req, res) => {
    let report = await Report.findById(req.params.id);
    if (!report) {
        throw new Error(`Report not found with id of ${req.params.id}`, 404);
    }

    // Check user is admin or the report creator
    if (req.user.role !== 'admin' && report.collector.toString() !== req.user.id) {
        throw new Error('Not authorized to update this report', 403);
    }

    // Fields that can be updated by collector
    let fieldsToUpdate = {};

    if (req.user.role === 'garbage_collector') {
        fieldsToUpdate = {
            wasteVolume: req.body.wasteVolume,
            wasteCategories: req.body.wasteCategories,
            fillLevelAfter: req.body.fillLevelAfter,
            issues: req.body.issues,
            maintenanceNeeded: req.body.maintenanceNeeded,
            maintenanceDetails: req.body.maintenanceDetails,
            status: req.body.status,
            endTime: req.body.status === 'completed' ? new Date() : report.endTime
        };
    } else if (req.user.role === 'admin') {
        // Additional fields that can be updated by admin
        fieldsToUpdate = {
            ...fieldsToUpdate,
            reviewedBy: req.user.id,
            reviewDate: new Date(),
            reviewNotes: req.body.reviewNotes,
            efficiency: req.body.efficiency
        };
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    console.log(req.files.photoAfter);
    // Process after photo if provided
    if (req.files && req.files.photoAfter) {
        const file = req.files.photoAfter;

        try {
            // Delete previous after photo if exists
            if (report.photoAfter && report.photoAfter.public_id) {
                await deleteImage(report.photoAfter.public_id);
            }

            // Upload to cloudinary
            const result = await uploadImage(file, 'cleanbage/reports');

            fieldsToUpdate.photoAfter = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Problem with file upload', 500);
        }
    }

    report = await Report.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    // Update bin status if report status changed to completed
    if (fieldsToUpdate.status === 'completed' && report.status === 'completed') {
        await Collection.findByIdAndUpdate(report.bin, {
            status: 'collected',
            fillLevel: fieldsToUpdate.fillLevelAfter || 0,
            lastCollected: report.collectionDate
        });
    }

    res.status(200).json({
        success: true,
        data: report
    });
};

export const deleteReport = async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        throw new Error(`Report not found with id of ${req.params.id}`, 404);
    }

    // Check user is admin
    if (req.user.role !== 'admin') {
        throw new Error('Not authorized to delete reports', 403);
    }

    // Delete images from cloudinary
    if (report.photoBefore && report.photoBefore.public_id) {
        await deleteImage(report.photoBefore.public_id);
    }
    if (report.photoAfter && report.photoAfter.public_id) {
        await deleteImage(report.photoAfter.public_id);
    }

    await report.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
};

export const submitFeedback = async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating) {
        throw new Error('Please provide a rating', 400);
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
        throw new Error(`Report not found with id of ${req.params.id}`, 404);
    }

    // Check user is admin
    if (req.user.role !== 'admin') {
        throw new Error('Not authorized to submit feedback on reports', 403);
    }

    report.feedback = {
        rating: parseInt(rating),
        comment: comment || '',
        givenBy: req.user.id,
        givenAt: new Date()
    };

    await report.save();

    // Create notification for collector
    await Notification.createNotification({
        recipient: report.collector,
        type: 'feedback_response',
        title: 'Feedback on Your Collection Report',
        message: `An admin has provided feedback on your collection report for bin ${(await Collection.findById(report.bin)).binId}.`,
        priority: 'medium',
        icon: 'message-square',
        relatedTo: {
            report: report._id
        }
    });

    res.status(200).json({
        success: true,
        data: report
    });
};

export const getReportsByCollector = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        // Build filter object
        const filter = {
            collector: req.user.id // Only get reports for current collector
        };

        // Add status filter
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }

        // Add date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.collectionDate = {};
            if (req.query.startDate) {
                filter.collectionDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.collectionDate.$lte = new Date(req.query.endDate);
            }
        }

        // Add search filter
        if (req.query.search) {
            filter.$or = [
                { 'bin.binId': new RegExp(req.query.search, 'i') },
                { notes: new RegExp(req.query.search, 'i') }
            ];
        }

        // Build sort object based on frontend sort config
        let sort = {};
        if (req.query.sort) {
            const [field, direction] = req.query.sort.split(':');
            sort[field] = direction === 'desc' ? -1 : 1;
        } else {
            sort.collectionDate = -1; // Default sort by date desc
        }

        // Execute query with population
        const reports = await Report.find(filter)
            .populate({
                path: 'bin',
                select: 'binId location fillLevel wasteType'
            })
            .populate({
                path: 'collector',
                select: 'name avatar'
            })
            .sort(sort)
            .skip(startIndex)
            .limit(limit);

        // Get total count for pagination
        const totalCount = await Report.countDocuments(filter);

        // Format response to match frontend expectations
        const formattedReports = reports.map(report => ({
            _id: report._id,
            collectionDate: report.collectionDate,
            startTime: report.startTime,
            endTime: report.endTime,
            status: report.status,
            bin: {
                binId: report.bin?.binId,
                location: report.bin?.location,
                fillLevel: report.bin?.fillLevel
            },
            wasteVolume: report.wasteVolume,
            wasteCategories: report.wasteCategories,
            fillLevelBefore: report.fillLevelBefore,
            fillLevelAfter: report.fillLevelAfter,
            issues: report.issues,
            maintenanceNeeded: report.maintenanceNeeded,
            maintenanceDetails: report.maintenanceDetails,
            weather: report.weather,
            notes: report.notes,
            photos: {
                before: report.photoBefore,
                after: report.photoAfter
            },
            completionTime: report.completionTime
        }));

        res.status(200).json({
            success: true,
            reports: reports,
            totalCount,
            page,
            totalPages: Math.ceil(totalCount / limit)
        });

    } catch (error) {
        console.error('Error fetching collector reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reports'
        });
    }
};

export const getReportStats = async (req, res) => {
    try {
        // Get timeframe filter
        const { timeframe = 'month' } = req.query;
        const timeframeFilter = getTimeframeFilter(timeframe);

        // Add timeframe to all aggregations
        const baseMatch = {
            createdAt: timeframeFilter
        };

        // Get reports over time
        const reportsOverTime = await Report.aggregate([
            {
                $match: baseMatch
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    total: { $sum: 1 },
                    completed: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    total: 1,
                    completed: 1
                }
            }
        ]);

        // Get waste categories total
        const wasteCategories = await Report.aggregate([
            {
                $match: {
                    ...baseMatch,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    organic: { $sum: '$wasteCategories.organic' },
                    recyclable: { $sum: '$wasteCategories.recyclable' },
                    nonRecyclable: { $sum: '$wasteCategories.nonRecyclable' },
                    hazardous: { $sum: '$wasteCategories.hazardous' }
                }
            }
        ]);

        // Get overall stats
        const stats = await Report.aggregate([
            {
                $match: baseMatch
            },
            {
                $group: {
                    _id: null,
                    totalReports: { $sum: 1 },
                    completedReports: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalWasteVolume: { $sum: '$wasteVolume' },
                    avgEfficiency: { $avg: '$efficiency' }
                }
            }
        ]);

        const result = {
            totalReports: stats[0]?.totalReports || 0,
            completedReports: stats[0]?.completedReports || 0,
            totalWasteVolume: Number((stats[0]?.totalWasteVolume || 0).toFixed(1)),
            avgEfficiency: Math.round(stats[0]?.avgEfficiency || 0),
            wasteCategories: wasteCategories[0] ? {
                organic: Number(wasteCategories[0].organic.toFixed(1)),
                recyclable: Number(wasteCategories[0].recyclable.toFixed(1)),
                nonRecyclable: Number(wasteCategories[0].nonRecyclable.toFixed(1)),
                hazardous: Number(wasteCategories[0].hazardous.toFixed(1))
            } : {
                organic: 0,
                recyclable: 0,
                nonRecyclable: 0,
                hazardous: 0
            },
            reportsOverTime
        };

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting report stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting report statistics'
        });
    }
};

export const getReportHistory = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        // Build filter object
        const filter = {
            collector: req.user.id // Only get reports for current collector
        };

        // Add status filter
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }

        // Add date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        // Add search filter
        if (req.query.search) {
            filter.$or = [
                { 'bin.binId': new RegExp(req.query.search, 'i') },
                { 'bin.location.address': new RegExp(req.query.search, 'i') }
            ];
        }

        // Build sort object
        const sort = {};
        if (req.query.sort) {
            const [field, order] = req.query.sort.split(':');
            sort[field] = order === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1; // Default sort by date desc
        }

        // Execute query
        const total = await Report.countDocuments(filter);
        const reports = await Report.find(filter)
            .populate('bin', 'binId location fillLevel')
            .sort(sort)
            .skip(startIndex)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: reports,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching report history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report history'
        });
    }
};

export const exportReports = async (req, res) => {
    try {
        const { format: exportFormat, startDate, endDate, status } = req.query;

        if (!['csv', 'excel'].includes(exportFormat)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid export format'
            });
        }

        // Build filter object
        const filter = {};

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        if (status && status !== 'all') {
            filter.status = status;
        }

        const reports = await Report.find(filter)
            .populate('collector', 'name')
            .populate('bin', 'binId location')
            .sort({ createdAt: -1 });

        if (reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No reports found matching the criteria'
            });
        }

        const reportData = reports.map(report => ({
            Date: format(new Date(report.createdAt), "yyyy-MM-dd HH:mm:ss"),
            "Bin ID": report.bin.binId,
            "Location": formatAddress(report.bin.location),
            "Collector": report.collector.name,
            "Status": report.status,
            "Waste Volume": `${report.wasteVolume} ${report.wasteMeasurementUnit}`,
            "Fill Level Before": `${report.fillLevelBefore}%`,
            "Fill Level After": `${report.fillLevelAfter}%`,
            "Issues": report.issues || 'None',
            "Maintenance Required": report.maintenanceNeeded ? 'Yes' : 'No',
            "Weather": `${report.weather?.condition || 'Unknown'} ${report.weather?.temperature ? `(${report.weather.temperature}°C)` : ''}`
        }));

        if (exportFormat === 'csv') {
            const csv = Papa.unparse(reportData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=reports-${format(new Date(), "yyyy-MM-dd")}.csv`);
            return res.send(csv);
        }

        // Excel export
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reports');

        // Add headers
        worksheet.columns = Object.keys(reportData[0]).map(key => ({
            header: key,
            key,
            width: 20
        }));

        // Add data
        worksheet.addRows(reportData);

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=reports-${format(new Date(), "yyyy-MM-dd")}.xlsx`);

        await workbook.xlsx.write(res);
        return res.end();

    } catch (error) {
        console.error('Error exporting reports:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error exporting reports'
        });
    }
};

export const getTopCollectors = async (req, res) => {
    try {
        const { timeframe = 'month', limit = 10 } = req.query;
        const timeframeFilter = getTimeframeFilter(timeframe);

        const topCollectors = await Report.aggregate([
            {
                $match: {
                    createdAt: timeframeFilter
                }
            },
            {
                $group: {
                    _id: '$collector',
                    totalCollections: { $sum: 1 },
                    completedCollections: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalVolume: { $sum: '$wasteVolume' },
                    onTimeCollections: {
                        $sum: { $cond: [{ $lte: ['$completionTime', 30] }, 1, 0] }
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
                    totalCollections: 1,
                    completedCollections: 1,
                    totalVolume: 1,
                    efficiency: {
                        $multiply: [
                            {
                                $divide: [
                                    {
                                        $add: [
                                            { $divide: ['$completedCollections', { $max: ['$totalCollections', 1] }] },
                                            { $divide: ['$onTimeCollections', { $max: ['$totalCollections', 1] }] }
                                        ]
                                    },
                                    2
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { efficiency: -1, totalVolume: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.status(200).json({
            success: true,
            data: topCollectors.map(collector => ({
                ...collector,
                efficiency: Math.round(collector.efficiency || 0),
                totalVolume: Number(collector.totalVolume.toFixed(1))
            }))
        });

    } catch (error) {
        console.error('Error getting top collectors:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching top collectors data'
        });
    }
};