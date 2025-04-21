import { RewardTransaction, RewardItem } from '../models/rewardModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';
import cloudinary from '../utils/cloudinary.js';

// @desc    Get user's reward transactions
// @route   GET /api/rewards/transactions
// @access  Private
export const getUserTransactions = catchAsync(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter
    const filter = { user: req.user.id };
    
    // Filter by type
    if (req.query.type) {
        filter.type = req.query.type;
    }
    
    // Filter by source type
    if (req.query.sourceType) {
        filter.sourceType = req.query.sourceType;
    }
    
    // Sort
    const sort = { createdAt: -1 };
    
    const total = await RewardTransaction.countDocuments(filter);
    
    const transactions = await RewardTransaction.find(filter)
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
    
    res.status(200).json({
        success: true,
        count: transactions.length,
        pagination,
        total,
        data: transactions
    });
});

// @desc    Get all reward items
// @route   GET /api/rewards/items
// @access  Private
export const getRewardItems = catchAsync(async (req, res, next) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter
    const filter = { 
        isActive: true,
        validUntil: { $gte: new Date() }
    };
    
    // Filter by category
    if (req.query.category) {
        filter.category = req.query.category;
    }
    
    // Filter by points range
    if (req.query.maxPoints) {
        filter.pointsCost = { $lte: parseInt(req.query.maxPoints) };
    }
    
    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.featuredOrder = -1;
        sort.pointsCost = 1;
    }
    
    const total = await RewardItem.countDocuments(filter);
    
    const rewardItems = await RewardItem.find(filter)
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
    
    res.status(200).json({
        success: true,
        count: rewardItems.length,
        pagination,
        total,
        data: rewardItems
    });
});

// @desc    Get single reward item
// @route   GET /api/rewards/items/:id
// @access  Private
export const getRewardItem = catchAsync(async (req, res, next) => {
    const rewardItem = await RewardItem.findById(req.params.id);
    
    if (!rewardItem) {
        return next(new ErrorResponse(`Reward item not found with id of ${req.params.id}`, 404));
    }
    
    // If not active and not admin, don't show
    if (!rewardItem.isActive && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Reward item not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        data: rewardItem
    });
});

// @desc    Create reward item
// @route   POST /api/rewards/items
// @access  Private/Admin
export const createRewardItem = catchAsync(async (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to create reward items', 403));
    }
    
    // Add creator
    req.body.createdBy = req.user.id;
    
    // Check if required fields are provided
    if (!req.body.name || !req.body.description || !req.body.pointsCost || !req.body.category || !req.body.validUntil) {
        return next(new ErrorResponse('Please provide name, description, points cost, category, and validity period', 400));
    }
    
    // Process uploaded image
    if (req.files && req.files.image) {
        const file = req.files.image;
        
        // Check file type
        if (!file.mimetype.startsWith('image')) {
            return next(new ErrorResponse('Please upload an image file', 400));
        }
        
        // Check file size
        if (file.size > process.env.MAX_FILE_SIZE) {
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_SIZE / 1000000}MB`, 400));
        }
        
        try {
            // Upload to cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: 'cleanbag/rewards',
                width: 800,
                crop: 'scale'
            });
            
            req.body.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return next(new ErrorResponse('Problem with file upload', 500));
        }
    }
    
    // Set remaining quantity if total quantity is provided
    if (req.body.totalQuantity && req.body.totalQuantity > 0) {
        req.body.remainingQuantity = req.body.totalQuantity;
    }
    
    const rewardItem = await RewardItem.create(req.body);
    
    res.status(201).json({
        success: true,
        data: rewardItem
    });
});

// @desc    Update reward item
// @route   PUT /api/rewards/items/:id
// @access  Private/Admin
export const updateRewardItem = catchAsync(async (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update reward items', 403));
    }
    
    let rewardItem = await RewardItem.findById(req.params.id);
    
    if (!rewardItem) {
        return next(new ErrorResponse(`Reward item not found with id of ${req.params.id}`, 404));
    }
    
    // Fields to update
    const fieldsToUpdate = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        pointsCost: req.body.pointsCost,
        termsAndConditions: req.body.termsAndConditions,
        validFrom: req.body.validFrom,
        validUntil: req.body.validUntil,
        totalQuantity: req.body.totalQuantity,
        remainingQuantity: req.body.remainingQuantity,
        isActive: req.body.isActive,
        featuredOrder: req.body.featuredOrder
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // Process uploaded image
    if (req.files && req.files.image) {
        const file = req.files.image;
        
        // Check file type
        if (!file.mimetype.startsWith('image')) {
            return next(new ErrorResponse('Please upload an image file', 400));
        }
        
        // Check file size
        if (file.size > process.env.MAX_FILE_SIZE) {
            return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_SIZE / 1000000}MB`, 400));
        }
        
        try {
            // Delete previous image if exists
            if (rewardItem.image && rewardItem.image.public_id) {
                await cloudinary.uploader.destroy(rewardItem.image.public_id);
            }
            
            // Upload to cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: 'cleanbag/rewards',
                width: 800,
                crop: 'scale'
            });
            
            fieldsToUpdate.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        } catch (error) {
            console.error('Image upload error:', error);
            return next(new ErrorResponse('Problem with file upload', 500));
        }
    }
    
    rewardItem = await RewardItem.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({
        success: true,
        data: rewardItem
    });
});

// @desc    Delete reward item
// @route   DELETE /api/rewards/items/:id
// @access  Private/Admin
export const deleteRewardItem = catchAsync(async (req, res, next) => {
    // Check if user is admin
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete reward items', 403));
    }
    
    const rewardItem = await RewardItem.findById(req.params.id);
    
    if (!rewardItem) {
        return next(new ErrorResponse(`Reward item not found with id of ${req.params.id}`, 404));
    }
    
    // Delete image from cloudinary
    if (rewardItem.image && rewardItem.image.public_id) {
        await cloudinary.uploader.destroy(rewardItem.image.public_id);
    }
    
    await rewardItem.deleteOne();
    
    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Redeem reward item
// @route   POST /api/rewards/items/:id/redeem
// @access  Private
export const redeemRewardItem = catchAsync(async (req, res, next) => {
    const rewardItem = await RewardItem.findById(req.params.id);
    
    if (!rewardItem) {
        return next(new ErrorResponse(`Reward item not found with id of ${req.params.id}`, 404));
    }
    
    // Check if reward is active
    if (!rewardItem.isActive) {
        return next(new ErrorResponse('This reward is not active', 400));
    }
    
    // Check if reward has expired
    if (rewardItem.validUntil < new Date()) {
        return next(new ErrorResponse('This reward has expired', 400));
    }
    
    // Check if reward is out of stock
    if (rewardItem.remainingQuantity === 0) {
        return next(new ErrorResponse('This reward is out of stock', 400));
    }
    
    // Check if user has enough points
    if (req.user.rewardPoints < rewardItem.pointsCost) {
        return next(new ErrorResponse('Insufficient reward points', 400));
    }
    
    try {
        // Redeem the reward
        const redemptionResult = await rewardItem.redeem(req.user.id);
        
        res.status(200).json({
            success: true,
            data: {
                code: redemptionResult.code,
                reward: redemptionResult.reward,
                remainingPoints: redemptionResult.remainingPoints
            }
        });
    } catch (error) {
        return next(new ErrorResponse(error.message, 400));
    }
});

// @desc    Get user's reward redemptions
// @route   GET /api/rewards/redemptions
// @access  Private
export const getUserRedemptions = catchAsync(async (req, res, next) => {
    const rewardItems = await RewardItem.find({
        'redemptions.user': req.user.id
    });
    
    // Extract user's redemptions from each reward item
    const redemptions = [];
    
    rewardItems.forEach(item => {
        const userRedemptions = item.redemptions.filter(
            r => r.user.toString() === req.user.id
        );
        
        userRedemptions.forEach(redemption => {
            redemptions.push({
                _id: redemption._id,
                rewardItem: {
                    _id: item._id,
                    name: item.name,
                    description: item.description,
                    category: item.category,
                    pointsCost: item.pointsCost,
                    image: item.image
                },
                redeemedAt: redemption.redeemedAt,
                code: redemption.code,
                status: redemption.status,
                usedAt: redemption.usedAt
            });
        });
    });
    
    // Sort by redemption date (newest first)
    redemptions.sort((a, b) => b.redeemedAt - a.redeemedAt);
    
    res.status(200).json({
        success: true,
        count: redemptions.length,
        data: redemptions
    });
});

// @desc    Get reward statistics
// @route   GET /api/rewards/stats
// @access  Private/Admin
export const getRewardStats = catchAsync(async (req, res, next) => {
    // Only allow admins
    if (req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this data', 403));
    }
    
    // Get total points earned and redeemed
    const pointsStats = await RewardTransaction.aggregate([
        {
            $group: {
                _id: '$type',
                totalPoints: { $sum: '$points' }
            }
        }
    ]);
    
    // Get transactions by source type
    const transactionsBySource = await RewardTransaction.aggregate([
        {
            $group: {
                _id: '$sourceType',
                count: { $sum: 1 },
                totalPoints: { $sum: '$points' }
            }
        }
    ]);
    
    // Get redemptions by category
    const redemptionsByCategory = await RewardItem.aggregate([
        {
            $match: {
                'redemptions.0': { $exists: true }
            }
        },
        {
            $unwind: '$redemptions'
        },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalPoints: { $sum: '$pointsCost' }
            }
        }
    ]);
    
    // Get top users by points
    const topUsers = await User.find({ role: 'resident' })
        .sort({ rewardPoints: -1 })
        .limit(10)
        .select('name avatar rewardPoints');
    
    // Format points stats into an object
    const formattedPointsStats = {
        earned: 0,
        redeemed: 0
    };
    
    pointsStats.forEach(item => {
        if (item._id === 'earned') {
            formattedPointsStats.earned = item.totalPoints;
        } else if (item._id === 'redeemed') {
            formattedPointsStats.redeemed = Math.abs(item.totalPoints);
        }
    });
    
    // Format transactions by source into an object
    const formattedTransactionsBySource = {};
    transactionsBySource.forEach(item => {
        formattedTransactionsBySource[item._id] = {
            count: item.count,
            totalPoints: item.totalPoints
        };
    });
    
    // Format redemptions by category into an object
    const formattedRedemptionsByCategory = {};
    redemptionsByCategory.forEach(item => {
        formattedRedemptionsByCategory[item._id] = {
            count: item.count,
            totalPoints: item.totalPoints
        };
    });
    
    res.status(200).json({
        success: true,
        data: {
            pointsStats: formattedPointsStats,
            transactionsBySource: formattedTransactionsBySource,
            redemptionsByCategory: formattedRedemptionsByCategory,
            topUsers
        }
    });
});