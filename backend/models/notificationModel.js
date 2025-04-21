import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required']
    },
    type: {
        type: String,
        enum: [
            'collection_scheduled', 'collection_completed', 'bin_reported',
            'report_submitted', 'reward_earned', 'feedback_response',
            'route_assigned', 'bin_overflow', 'system_announcement',
            'maintenance_alert', 'goal_achieved'
        ],
        required: [true, 'Notification type is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    relatedTo: {
        bin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection',
            default: null
        },
        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            default: null
        },
        schedule: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule',
            default: null
        },
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Route',
            default: null
        },
        feedback: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback',
            default: null
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    icon: {
        type: String,
        default: 'notification'
    },
    action: {
        text: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: function() {
            const date = new Date();
            date.setDate(date.getDate() + 30); // Default expiry: 30 days
            return date;
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 });

notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
    try {
        // Prevent duplicate notifications of the same type for the same entity within a short time
        if (data.relatedTo) {
            const recentNotification = await this.findOne({
                recipient: data.recipient,
                type: data.type,
                'relatedTo.bin': data.relatedTo.bin || null,
                'relatedTo.report': data.relatedTo.report || null,
                'relatedTo.schedule': data.relatedTo.schedule || null,
                'relatedTo.route': data.relatedTo.route || null,
                'relatedTo.feedback': data.relatedTo.feedback || null,
                createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
            });
            
            if (recentNotification) return recentNotification;
        }
        
        const notification = new this(data);
        await notification.save();
        
        // Here you would integrate with push notification service
        // Example: sendPushNotification(data.recipient, data.title, data.message);
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;