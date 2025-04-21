import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

// Middleware to protect routes
export const protect = catchAsync(async (req, res, next) => {
    let token;
    
    // Get token from cookies or authorization header
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from the token
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }
        
        // Update last active
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });
        
        req.user = user;
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Middleware to authorize specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse('Not authorized to access this route', 401));
        }
        
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        
        next();
    };
};

// Middleware to check if user is verified
export const isVerified = catchAsync(async (req, res, next) => {
    if (!req.user.verified) {
        return next(new ErrorResponse('Please verify your email address', 403));
    }
    
    next();
});

// Middleware to set user if token exists (for optional authentication)
export const optionalAuth = catchAsync(async (req, res, next) => {
    let token;
    
    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next();
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user) {
            user.lastActive = new Date();
            await user.save({ validateBeforeSave: false });
            req.user = user;
        }
        
        next();
    } catch (error) {
        next();
    }
});