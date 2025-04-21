import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password not required if Google login
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['resident', 'garbage_collector', 'admin'],
        required: [true, 'Role is required'],
        default: 'resident'
    },
    address: {
        street: {
            type: String,
            trim: true,
            default: ''
        },
        city: {
            type: String,
            trim: true,
            default: 'Jamnagar'
        },
        state: {
            type: String,
            trim: true,
            default: 'Gujarat'
        },
        postalCode: {
            type: String,
            trim: true,
            default: ''
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    avatar: {
        public_id: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: 'https://res.cloudinary.com/dxayfkmrn/image/upload/v1654323457/avatars/default_avatar_ztruzk.png'
        }
    },
    assignedVehicle: {
        type: String,
        default: null
    },
    rewardPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    streakCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastReportDate: {
        type: Date,
        default: null
    },
    verificationToken: String,
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    fcmToken: {
        type: String,
        default: null
    },
    notification: {
        email: {
            type: Boolean,
            default: true
        },
        push: {
            type: Boolean,
            default: true
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
    this.lastActive = Date.now();
    
    if (!this.isModified('password') || !this.password) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate verification token
userSchema.methods.getVerificationToken = function() {
    // Generate token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to verificationToken field
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    return verificationToken;
};

// Add reward points
userSchema.methods.addRewardPoints = async function(points) {
    if (this.role !== 'resident') return;
    
    this.rewardPoints += points;
    
    // Check if reported yesterday to maintain streak
    if (this.lastReportDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastReportDay = new Date(this.lastReportDate).setHours(0, 0, 0, 0);
        const yesterdayDay = yesterday.setHours(0, 0, 0, 0);
        
        if (lastReportDay === yesterdayDay) {
            this.streakCount += 1;
            // Bonus points for streaks at milestones
            if (this.streakCount % 7 === 0) { // Weekly streak
                this.rewardPoints += 20;
            } else if (this.streakCount % 30 === 0) { // Monthly streak
                this.rewardPoints += 100;
            }
        } else if (new Date() - this.lastReportDate > 48 * 60 * 60 * 1000) {
            // Reset streak if more than 48 hours passed
            this.streakCount = 1;
        }
    } else {
        this.streakCount = 1;
    }
    
    this.lastReportDate = new Date();
    await this.save();
};

// Method to update user's location
userSchema.methods.updateLocation = async function(coordinates) {
    this.location.coordinates = coordinates;
    await this.save();
    return this.location;
};

const User = mongoose.model('User', userSchema);

export default User;