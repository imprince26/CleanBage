import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Helper function to generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    });
};

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", 
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

// Register new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, pic, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            pic: pic ,
            role: role
        });

        const token = generateToken(user._id);

        // Set cookie
        res.cookie("token", token, cookieOptions);

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        // Set cookie
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Logout user
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.pic) user.pic = req.body.pic;
        if (req.body.password) user.password = req.body.password;

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                pic: updatedUser.pic,
                role: updatedUser.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Middleware to protect routes
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found"
            });
        }

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Not authorized, token failed"
        });
    }
};