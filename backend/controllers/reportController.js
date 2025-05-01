import Report from '../models/reportModel.js';
import Collection from '../models/collectionModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

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

        // Handle photo uploads
        const imageUrls = {
            photoBefore: null,
            photoAfter: null
        };

        if (req.files) {
            // Handle before photo
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

            // Handle after photo
            if (req.files.photoAfter && req.files.photoAfter[0]) {
                try {
                    const afterResult = await uploadImage(req.files.photoAfter[0], 'cleanbage/reports');
                    imageUrls.photoAfter = {
                        public_id: afterResult.public_id,
                        url: afterResult.secure_url
                    };
                } catch (error) {
                    // If before photo was uploaded, delete it
                    if (imageUrls.photoBefore?.public_id) {
                        await deleteImage(imageUrls.photoBefore.public_id);
                    }
                    throw new Error(`Error uploading after photo: ${error.message}`);
                }
            }
        }

        // Parse JSON strings back to objects
        const wasteCategories = typeof req.body.wasteCategories === 'string' 
            ? JSON.parse(req.body.wasteCategories)
            : req.body.wasteCategories;

        const weather = typeof req.body.weather === 'string'
            ? JSON.parse(req.body.weather)
            : req.body.weather;

        // Create report object with all fields from model
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

    // Process after photo if provided
    if (req.files && req.files.photoAfter) {
        const file = req.files.photoAfter;

        // Check file type
        if (!file.mimetype.startsWith('image')) {
            throw new Error('Please upload an image file', 400);
        }

        // Check file size
        if (file.size > process.env.MAX_FILE_SIZE) {
            throw new Error(`Please upload an image less than ${process.env.MAX_FILE_SIZE / 1000000}MB`, 400);
        }

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

export const getReportStats = async (req, res) => {
    // Only allow admins
    if (req.user.role !== 'admin') {
        throw new Error('Not authorized to access this data', 403);
    }

    // Get total collected waste volume
    const totalWaste = await Report.aggregate([
        {
            $match: {
                status: 'completed'
            }
        },
        {
            $group: {
                _id: null,
                totalVolume: { $sum: '$wasteVolume' }
            }
        }
    ]);

    // Get average efficiency score
    const avgEfficiency = await Report.aggregate([
        {
            $match: {
                efficiency: { $ne: null }
            }
        },
        {
            $group: {
                _id: null,
                avgEfficiency: { $avg: '$efficiency' }
            }
        }
    ]);

    // Get collections by waste category
    const wasteCategories = await Report.aggregate([
        {
            $match: {
                status: 'completed',
                'wasteCategories.organic': { $gt: 0 }
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

    // Get top collectors
    const topCollectors = await Report.aggregate([
        {
            $match: {
                status: 'completed'
            }
        },
        {
            $group: {
                _id: '$collector',
                collectionCount: { $sum: 1 },
                totalVolume: { $sum: '$wasteVolume' }
            }
        },
        {
            $sort: { collectionCount: -1 }
        },
        {
            $limit: 5
        }
    ]);

    // Get collector details
    const populatedCollectors = await User.populate(topCollectors, {
        path: '_id',
        select: 'name avatar'
    });

    const formattedCollectors = populatedCollectors.map(item => ({
        collector: item._id,
        collectionCount: item.collectionCount,
        totalVolume: item.totalVolume
    }));

    res.status(200).json({
        success: true,
        data: {
            totalReports: await Report.countDocuments(),
            completedReports: await Report.countDocuments({ status: 'completed' }),
            totalWasteVolume: totalWaste.length > 0 ? totalWaste[0].totalVolume : 0,
            avgEfficiency: avgEfficiency.length > 0 ? Math.round(avgEfficiency[0].avgEfficiency) : 0,
            wasteCategories: wasteCategories.length > 0 ? {
                organic: wasteCategories[0].organic,
                recyclable: wasteCategories[0].recyclable,
                nonRecyclable: wasteCategories[0].nonRecyclable,
                hazardous: wasteCategories[0].hazardous
            } : {
                organic: 0,
                recyclable: 0,
                nonRecyclable: 0,
                hazardous: 0
            },
            topCollectors: formattedCollectors
        }
    });
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