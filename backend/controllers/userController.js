import User from '../models/userModel.js';
import { RewardTransaction } from '../models/rewardModel.js';
import Notification from '../models/notificationModel.js';
import Collection from '../models/collectionModel.js';
import Report from '../models/reportModel.js';
import { getCoordinatesFromAddress } from '../utils/geoUtils.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const getUsers = async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Filter
    const filter = {};
    if (req.query.role) {
        filter.role = req.query.role;
    }
    if (req.query.search) {
        filter.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Sort
    const sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
        sort.createdAt = -1;
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
        .select('-__v')
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
        count: users.length,
        pagination,
        total,
        data: users
    });
};

export const getUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new Error(`User not found with id of ${req.params.id}`, 404);
    }

    res.status(200).json({
        success: true,
        data: user
    });
};

export const createUser = async (req, res) => {
    const { name, email, password, role, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
        throw new Error('Please provide name, email, password and role', 400);
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new Error('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        address,
        verified: true // Admin-created users are automatically verified
    });

    // Create notification
    await Notification.createNotification({
        recipient: user._id,
        type: 'system_announcement',
        title: 'Welcome to CleanBage!',
        message: 'Your account has been created by an administrator. Welcome to the CleanBage platform!',
        priority: 'high',
        icon: 'user-plus'
    });

    res.status(201).json({
        success: true,
        data: user
    });
};

export const updateUser = async (req, res) => {
    // Fields to update
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        phone: req.body.phone,
        address: req.body.address,
        assignedVehicle: req.body.assignedVehicle,
        verified: req.body.verified
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Check if email exists
    if (fieldsToUpdate.email) {
        const existingUser = await User.findOne({ email: fieldsToUpdate.email });
        if (existingUser && existingUser._id.toString() !== req.params.id) {
            throw new Error('Email already in use', 400);
        }
    }

    // Update user location if address is provided
    if (fieldsToUpdate.address && typeof fieldsToUpdate.address === 'object') {
        try {
            const addressStr = [
                fieldsToUpdate.address.street,
                fieldsToUpdate.address.city,
                fieldsToUpdate.address.state,
                fieldsToUpdate.address.postalCode
            ].filter(Boolean).join(', ');

            if (addressStr) {
                const coordinates = await getCoordinatesFromAddress(addressStr);
                fieldsToUpdate.location = {
                    type: 'Point',
                    coordinates
                };
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    }

    const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    if (!user) {
        throw new Error(`User not found with id of ${req.params.id}`, 404);
    }

    res.status(200).json({
        success: true,
        data: user
    });
};

export const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new Error(`User not found with id of ${req.params.id}`, 404);
    }

    // Check if user has related data
    const collections = await Collection.find({
        $or: [
            { reportedBy: user._id },
            { assignedCollector: user._id }
        ]
    });

    if (collections.length > 0) {
        throw new Error(`Cannot delete user with associated collections`, 400);
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
};

export const uploadAvatar = async (req, res) => {
    // Check if user is admin or self
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        throw new Error('Not authorized to update this user', 403);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new Error(`User not found with id of ${req.params.id}`, 404);
    }

    if (!req.files || !req.files.avatar) {
        throw new Error('Please upload a file', 400);
    }

    const file = req.files.avatar;

    // Check file type
    if (!file.mimetype.startsWith('image')) {
        throw new Error('Please upload an image file', 400);
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_SIZE) {
        throw new Error(`Please upload an image less than ${process.env.MAX_FILE_SIZE / 1000000}MB`, 400);
    }

    try {
        // Delete previous avatar if exists
        if (user.avatar.public_id) {
            await deleteImage(user.avatar.public_id);
        }

        // Upload to cloudinary
        const result = await uploadImage(file, 'cleanbage/avatars');

        // Update user avatar
        user.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        };

        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        throw new Error('Problem with file upload', 500);
    }
};

export const getUserStats = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new Error(`User not found with id of ${req.params.id}`, 404);
    }

    const stats = {
        reportsCount: 0,
        collectionsCount: 0,
        totalWasteCollected: 0,
        rewardPointsHistory: [],
        userRank: null,
        streakCount: user.streakCount || 0
    };

    // Get reports count (for collectors)
    if (user.role === 'garbage_collector') {
        stats.reportsCount = await Report.countDocuments({ collector: user._id });

        // Get total waste collected
        const reports = await Report.find({ collector: user._id });
        stats.totalWasteCollected = reports.reduce((total, report) => total + (report.wasteVolume || 0), 0);
    }

    // Get collections count (for residents)
    if (user.role === 'resident') {
        stats.collectionsCount = await Collection.countDocuments({ reportedBy: user._id });
    }

    // Get reward points history
    stats.rewardPointsHistory = await RewardTransaction.find({
        user: user._id
    }).sort({ createdAt: -1 }).limit(10);

    // Get user rank (for residents)
    if (user.role === 'resident') {
        const usersRanking = await User.find({
            role: 'resident'
        }).sort({ rewardPoints: -1 });

        const userIndex = usersRanking.findIndex(u => u._id.toString() === user._id.toString());
        stats.userRank = userIndex !== -1 ? userIndex + 1 : null;
    }

    res.status(200).json({
        success: true,
        data: stats
    });
};

export const getLeaderboard = async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    const leaderboard = await User.find({
        role: 'resident',
        rewardPoints: { $gt: 0 }
    })
        .select('name avatar rewardPoints streakCount')
        .sort({ rewardPoints: -1 })
        .limit(limit);

    res.status(200).json({
        success: true,
        count: leaderboard.length,
        data: leaderboard
    });
};