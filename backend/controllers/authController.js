import crypto from 'crypto';
import User from '../models/userModel.js';
import { RewardTransaction } from '../models/rewardModel.js';
import Notification from '../models/notificationModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';
import { sendTokenResponse } from '../utils/tokenUtils.js';
import sendEmail from '../utils/emailService.js';

export const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        return next(new ErrorResponse('Please provide name, email and password', 400));
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new ErrorResponse('Email already registered', 400));
    }

    // Default role to resident if not specified or if trying to register as admin
    const userRole = (!role || role === 'admin') ? 'resident' : role;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: userRole,
        verified: false
    });

    // Generate verification token
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" target="_blank">Verify Email</a>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'CleanBage - Email Verification',
            message
        });

        // Add initial rewards for registration
        await RewardTransaction.create({
            user: user._id,
            type: 'earned',
            points: 50,
            description: 'Welcome bonus for registration',
            sourceType: 'system',
            balance: 50,
            status: 'completed'
        });

        // Update user reward points
        user.rewardPoints = 50;
        await user.save({ validateBeforeSave: false });

        // Create welcome notification
        await Notification.createNotification({
            recipient: user._id,
            type: 'system_announcement',
            title: 'Welcome to CleanBage!',
            message: 'Thank you for registering with CleanBage. Start reporting waste bins to earn rewards!',
            priority: 'high',
            icon: 'bell',
            action: {
                text: 'Explore App',
                url: '/'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (err) {
        console.log(err);
        user.verificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});


export const verifyEmail = catchAsync(async (req, res, next) => {
    // Get hashed token
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        verificationToken,
        verified: false
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set verified to true and unset verification token
    user.verified = true;
    user.verifiedAt = Date.now();
    user.verificationToken = undefined;

    await user.save();

    const token = user.getSignedJwtToken();

    res.cookie('CleanBageToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    });

    sendTokenResponse(user, 200, res);
});

export const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user is verified
    if (!user.verified) {
        return next(new ErrorResponse('Please verify your email address', 403));
    }

    const token = user.getSignedJwtToken();

    res.cookie('CleanBageToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    });

    // Create notification for login
    await Notification.createNotification({
        recipient: user._id,
        type: 'system_announcement',
        title: 'New Login Detected',
        message: `New login to your account detected at ${new Date().toLocaleString()}`,
        priority: 'medium',
        icon: 'log-in'
    });

    sendTokenResponse(user, 200, res);
});

export const googleCallback = async (req, res, next) => {
    try {
      // Create notification for Google login
      await Notification.create({
        recipient: req.user._id,
        type: 'system_announcement',
        title: 'Google Login Success',
        message: `Successfully logged in with Google at ${new Date().toLocaleString()}`,
        priority: 'medium',
        icon: 'google',
        read: false
      });
  
      // Send token response
      sendTokenResponse(req.user, 200, res);
      
      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/auth/google/success`);
    } catch (error) {
      // Redirect to frontend with error
      res.redirect(`${process.env.CLIENT_URL}/auth/google/error`);
    }
  };

export const logoutUser = catchAsync(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});


export const getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user: user
    });
});


export const updateDetails = catchAsync(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        notification: req.body.notification
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key =>
        fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    if (fieldsToUpdate.email) {
        const existingUser = await User.findOne({ email: fieldsToUpdate.email });
        if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
            return next(new ErrorResponse('Email already in use', 400));
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});


export const updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    // Create notification for password change
    await Notification.createNotification({
        recipient: user._id,
        type: 'system_announcement',
        title: 'Password Updated',
        message: 'Your password has been successfully updated',
        priority: 'high',
        icon: 'key'
    });

    sendTokenResponse(user, 200, res);
});


export const forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'CleanBage - Password Reset',
            message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});


export const resetPassword = catchAsync(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Create notification for password reset
    await Notification.createNotification({
        recipient: user._id,
        type: 'system_announcement',
        title: 'Password Reset',
        message: 'Your password has been successfully reset',
        priority: 'high',
        icon: 'refresh-cw'
    });

    sendTokenResponse(user, 200, res);
});

export const updateFcmToken = catchAsync(async (req, res, next) => {
    const { fcmToken } = req.body;

    if (!fcmToken) {
        return next(new ErrorResponse('FCM token is required', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { fcmToken },
        { new: true }
    );

    res.status(200).json({
        success: true,
        data: user
    });
});