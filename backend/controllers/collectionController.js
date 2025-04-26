import Collection from '../models/collectionModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { RewardTransaction } from '../models/rewardModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';
import { getAddressFromCoordinates } from '../utils/geoUtils.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import { json } from 'express';

export const getCollections = catchAsync(async (req, res, next) => {
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

    // Filter by waste type
    if (req.query.wasteType) {
        filter.wasteType = req.query.wasteType;
    }

    // Filter by reported by user
    if (req.query.reportedBy) {
        filter.reportedBy = req.query.reportedBy;
    }

    // Filter by assigned collector
    if (req.query.assignedCollector) {
        filter.assignedCollector = req.query.assignedCollector;
    }

    // Filter by fill level range
    if (req.query.minFillLevel || req.query.maxFillLevel) {
        filter.fillLevel = {};
        if (req.query.minFillLevel) {
            filter.fillLevel.$gte = parseInt(req.query.minFillLevel);
        }
        if (req.query.maxFillLevel) {
            filter.fillLevel.$lte = parseInt(req.query.maxFillLevel);
        }
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
    }

    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        // Default sort by priority and fill level
        sort.priority = -1;
        sort.fillLevel = -1;
    }

    const total = await Collection.countDocuments(filter);

    const collections = await Collection.find(filter)
        .populate('reportedBy', 'name avatar')
        .populate('assignedCollector', 'name avatar')
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
        count: collections.length,
        pagination,
        total,
        data: collections
    });
});

export const getCollection = catchAsync(async (req, res, next) => {
    const collection = await Collection.findById(req.params.id)
        .populate('reportedBy', 'name avatar')
        .populate('assignedCollector', 'name avatar');

    if (!collection) {
        return next(new ErrorResponse(`Collection not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: collection
    });
});


export const createCollection = catchAsync(async (req, res, next) => {
    console.log(req.body);

    // Add reporting user
    req.body.reportedBy = req.user.id;

    // Validate required fields
    if (!req.body.location) {
        return next(new ErrorResponse('Location is required', 400));
    }

    let location;
    try {
        location = JSON.parse(req.body.location);
    } catch (err) {
        return next(new ErrorResponse('Invalid location format', 400));
    }

    const coordinates = Array.isArray(location.coordinates)
        ? location.coordinates.map(coord => Number(coord))
        : [];

    if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        return next(new ErrorResponse('Invalid coordinates', 400));
    }

    // Generate unique bin ID
    const binCount = await Collection.countDocuments();
    const binId = `BIN${(binCount + 1).toString().padStart(5, '0')}`;

    // Initialize collection data
    const collectionData = {
        ...req.body,
        binId,
        location: {
            type: 'Point',
            coordinates,
            address: req.body.location.address || {}
        },
        fillLevel: req.body.fillLevel || 80,
        status: 'pending',
        reportImages: []
    };

    // Try to get address from coordinates if not provided
    if (!req.body.location.address) {
        try {
            const addressInfo = await getAddressFromCoordinates(coordinates);
            collectionData.location.address = addressInfo.components;
        } catch (error) {
            console.error('Error getting address:', error.message);
        }
    }

    // Process uploaded images
    if (req.files?.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        try {
            for (const file of files) {
                // Validate file type
                if (!file.mimetype.startsWith('image/')) {
                    return next(new ErrorResponse('Please upload only image files', 400));
                }

                // Validate file size (5MB limit)
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    return next(new ErrorResponse('Image size should not exceed 5MB', 400));
                }

                // Upload to cloudinary
                const result = await uploadImage(file, 'cleanbage/collections');
                collectionData.reportImages.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            }
        } catch (error) {
            // Cleanup any uploaded images if error occurs
            for (const image of collectionData.reportImages) {
                await deleteImage(image.public_id);
            }
            return next(new ErrorResponse('Error processing images', 500));
        }
    }

    // Create collection
    const collection = await Collection.create(collectionData);

    // Handle reward points for resident
    if (req.user.role === 'resident') {
        const userReports = await Collection.countDocuments({
            reportedBy: req.user.id,
            status: { $ne: 'rejected' }
        });

        // Award bonus points for every 3rd successful report
        if (userReports >= 3 && userReports % 3 === 0) {
            await handleRewardPoints(req.user.id, collection._id);
        }
    }

    // Notify admins
    await notifyAdmins(collection);

    res.status(201).json({
        success: true,
        data: collection
    });
});

// Helper function to handle reward points
const handleRewardPoints = async (userId, collectionId) => {
    try {
         // Update user reward points
         const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { rewardPoints: 15 } },
            { new: true }
        );
        // Create reward transaction
        await RewardTransaction.create({
            user: userId,
            type: 'earned',
            points: 15,
            description: 'Bonus for multiple waste bin reports',
            sourceType: 'bin_report',
            sourceId: collectionId,
            sourceModel: 'Collection',
            balance: user.rewardPoints
        });

       

        // Create notification
        await Notification.createNotification({
            recipient: userId,
            type: 'reward_earned',
            title: 'Bonus Reward Points!',
            message: 'You earned 15 bonus points for your consistent waste reporting.',
            priority: 'medium',
            icon: 'award',
            relatedTo: { bin: collectionId }
        });

        return user.rewardPoints;
    } catch (error) {
        console.error('Error handling reward points:', error);
    }
};

// Helper function to notify admins
const notifyAdmins = async (collection) => {
    try {
        const admins = await User.find({ role: 'admin' });

        const notifications = admins.map(admin => ({
            recipient: admin._id,
            type: 'bin_reported',
            title: 'New Bin Reported',
            message: `A new waste bin (${collection.binId}) has been reported. Please assign a collector.`,
            priority: 'high',
            icon: 'trash-2',
            relatedTo: { bin: collection._id },
            action: {
                text: 'View Bin',
                url: `/admin/collections/${collection._id}`
            }
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};


export const updateCollection = catchAsync(async (req, res, next) => {
    let collection = await Collection.findById(req.params.id);

    if (!collection) {
        return next(new ErrorResponse(`Collection not found with id of ${req.params.id}`, 404));
    }

    // Check user is admin or the assigned collector
    if (req.user.role !== 'admin' &&
        (!collection.assignedCollector ||
            collection.assignedCollector.toString() !== req.user.id)) {
        return next(new ErrorResponse('Not authorized to update this collection', 403));
    }

    // Fields to update
    const fieldsToUpdate = {
        fillLevel: req.body.fillLevel,
        status: req.body.status,
        assignedCollector: req.body.assignedCollector,
        collectionSchedule: req.body.collectionSchedule,
        regularSchedule: req.body.regularSchedule,
        priority: req.body.priority,
        isActive: req.body.isActive
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Check if trying to mark as collected
    const markingAsCollected = collection.status !== 'collected' && fieldsToUpdate.status === 'collected';

    collection = await Collection.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    // If marked as collected, create notification for the resident
    if (markingAsCollected && collection.reportedBy) {
        await Notification.createNotification({
            recipient: collection.reportedBy,
            type: 'collection_completed',
            title: 'Waste Collected',
            message: `Your reported waste bin (${collection.binId}) has been collected. Thank you for contributing to a cleaner city!`,
            priority: 'medium',
            icon: 'check-circle',
            relatedTo: {
                bin: collection._id
            }
        });
    }

    res.status(200).json({
        success: true,
        data: collection
    });
});


export const assignCollector = catchAsync(async (req, res, next) => {
    const { collectorId } = req.body;

    if (!collectorId) {
        return next(new ErrorResponse('Please provide collector ID', 400));
    }

    let collection = await Collection.findById(req.params.id);

    if (!collection) {
        return next(new ErrorResponse(`Collection not found with id of ${req.params.id}`, 404));
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to assign collectors', 403));
    }

    // Check if collector exists and has the right role
    const collector = await User.findOne({
        _id: collectorId,
        role: 'garbage_collector'
    });

    if (!collector) {
        return next(new ErrorResponse('Invalid garbage collector', 404));
    }

    collection = await Collection.findByIdAndUpdate(
        req.params.id,
        {
            assignedCollector: collectorId,
            status: collection.status === 'pending' ? 'in-progress' : collection.status
        },
        {
            new: true,
            runValidators: true
        }
    );

    // Create notification for the collector
    await Notification.createNotification({
        recipient: collectorId,
        type: 'bin_reported',
        title: 'New Collection Assigned',
        message: `You have been assigned to collect waste bin ${collection.binId}.`,
        priority: 'high',
        icon: 'truck',
        relatedTo: {
            bin: collection._id
        },
        action: {
            text: 'View Assignment',
            url: `/collector/collections/${collection._id}`
        }
    });

    res.status(200).json({
        success: true,
        data: collection
    });
});


export const deleteCollection = catchAsync(async (req, res, next) => {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
        return next(new ErrorResponse(`Collection not found with id of ${req.params.id}`, 404));
    }

    // Check user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete collections', 403));
    }

    // Delete images from cloudinary
    if (collection.reportImages && collection.reportImages.length > 0) {
        for (const image of collection.reportImages) {
            await cloudinary.uploader.destroy(image.public_id);
        }
    }

    // Delete QR code if exists
    if (collection.qrCode && collection.qrCode.public_id) {
        await cloudinary.uploader.destroy(collection.qrCode.public_id);
    }

    await collection.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});


export const getNearbyBins = catchAsync(async (req, res, next) => {
    const { longitude, latitude, distance = 1000, wasteType } = req.query;

    // Check if coordinates are provided
    if (!longitude || !latitude) {
        return next(new ErrorResponse('Please provide longitude and latitude', 400));
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];

    // Find nearby bins
    const bins = await Collection.findNearby(
        coordinates,
        parseFloat(distance),
        wasteType
    );

    res.status(200).json({
        success: true,
        count: bins.length,
        data: bins
    });
});


export const submitComplaint = catchAsync(async (req, res, next) => {
    const { text } = req.body;

    if (!text) {
        return next(new ErrorResponse('Please provide complaint text', 400));
    }

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
        return next(new ErrorResponse(`Collection not found with id of ${req.params.id}`, 404));
    }

    // Check if user is resident
    if (req.user.role !== 'resident') {
        return next(new ErrorResponse('Only residents can submit complaints', 403));
    }

    const complaint = {
        userId: req.user.id,
        text,
        images: [],
        createdAt: Date.now(),
        status: 'pending'
    };

    // Process uploaded images
    if (req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for (const file of files) {
            // Check file type
            if (!file.mimetype.startsWith('image')) {
                return next(new ErrorResponse('Please upload an image file', 400));
            }

            // Check file size
            if (file.size > process.env.MAX_FILE_SIZE) {
                return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_SIZE / 1000000}MB`, 400));
            }

            try {
                // Upload to cloudinary
                const result = await uploadImage(file, 'cleanbage/complaints');

                complaint.images.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            } catch (error) {
                console.error('Image upload error:', error);
                return next(new ErrorResponse('Problem with file upload', 500));
            }
        }
    }

    collection.citizenComplaints.push(complaint);
    await collection.save();

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
        await Notification.createNotification({
            recipient: admin._id,
            type: 'bin_reported',
            title: 'New Complaint Submitted',
            message: `A new complaint has been submitted for bin ${collection.binId}.`,
            priority: 'high',
            icon: 'alert-triangle',
            relatedTo: {
                bin: collection._id
            },
            action: {
                text: 'View Complaint',
                url: `/admin/collections/${collection._id}`
            }
        });
    }

    res.status(201).json({
        success: true,
        data: collection
    });
});


export const getCollectionStats = catchAsync(async (req, res, next) => {
    // Only allow admins to access
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this data', 403));
    }

    // Get total count by status
    const statusCounts = await Collection.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get count by waste type
    const wasteTypeCounts = await Collection.aggregate([
        {
            $group: {
                _id: '$wasteType',
                count: { $sum: 1 }
            }
        }
    ]);

    // Get average fill level
    const avgFillLevel = await Collection.aggregate([
        {
            $group: {
                _id: null,
                avgFillLevel: { $avg: '$fillLevel' }
            }
        }
    ]);

    // Get collections by month
    const collectionsByMonth = await Collection.aggregate([
        {
            $match: {
                status: 'collected'
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$lastCollected' },
                    year: { $year: '$lastCollected' }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1
            }
        }
    ]);

    // Format status counts into an object
    const formattedStatusCounts = {};
    statusCounts.forEach(item => {
        formattedStatusCounts[item._id] = item.count;
    });

    // Format waste type counts into an object
    const formattedWasteTypeCounts = {};
    wasteTypeCounts.forEach(item => {
        formattedWasteTypeCounts[item._id] = item.count;
    });

    res.status(200).json({
        success: true,
        data: {
            totalBins: await Collection.countDocuments(),
            statusCounts: formattedStatusCounts,
            wasteTypeCounts: formattedWasteTypeCounts,
            avgFillLevel: avgFillLevel.length > 0 ? Math.round(avgFillLevel[0].avgFillLevel) : 0,
            collectionsByMonth
        }
    });
});