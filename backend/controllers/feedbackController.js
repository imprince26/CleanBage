import Feedback from '../models/feedbackModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';
import cloudinary from '../utils/cloudinary.js';

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin
export const getAllFeedback = catchAsync(async (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access all feedback', 403));
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter
    const filter = {};
    
    // Filter by type
    if (req.query.type) {
        filter.type = req.query.type;
    }
    
    // Filter by rating
    if (req.query.minRating) {
        filter.rating = { $gte: parseInt(req.query.minRating) };
    }
    
    // Filter by status
    if (req.query.status) {
        filter.status = req.query.status;
    }
    
    // Filter by user
    if (req.query.user) {
        filter.user = req.query.user;
    }
    
    // Filter by related bin
    if (req.query.bin) {
        filter['relatedTo.bin'] = req.query.bin;
    }
    
    // Filter by related collector
    if (req.query.collector) {
        filter['relatedTo.collector'] = req.query.collector;
    }
    
    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1;
    }
    
    const total = await Feedback.countDocuments(filter);
    
    const feedback = await Feedback.find(filter)
        .populate('user', 'name avatar')
        .populate('relatedTo.bin', 'binId location')
        .populate('relatedTo.collector', 'name avatar')
        .populate('response.respondedBy', 'name role')
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
        count: feedback.length,
        pagination,
        total,
        data: feedback
    });
});

// @desc    Get user's feedback
// @route   GET /api/feedback/me
// @access  Private
export const getUserFeedback = catchAsync(async (req, res, next) => {
    const feedback = await Feedback.find({ user: req.user.id })
        .populate('relatedTo.bin', 'binId location')
        .populate('relatedTo.collector', 'name avatar')
        .populate('response.respondedBy', 'name role')
        .sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        count: feedback.length,
        data: feedback
    });
});

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private
export const getFeedback = catchAsync(async (req, res, next) => {
    const feedback = await Feedback.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('relatedTo.bin', 'binId location')
        .populate('relatedTo.collector', 'name avatar')
        .populate('response.respondedBy', 'name role');
    
    if (!feedback) {
        return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
    }
    
    // Check if user is admin or the feedback creator
    if (req.user.role !== 'admin' && feedback.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this feedback', 403));
    }
    
    res.status(200).json({
        success: true,
        data: feedback
    });
});

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Private
export const createFeedback = catchAsync(async (req, res, next) => {
    // Add user
    req.body.user = req.user.id;
    
    // Check if required fields are provided
    if (!req.body.type || !req.body.rating || !req.body.comment) {
        return next(new ErrorResponse('Please provide type, rating, and comment', 400));
    }
    
    // Process uploaded images
    if (req.files && req.files.images) {
        req.body.images = [];
        
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
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: 'cleanbag/feedback',
                    width: 800,
                    crop: 'scale'
                });
                
                req.body.images.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            } catch (error) {
                console.error('Image upload error:', error);
                return next(new ErrorResponse('Problem with file upload', 500));
            }
        }
    }
    
    // Get user's location if available
    if (req.user.location && req.user.location.coordinates) {
        req.body.location = {
            type: 'Point',
            coordinates: req.user.location.coordinates
        };
    }
    
    const feedback = await Feedback.create(req.body);
    
    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
        await Notification.createNotification({
            recipient: admin._id,
            type: 'feedback_response',
            title: 'New Feedback Submitted',
            message: `A new ${req.body.type} feedback has been submitted with a rating of ${req.body.rating}/5.`,
            priority: 'medium',
            icon: 'message-square',
            relatedTo: {
                feedback: feedback._id
            },
            action: {
                text: 'View Feedback',
                url: `/admin/feedback/${feedback._id}`
            }
        });
    }
    
    // Create notification for collector if feedback is about them
    if (req.body.type === 'collector' && req.body.relatedTo && req.body.relatedTo.collector) {
        await Notification.createNotification({
            recipient: req.body.relatedTo.collector,
            type: 'feedback_response',
            title: 'New Feedback About You',
            message: `A user has submitted feedback about your service with a rating of ${req.body.rating}/5.`,
            priority: 'medium',
            icon: 'message-square',
            relatedTo: {
                feedback: feedback._id
            }
        });
    }
    
    res.status(201).json({
        success: true,
        data: feedback
    });
});

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
export const updateFeedback = catchAsync(async (req, res, next) => {
    let feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
        return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is the feedback creator
    if (feedback.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this feedback', 403));
    }
    
    // Check if feedback is already addressed
    if (feedback.status !== 'pending') {
        return next(new ErrorResponse('Cannot update feedback that has been addressed', 400));
    }
    
    // Fields to update
    const fieldsToUpdate = {
        rating: req.body.rating,
        comment: req.body.comment,
        title: req.body.title,
        isAnonymous: req.body.isAnonymous,
        isPublic: req.body.isPublic
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    feedback = await Feedback.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: feedback
    });
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
export const deleteFeedback = catchAsync(async (req, res, next) => {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
        return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is admin or the feedback creator
    if (req.user.role !== 'admin' && feedback.user.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to delete this feedback', 403));
    }
    
    // Delete images from cloudinary
    if (feedback.images && feedback.images.length > 0) {
        for (const image of feedback.images) {
            await cloudinary.uploader.destroy(image.public_id);
        }
    }
    
    await feedback.deleteOne();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Respond to feedback
// @route   POST /api/feedback/:id/respond
// @access  Private/Admin
export const respondToFeedback = catchAsync(async (req, res, next) => {
    const { comment } = req.body;
    
    if (!comment) {
        return next(new ErrorResponse('Please provide a response comment', 400));
    }
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
        return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to respond to feedback', 403));
    }
    
    feedback.response = {
        comment,
        respondedBy: req.user.id,
        respondedAt: new Date()
    };
    
    feedback.status = 'addressed';
    
    await feedback.save();
    
    // Create notification for user
    await Notification.createNotification({
        recipient: feedback.user,
        type: 'feedback_response',
        title: 'Response to Your Feedback',
        message: 'An administrator has responded to your feedback.',
        priority: 'medium',
        icon: 'message-square',
        relatedTo: {
            feedback: feedback._id
        },
        action: {
            text: 'View Response',
            url: `/feedback/${feedback._id}`
        }
    });
    
    res.status(200).json({
        success: true,
        data: feedback
    });
});

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private/Admin
export const getFeedbackStats = catchAsync(async (req, res, next) => {
    // Only allow admins
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this data', 403));
    }
    
    // Get average rating by type
    const avgRatingByType = await Feedback.aggregate([
        {
            $group: {
                _id: '$type',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Get feedback by status
    const feedbackByStatus = await Feedback.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Get feedback by month
    const feedbackByMonth = await Feedback.aggregate([
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1
            }
        }
    ]);
    
    // Format rating by type into an object
    const formattedRatingByType = {};
    avgRatingByType.forEach(item => {
        formattedRatingByType[item._id] = {
            avgRating: Math.round(item.avgRating * 10) / 10,
            count: item.count
        };
    });
    
    // Format status counts into an object
    const formattedStatusCounts = {};
    feedbackByStatus.forEach(item => {
        formattedStatusCounts[item._id] = item.count;
    });
    
    res.status(200).json({
        success: true,
        data: {
            totalFeedback: await Feedback.countDocuments(),
            avgRating: await Feedback.aggregate([
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: '$rating' }
                    }
                }
            ]).then(result => Math.round((result[0]?.avgRating || 0) * 10) / 10),
            ratingByType: formattedRatingByType,
            statusCounts: formattedStatusCounts,
            feedbackByMonth
        }
    });
});