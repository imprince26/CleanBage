import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Route name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    collector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Garbage collector is required']
    },
    bins: [{
        bin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection'
        },
        order: {
            type: Number,
            default: 0
        },
        estimated_time: {
            type: Number, // minutes
            default: 5
        }
    }],
    startLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Start coordinates are required']
        },
        address: {
            type: String,
            default: ''
        }
    },
    endLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'End coordinates are required']
        },
        address: {
            type: String,
            default: ''
        }
    },
    waypoints: [{
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number]
            }
        },
        stopover: {
            type: Boolean,
            default: true
        }
    }],
    distance: {
        type: Number, // in meters
        default: 0
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 0
    },
    optimized: {
        type: Boolean,
        default: false
    },
    zone: {
        type: String,
        default: 'general'
    },
    schedule: {
        repeating: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom'],
            default: 'weekly'
        },
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        startTime: {
            type: String,
            default: '08:00'
        },
        endTime: {
            type: String,
            default: '17:00'
        }
    },
    status: {
        type: String,
        enum: ['planned', 'in-progress', 'completed', 'canceled'],
        default: 'planned'
    },
    actualStartTime: {
        type: Date,
        default: null
    },
    actualEndTime: {
        type: Date,
        default: null
    },
    completionRate: {
        type: Number, // percentage
        default: 0
    },
    plannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin planner is required']
    },
    vehicle: {
        type: String,
        default: null
    },
    vehicleCapacity: {
        type: Number, // in kg or liters
        default: 1000
    },
    currentCapacityUsed: {
        type: Number,
        default: 0
    },
    weatherConditions: {
        type: String,
        enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'windy', 'foggy', 'unknown'],
        default: 'unknown'
    },
    trafficConditions: {
        type: String,
        enum: ['light', 'moderate', 'heavy', 'unknown'],
        default: 'unknown'
    },
    notes: {
        type: String,
        default: ''
    },
    history: [{
        date: {
            type: Date
        },
        status: {
            type: String,
            enum: ['started', 'bin_collected', 'paused', 'resumed', 'completed', 'delayed']
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number]
            }
        },
        bin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection'
        },
        notes: String
    }],
    isActive: {
        type: Boolean,
        default: true
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

routeSchema.index({ startLocation: '2dsphere', endLocation: '2dsphere' });
routeSchema.index({ collector: 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ zone: 1 });
routeSchema.index({ createdAt: -1 });

routeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Calculate completion rate
    if (this.bins.length > 0) {
        const completedBins = this.history.filter(h => h.status === 'bin_collected').length;
        this.completionRate = Math.round((completedBins / this.bins.length) * 100);
    }
    
    // Auto update status based on times
    if (this.actualStartTime && !this.actualEndTime) {
        this.status = 'in-progress';
    } else if (this.actualStartTime && this.actualEndTime) {
        this.status = 'completed';
    }
    
    next();
});

// Start route method
routeSchema.methods.startRoute = async function() {
    if (this.status !== 'planned') {
        throw new Error('Route is not in planned status');  }
    if (this.status !== 'planned') {
        throw new Error('Route is not in planned status');
    }
    
    this.status = 'in-progress';
    this.actualStartTime = new Date();
    
    this.history.push({
        date: new Date(),
        status: 'started',
        location: this.startLocation,
        notes: 'Route started'
    });
    
    return this.save();
};

// Complete bin collection method
routeSchema.methods.collectBin = async function(binId, notes = '') {
    if (this.status !== 'in-progress') {
        throw new Error('Route is not in progress');
    }
    
    const binIndex = this.bins.findIndex(b => b.bin.toString() === binId.toString());
    if (binIndex === -1) {
        throw new Error('Bin not found in route');
    }
    
    // Get bin location
    const bin = await mongoose.model('Collection').findById(binId);
    if (!bin) {
        throw new Error('Bin not found');
    }
    
    this.history.push({
        date: new Date(),
        status: 'bin_collected',
        location: {
            type: 'Point',
            coordinates: bin.location.coordinates
        },
        bin: binId,
        notes: notes
    });
    
    // Update route capacity
    this.currentCapacityUsed += (bin.fillLevel / 100) * bin.capacity;
    
    // Check if all bins are collected
    const collectedBins = this.history.filter(h => h.status === 'bin_collected');
    if (collectedBins.length === this.bins.length) {
        this.status = 'completed';
        this.actualEndTime = new Date();
        this.completionRate = 100;
    }
    
    return this.save();
};

// End route method
routeSchema.methods.endRoute = async function(notes = '') {
    if (this.status !== 'in-progress') {
        throw new Error('Route is not in progress');
    }
    
    this.status = 'completed';
    this.actualEndTime = new Date();
    
    this.history.push({
        date: new Date(),
        status: 'completed',
        location: this.endLocation,
        notes: notes || 'Route completed'
    });
    
    return this.save();
};

const Route = mongoose.model('Route', routeSchema);

export default Route;