import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    type: {
        type: String,
        enum: ['service', 'app', 'collector', 'bin', 'suggestion'],
        required: [true, 'Feedback type is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    comment: {
        type: String,
        trim: true,
        required: [true, 'Comment is required'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    images: [{
        public_id: String,
        url: String
    }],
    relatedTo: {
        bin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection',
            default: null
        },
        collector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            default: null
        }
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'addressed', 'archived'],
        default: 'pending'
    },
    response: {
        comment: {
            type: String,
            trim: true,
            default: ''
        },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        respondedAt: {
            type: Date,
            default: null
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
    isAnonymous: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isPromoted: {
        type: Boolean,
        default: false
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

feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ 'relatedTo.bin': 1 });
feedbackSchema.index({ 'relatedTo.collector': 1 });
feedbackSchema.index({ location: '2dsphere' });

feedbackSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

feedbackSchema.methods.respond = async function(comment, responderId) {
    this.response = {
        comment: comment,
        respondedBy: responderId,
        respondedAt: new Date()
    };
    
    this.status = 'addressed';
    
    return this.save();
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;