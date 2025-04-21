import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = catchAsync(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter
    const filter = { recipient: req.user.id };
    
    // Filter by read status
    if (req.query.isRead !== undefined) {
        filter.isRead = req.query.isRead === 'true';
    }
    
    // Filter by type
    if (req.query.type) {
        filter.type = req.query.type;
    }
    
    // Filter by priority
    if (req.query.priority) {
        filter.priority = req.query.priority;
    }
    
    // Sort
    const sort = { createdAt: -1 };
    
    const total = await Notification.countDocuments(filter);
    
    const notifications = await Notification.find(filter)
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
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false
    });
    
    res.status(200).json({
        success: true,
        count: notifications.length,
        pagination,
        total,
        unreadCount,
        data: notifications
    });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
export const getNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this notification', 403));
    }
    
    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = catchAsync(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this notification', 403));
    }
    
    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
    }
    
    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = catchAsync(async (req, res, next) => {
    await Notification.updateMany(
        { 
            recipient: req.user.id,
            isRead: false
        },
        {
            isRead: true,
            readAt: new Date()
        }
    );
    
    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = catchAsync(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }
    
    // Check user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to delete this notification', 403));
    }
    
    await notification.deleteOne();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/delete-read
// @access  Private
export const deleteReadNotifications = catchAsync(async (req, res, next) => {
    await Notification.deleteMany({
        recipient: req.user.id,
        isRead: true
    });
    
    res.status(200).json({
        success: true,
        message: 'All read notifications deleted'
    });
});

// @desc    Get notification count
// @route   GET /api/notifications/count
// @access  Private
export const getNotificationCount = catchAsync(async (req, res, next) => {
    const unreadCount = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false
    });
    
    res.status(200).json({
        success: true,
        data: {
            unreadCount
        }
    });
});