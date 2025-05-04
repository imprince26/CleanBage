import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

const getCookieOptions = () => ({
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  // path: '/',
  // domain: process.env.COOKIE_DOMAIN || undefined,
});

// Send token response with cookie
export const sendTokenResponse = (user, statusCode, res) => {
  console.log(user);
    const token = generateToken(user._id);

    res
      .status(statusCode)
      .cookie('CleanBageToken', token, getCookieOptions())
      .json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          rewardPoints: user.rewardPoints,
          verified: user.verified
        }
      });
  };

// Generate and hash verification token
export const generateVerificationToken = () => {
    // Generate random token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Hash token
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};