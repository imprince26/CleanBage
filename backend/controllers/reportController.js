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
    // Add collector
    req.body.collector = req.user.id;

    // Check if required fields are provided
    if (!req.body.bin || !req.body.wasteVolume) {
        throw new Error('Please provide bin ID and waste volume', 400);
    }

    // Check if user is a garbage collector
    if (req.user.role !== 'garbage_collector') {
        throw new Error('Only garbage collectors can create reports', 403);
    }

    // Check if bin exists
    const bin = await Collection.findById(req.body.bin);
    if (!bin) {
        throw new Error(`Bin not found with id of ${req.body.bin}`, 404);
    }

    // Check if collector is assigned to the bin
    if (bin.assignedCollector && bin.assignedCollector.toString() !== req.user.id) {
        throw new Error('You are not assigned to this bin', 403);
    }

    // Set collection date if not provided
    if (!req.body.collectionDate) {
        req.body.collectionDate = new Date();
    }

    // Set start and end time
    if (!req.body.startTime) {
        req.body.startTime = new Date();
    }
    if (!req.body.endTime && req.body.status === 'completed') {
        req.body.endTime = new Date();
    }

    // Set fill level before
    if (!req.body.fillLevelBefore) {
        req.body.fillLevelBefore = bin.fillLevel;
    }

    // Process before photo
    if (req.files && req.files.photoBefore) {
        const file = req.files.photoBefore;

        // Check file type
        if (!file.mimetype.startsWith('image')) {
            throw new Error('Please upload an image file', 400);
        }

        // Check file size
        if (file.size > process.env.MAX_FILE_SIZE) {
            throw new Error(`Please upload an image less than ${process.env.MAX_FILE_SIZE / 1000000}MB`, 400);
        }

        try {
            // Upload to cloudinary
            const result = await uploadImage(file, 'cleanbage/reports');

            req.body.photoBefore = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Problem with file upload', 500);
        }
    }

    // Process after photo
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
            // Upload to cloudinary
            const result = await uploadImage(file, 'cleanbage/reports');

            req.body.photoAfter = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Problem with file upload', 500);
        }
    }

    const report = await Report.create(req.body);

    await Collection.findByIdAndUpdate(req.body.bin, {
        lastCollectionReport: report._id,
        lastCollected: new Date(),
        status: 'collected',
        fillLevel: req.body.fillLevelAfter || 0
    });
    // Update bin status if report is completed
    if (req.body.status === 'completed') {
        await Collection.findByIdAndUpdate(req.body.bin, {
            status: 'collected',
            fillLevel: req.body.fillLevelAfter || 0,
            lastCollected: req.body.collectionDate
        });

        // Create notification for admin
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.createNotification({
                recipient: admin._id,
                type: 'report_submitted',
                title: 'Collection Report Submitted',
                message: `A collection report has been submitted for bin ${bin.binId}.`,
                priority: 'medium',
                icon: 'file-text',
                relatedTo: {
                    bin: bin._id,
                    report: report._id
                },
                action: {
                    text: 'View Report',
                    url: `/admin/reports/${report._id}`
                }
            });
        }

        // Create notification for resident if bin was reported
        if (bin.reportedBy) {
            await Notification.createNotification({
                recipient: bin.reportedBy,
                type: 'collection_completed',
                title: 'Bin Collection Completed',
                message: `Your reported waste bin (${bin.binId}) has been collected. Thank you for helping keep our city clean!`,
                priority: 'high',
                icon: 'check-circle',
                relatedTo: {
                    bin: bin._id,
                    report: report._id
                }
            });
        }
    }

    res.status(201).json({
        success: true,
        data: report
    });
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