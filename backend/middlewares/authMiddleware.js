import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import ErrorResponse from '../utils/errorResponse.js';

// Middleware to protect routes
export const protect = catchAsync(async (req, res, next) => {
    let CleanBageToken;
    
    // Get CleanBageToken from cookies or authorization header
    if (req.cookies.CleanBageToken) {
        CleanBageToken = req.cookies.CleanBageToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        CleanBageToken = req.headers.authorization.split(' ')[1];
    }
    
    if (!CleanBageToken) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
    
    try {
        // Verify CleanBageToken
        const decoded = jwt.verify(CleanBageToken, process.env.JWT_SECRET);
        
        // Get user from the CleanBageToken
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

// Middleware to set user if CleanBageToken exists (for optional authentication)
export const optionalAuth = catchAsync(async (req, res, next) => {
    let CleanBageToken;
    
    if (req.cookies.CleanBageToken) {
        CleanBageToken = req.cookies.CleanBageToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        CleanBageToken = req.headers.authorization.split(' ')[1];
    }
    
    if (!CleanBageToken) {
        return next();
    }
    
    try {
        const decoded = jwt.verify(CleanBageToken, process.env.JWT_SECRET);
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