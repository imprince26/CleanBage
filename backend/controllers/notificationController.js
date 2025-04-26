import Notification from '../models/notificationModel.js';

export const getUserNotifications = async (req, res) => {
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
};

export const getNotification = async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        throw new Error(`Notification not found with id of ${req.params.id}`, 404);
    }

    // Check user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
        throw new Error('Not authorized to access this notification', 403);
    }

    res.status(200).json({
        success: true,
        data: notification
    });
};

export const markAsRead = async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        throw new Error(`Notification not found with id of ${req.params.id}`, 404);
    }

    // Check user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
        throw new Error('Not authorized to update this notification', 403);
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
};

export const markAllAsRead = async (req, res) => {
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
};

export const deleteNotification = async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        throw new Error(`Notification not found with id of ${req.params.id}`, 404);
    }

    // Check user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
        throw new Error('Not authorized to delete this notification', 403);
    }

    await notification.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
};

export const deleteReadNotifications = async (req, res) => {
    await Notification.deleteMany({
        recipient: req.user.id,
        isRead: true
    });

    res.status(200).json({
        success: true,
        message: 'All read notifications deleted'
    });
};

export const getNotificationCount = async (req, res) => {
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
};