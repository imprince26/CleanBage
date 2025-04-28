import mongoose from 'mongoose';
import User from './userModel.js';

const collectionSchema = new mongoose.Schema({
    binId: {
        type: String,
        required: [true, 'Bin ID is required'],
        unique: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Coordinates are required']
        },
        address: {
            street: {
                type: String,
                trim: true
            },
            area: {
                type: String,
                trim: true
            },
            landmark: {
                type: String,
                trim: true
            },
            city: {
                type: String,
                default: 'Ahmedabad',
                trim: true
            },
            postalCode: {
                type: String,
                trim: true
            }
        }
    },
    fillLevel: {
        type: Number,
        required: [true, 'Fill level is required'],
        min: 0,
        max: 100,
        default: 0
    },
    wasteType: {
        type: String,
        enum: ['organic', 'recyclable', 'non-recyclable', 'hazardous', 'mixed'],
        required: [true, 'Waste type is required']
    },
    capacity: {
        type: Number,
        default: 100, // in liters
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'collected', 'overflow', 'maintenance'],
        default: 'pending'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reportImages: [{
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }],
    assignedCollector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastCollected: {
        type: Date,
        default: null
    },
    collectionHistory: [{
        collectedAt: {
            type: Date
        },
        collectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        fillLevel: {
            type: Number
        },
        notes: {
            type: String
        }
    }],
    collectionSchedule: {
        type: Date,
        default: null
    },
    regularSchedule: {
        frequency: {
            type: String,
            enum: ['daily', 'alternate', 'weekly', 'biweekly', 'monthly', 'custom'],
            default: 'weekly'
        },
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlot: {
            type: String,
            default: 'morning'
        }
    },
    sensorData: {
        batteryLevel: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        },
        temperature: {
            type: Number,
            default: null
        },
        humidity: {
            type: Number,
            default: null
        },
        lastPing: {
            type: Date,
            default: Date.now
        },
        sensorId: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    rewardAssigned: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0, // 0 = normal, higher = more priority
        min: 0,
        max: 10
    },
    citizenComplaints: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: {
            type: String
        },
        images: [{
            public_id: String,
            url: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'acknowledged', 'resolved'],
            default: 'pending'
        },
        response: {
            text: String,
            respondedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            respondedAt: Date
        }
    }],
    installationDate: {
        type: Date,
        default: Date.now
    },
    lastMaintenance: {
        type: Date,
        default: null
    },
    maintenanceHistory: [{
        date: Date,
        type: {
            type: String,
            enum: ['cleaning', 'repair', 'replacement', 'inspection']
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    qrCode: {
        public_id: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    lastCollectionReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
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

collectionSchema.index({ location: '2dsphere' });
// collectionSchema.index({ binId: 1 });
collectionSchema.index({ status: 1 });
collectionSchema.index({ fillLevel: -1 });
collectionSchema.index({ wasteType: 1 });
collectionSchema.index({ lastCollectionReport: 1 });

collectionSchema.pre('save', async function (next) {
    this.updatedAt = Date.now();

    // Auto calculate priority based on fill level and time since last collection
    if (this.fillLevel > 80) {
        this.priority = 10;
    } else if (this.fillLevel > 60) {
        this.priority = 7;
    } else if (this.fillLevel > 40) {
        this.priority = 5;
    } else {
        this.priority = 3;
    }

    // If it's been more than 5 days since last collection, increase priority
    if (this.lastCollected) {
        const daysSinceCollection = Math.floor((Date.now() - this.lastCollected) / (1000 * 60 * 60 * 24));
        if (daysSinceCollection > 5) {
            this.priority = Math.min(10, this.priority + 3);
        }
    }

    // Award points when status changes to 'collected'
    if (this.isModified('status') && this.status === 'collected' && !this.rewardAssigned && this.reportedBy) {
        try {
            const resident = await User.findById(this.reportedBy);
            if (resident && resident.role === 'resident') {
                await resident.addRewardPoints(10);
                this.rewardAssigned = true;
            }
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    }
    next();
});

collectionSchema.methods.needsCollection = function () {
    return this.fillLevel >= 80 || this.status === 'overflow';
};

collectionSchema.methods.updateFillLevel = async function (newLevel) {
    this.fillLevel = Math.min(100, Math.max(0, newLevel));

    // Automatically update status based on fill level
    if (this.fillLevel >= 90) {
        this.status = 'overflow';
    } else if (this.fillLevel < 10) {
        this.status = 'collected';
    } else if (this.fillLevel >= 10) {
        this.status = 'pending';
    }

    await this.save();
    return this.fillLevel;
};

// Static method to find nearby bins
collectionSchema.statics.findNearby = async function (coordinates, maxDistance = 1000, wasteType = null) {
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: maxDistance
        }
      },
      isActive: true
    };
  
    if (wasteType) {
      query.wasteType = wasteType;
    }
  
    return this.find(query)
      .populate('assignedCollector', 'name avatar')
      .sort({ fillLevel: -1 });
  };

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;