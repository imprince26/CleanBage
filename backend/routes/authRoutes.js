import express from 'express';
import {
    registerUser,
    verifyEmail,
    loginUser,
    googleAuth,
    googleCallback,
    logoutUser,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    updateFcmToken
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/fcmtoken', protect, updateFcmToken);

export default router;