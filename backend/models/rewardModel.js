import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    type: {
        type: String,
        enum: ['earned', 'redeemed', 'expired', 'adjusted'],
        required: [true, 'Transaction type is required']
    },
    points: {
        type: Number,
        required: [true, 'Points amount is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    sourceType: {
        type: String,
        enum: ['bin_report', 'feedback', 'streak', 'referral', 'voucher', 'special_event', 'system', 'redemption'],
        required: [true, 'Source type is required']
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    sourceModel: {
        type: String,
        enum: ['Collection', 'Feedback', 'User', 'Promotion', null],
        default: null
    },
    balance: {
        type: Number,
        required: [true, 'Balance is required']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'canceled'],
        default: 'completed'
    },
    expiresAt: {
        type: Date,
        default: function() {
            if (this.type === 'earned') {
                const date = new Date();
                date.setFullYear(date.getFullYear() + 1); // Points expire after 1 year
                return date;
            }
            return null;
        }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

rewardTransactionSchema.index({ user: 1, createdAt: -1 });
rewardTransactionSchema.index({ type: 1 });
rewardTransactionSchema.index({ sourceType: 1 });
rewardTransactionSchema.index({ expiresAt: 1 });

// Reward Item Schema (for redemptions)
const rewardItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Reward name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        enum: ['voucher', 'discount', 'freebie', 'experience', 'donation'],
        required: [true, 'Category is required']
    },
    pointsCost: {
        type: Number,
        required: [true, 'Points cost is required'],
        min: 1
    },
    image: {
        public_id: String,
        url: String
    },
    termsAndConditions: {
        type: String,
        default: ''
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: [true, 'Validity end date is required']
    },
    totalQuantity: {
        type: Number,
        default: -1 // -1 means unlimited
    },
    remainingQuantity: {
        type: Number,
        default: -1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    featuredOrder: {
        type: Number,
        default: 0
    },
    redemptions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        redeemedAt: {
            type: Date,
            default: Date.now
        },
        code: {
            type: String
        },
        status: {
            type: String,
            enum: ['pending', 'issued', 'used', 'expired', 'canceled'],
            default: 'pending'
        },
        usedAt: {
            type: Date,
            default: null
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

rewardItemSchema.index({ category: 1 });
rewardItemSchema.index({ pointsCost: 1 });
rewardItemSchema.index({ validUntil: 1 });
rewardItemSchema.index({ isActive: 1 });
rewardItemSchema.index({ featuredOrder: -1 });

rewardItemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to redeem a reward
rewardItemSchema.methods.redeem = async function(userId) {
    if (!this.isActive) {
        throw new Error('This reward is not active');
    }
    
    if (this.validUntil < new Date()) {
        throw new Error('This reward has expired');
    }
    
    if (this.remainingQuantity === 0) {
        throw new Error('This reward is out of stock');
    }
    
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    if (user.rewardPoints < this.pointsCost) {
        throw new Error('Insufficient reward points');
    }
    
    // Generate unique redemption code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Add redemption record
    this.redemptions.push({
        user: userId,
        redeemedAt: new Date(),
        code: code,
        status: 'issued'
    });
    
    // Update remaining quantity
    if (this.remainingQuantity > 0) {
        this.remainingQuantity -= 1;
    }
    
    // Deduct points from user
    user.rewardPoints -= this.pointsCost;
    await user.save();
    
    // Create transaction record
    await mongoose.model('RewardTransaction').create({
        user: userId,
        type: 'redeemed',
        points: -this.pointsCost,
        description: `Redeemed for ${this.name}`,
        sourceType: 'redemption',
        sourceId: this._id,
        sourceModel: 'RewardItem',
        balance: user.rewardPoints,
        status: 'completed'
    });
    
    await this.save();
    
    // Create notification
    await mongoose.model('Notification').createNotification({
        recipient: userId,
        type: 'reward_earned',
        title: 'Reward Redeemed Successfully',
        message: `You have successfully redeemed ${this.pointsCost} points for ${this.name}. Your redemption code is ${code}.`,
        priority: 'high',
        icon: 'gift',
        action: {
            text: 'View Rewards',
            url: '/wallet/rewards-history'
        }
    });
    
    return {
        code: code,
        reward: this,
        remainingPoints: user.rewardPoints
    };
};

const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema);
const RewardItem = mongoose.model('RewardItem', rewardItemSchema);

export { RewardTransaction, RewardItem };