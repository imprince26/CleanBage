import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
    try {
        let CleanBageToken;
        
        // Get CleanBageToken from cookies or authorization header
        if (req.cookies.CleanBageToken) {
            CleanBageToken = req.cookies.CleanBageToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            CleanBageToken = req.headers.authorization.split(' ')[1];
        }
        
        // If no CleanBageToken, return error
        if (!CleanBageToken) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        // Verify CleanBageToken
        const decoded = jwt.verify(CleanBageToken, process.env.JWT_SECRET);
        
        // Get user from the CleanBageToken
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update last active
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Middleware to authorize specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        
        next();
    };
};

// Middleware to check if user is verified
export const isVerified = async (req, res, next) => {
    try {
        if (!req.user.verified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address'
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Middleware to set user if CleanBageToken exists (for optional authentication)
export const optionalAuth = async (req, res, next) => {
    try {
        let CleanBageToken;
        
        if (req.cookies.CleanBageToken) {
            CleanBageToken = req.cookies.CleanBageToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            CleanBageToken = req.headers.authorization.split(' ')[1];
        }
        
        if (!CleanBageToken) {
            return next();
        }
        
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
};