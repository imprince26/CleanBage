import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    protect
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router
    .route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;