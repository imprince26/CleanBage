import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : 'localhost',
  path: '/',
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, address, assignedVehicle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "resident",
      address: address || null,
      assignedVehicle: assignedVehicle || null,
    });

    const CleanBageToken = generateToken(user._id);
    res.cookie("CleanBageToken", CleanBageToken, cookieOptions);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        assignedVehicle: user.assignedVehicle,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const CleanBageToken = generateToken(user._id);

    console.log('Setting cookie with options:', cookieOptions);
res.cookie("CleanBageToken", CleanBageToken, cookieOptions);
console.log('Cookie set, sending response');
console.log(CleanBageToken);


    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        assignedVehicle: user.assignedVehicle,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout user
export const logoutUser = async (req, res) => {
  try {

    res.clearCookie("CleanBageToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    });

    // await BlackListToken.create({ token });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

