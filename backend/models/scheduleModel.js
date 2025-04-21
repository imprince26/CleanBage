import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    bin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: [true, 'Bin reference is required']
    },
    collector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Garbage collector is required']
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },
    timeSlot: {
        start: {
            type: String,
            default: '08:00'
        },
        end: {
            type: String,
            default: '12:00'
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'missed', 'rescheduled', 'canceled'],
        default: 'pending'
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    estimatedFillLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        default: null
    },
    recurrence: {
        type: String,
        enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly'],
        default: 'none'
    },
    recurrenceEndDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    isOptimized: {
        type: Boolean,
        default: false
    },
    notifications: {
        reminderSent: {
            type: Boolean,
            default: false
        },
        reminderTime: {
            type: Date,
            default: null
        }
    },
    completionDetails: {
        completedAt: {
            type: Date,
            default: null
        },
        actualFillLevel: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        collectionTime: {
            type: Number, // in minutes
            default: null
        },
        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            default: null
        }
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin assignment is required']
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

scheduleSchema.index({ bin: 1 });
scheduleSchema.index({ collector: 1 });
scheduleSchema.index({ scheduledDate: 1 });
scheduleSchema.index({ status: 1 });
scheduleSchema.index({ priority: -1 });

scheduleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Automatically update bin's collection schedule
    if ((this.isNew || this.isModified('scheduledDate')) && this.status === 'pending') {
        mongoose.model('Collection').findByIdAndUpdate(
            this.bin,
            { collectionSchedule: this.scheduledDate },
            { new: true }
        ).exec();
    }
    
    // Check if schedule is past due
    const now = new Date();
    if (this.status === 'pending' && this.scheduledDate < now) {
        const hoursPastDue = Math.round((now - this.scheduledDate) / (1000 * 60 * 60));
        
        if (hoursPastDue > 24) {
            this.status = 'missed';
        } else if (hoursPastDue > 2) {
            // Increase priority as it gets more past due
            this.priority = Math.min(10, this.priority + Math.floor(hoursPastDue / 2));
        }
    }
    
    next();
});

scheduleSchema.methods.complete = async function(fillLevel, collectionTime = null) {
    if (this.status !== 'pending') {
        throw new Error('Schedule is not in pending status');
    }
    
    this.status = 'completed';
    this.completionDetails = {
        completedAt: new Date(),
        actualFillLevel: fillLevel,
        collectionTime: collectionTime
    };
    
    // Update the bin's status and fill level
    await mongoose.model('Collection').findByIdAndUpdate(
        this.bin,
        { 
            status: 'collected',
            fillLevel: 0,
            lastCollected: new Date()
        }
    );
    
    // Generate next schedule if recurrence is set
    if (this.recurrence !== 'none') {
        const nextDate = new Date(this.scheduledDate);
        
        switch(this.recurrence) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'biweekly':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }
        
        // Check if recurrence is still valid
        if (!this.recurrenceEndDate || nextDate <= this.recurrenceEndDate) {
            const newSchedule = new mongoose.model('Schedule')({
                bin: this.bin,
                collector: this.collector,
                scheduledDate: nextDate,
                timeSlot: this.timeSlot,
                priority: this.priority,
                route: this.route,
                recurrence: this.recurrence,
                recurrenceEndDate: this.recurrenceEndDate,
                notes: this.notes,
                assignedBy: this.assignedBy
            });
            
            await newSchedule.save();
        }
    }
    
    return this.save();
};

scheduleSchema.methods.reschedule = async function(newDate, reason = '') {
    if (this.status === 'completed') {
        throw new Error('Cannot reschedule a completed schedule');
    }
    
    const oldStatus = this.status;
    this.status = 'rescheduled';
    
    // Create a new schedule with the new date
    const newSchedule = new mongoose.model('Schedule')({
        bin: this.bin,
        collector: this.collector,
        scheduledDate: newDate,
        timeSlot: this.timeSlot,
        priority: this.priority,
        route: this.route,
        recurrence: this.recurrence,
        recurrenceEndDate: this.recurrenceEndDate,
        notes: `Rescheduled from ${this.scheduledDate}. ${reason}\n${this.notes}`.trim(),
        assignedBy: this.updatedBy || this.assignedBy
    });
    
    await newSchedule.save();
    
    // Update the bin's collection schedule
    await mongoose.model('Collection').findByIdAndUpdate(
        this.bin,
        { collectionSchedule: newDate }
    );
    
    return this.save();
};

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;