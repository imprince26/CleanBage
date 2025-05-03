import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
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
    collectionDate: {
        type: Date,
        required: [true, 'Collection date is required']
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'delayed', 'skipped'],
        default: 'pending'
    },
    wasteVolume: {
        type: Number,
        required: [true, 'Waste volume is required'],
        min: 0
    },
    wasteMeasurementUnit: {
        type: String,
        enum: ['kg', 'liters'],
        default: 'kg'
    },
    wasteCategories: {
        organic: {
            type: Number,
            default: 0
        },
        recyclable: {
            type: Number,
            default: 0
        },
        nonRecyclable: {
            type: Number,
            default: 0
        },
        hazardous: {
            type: Number,
            default: 0
        }
    },
    fillLevelBefore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    fillLevelAfter: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    photoBefore: {
        public_id: String,
        url: String
    },
    photoAfter: {
        public_id: String,
        url: String
    },
    issues: {
        type: String,
        trim: true,
        default: ''
    },
    maintenanceNeeded: {
        type: Boolean,
        default: false
    },
    maintenanceDetails: {
        type: String,
        trim: true,
        default: ''
    },
    weather: {
        condition: {
            type: String,
            enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'windy', 'foggy', 'unknown'],
            default: 'unknown'
        },
        temperature: {
            type: Number,
            default: null
        }
    },
    locationConfirmed: {
        type: Boolean,
        default: false
    },
    collectionRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        default: null
    },
    completionTime: {
        type: Number, // in minutes
        default: null
    },
    rewardPointsAssigned: {
        type: Number,
        default: 0,
        min: 0
    },
    efficiency: {
        type: Number, // calculated value between 0-100
        default: null
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        comment: {
            type: String,
            default: ''
        },
        givenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        givenAt: {
            type: Date,
            default: null
        }
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewDate: {
        type: Date,
        default: null
    },
    reviewNotes: {
        type: String,
        default: ''
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

reportSchema.index({ bin: 1, collectionDate: -1 });
reportSchema.index({ collector: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.pre('save', async function(next) {
    this.updatedAt = Date.now();
    
    // Calculate completion time if start and end times are available
    if (this.startTime && this.endTime) {
        this.completionTime = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Convert to minutes
    }
    
    try {
        // Assign reward points if not already assigned
        if (this.isNew || (this.isModified('status') && this.status === 'completed')) {
            const bin = await mongoose.model('Collection').findById(this.bin);
            if (bin && bin.reportedBy && this.status === 'completed') {
                this.rewardPointsAssigned = 10;
                
                // Update the bin's collection history
                bin.collectionHistory.push({
                    collectedAt: this.collectionDate,
                    collectedBy: this.collector,
                    fillLevel: this.fillLevelBefore,
                    notes: this.issues
                });
                
                // Update bin status and fill level
                bin.status = 'collected';
                bin.fillLevel = this.fillLevelAfter;
                bin.lastCollected = this.collectionDate;
                bin.rewardAssigned = true;
                
                await bin.save();
                
                // Update user metrics for the collector
                const collector = await mongoose.model('User').findById(this.collector);
                if (collector) {
                    collector.lastActive = Date.now();
                    await collector.save();
                }
            }
        }
        
        // Calculate efficiency score based on various factors
        if (this.status === 'completed') {
            let efficiencyScore = 100;
            
            // Deduct points for delays
            if (this.startTime && this.collectionDate) {
                const delay = (this.startTime - this.collectionDate) / (1000 * 60); // minutes
                if (delay > 30) {
                    efficiencyScore -= Math.min(20, delay / 10); // Max 20 points deduction
                }
            }
            
            // Deduct points for excessive completion time
            if (this.completionTime && this.completionTime > 15) { // If it took more than 15 minutes
                efficiencyScore -= Math.min(15, (this.completionTime - 15) / 2);
            }
            
            // Bonus for complete waste separation
            if (Object.values(this.wasteCategories).some(val => val > 0)) {
                efficiencyScore += 5;
            }
            
            // Penalty for maintenance issues
            if (this.maintenanceNeeded) {
                efficiencyScore -= 10;
            }
            
            this.efficiency = Math.max(0, Math.min(100, efficiencyScore));
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

const Report = mongoose.model('Report', reportSchema);

export default Report;