import express from 'express';
import {
    registerUser,
    verifyEmail,
    loginUser,
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
import passport from 'passport';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`
    }),
    (req, res) => {
      try {
        // Generate JWT token
        const token = req.user.getSignedJwtToken();
  
        // Set cookie
        res.cookie('CleanBageToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax', // Changed to lax for OAuth redirects
          expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
        });
  
        // Redirect to frontend with success
        res.redirect(`${process.env.CLIENT_URL}/`);
      } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
      }
    }
  );
router.get('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/fcmtoken', protect, updateFcmToken);

export default router;