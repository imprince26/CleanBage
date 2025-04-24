import jwt from 'jsonwebtoken';

// Generate JWT
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Send token response with cookie
export const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
  
    const options = {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    };
  
    res
      .status(statusCode)
      .cookie('CleanBageToken', token, options)
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