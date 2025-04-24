import GoogleStrategy from 'passport-google-oauth20';
import passport from 'passport';
import crypto from 'crypto';
import User from '../models/userModel.js';

export const configurePassport = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: crypto.randomBytes(32).toString('hex'),
          verified: true,
          verifiedAt: new Date(),
          googleId: profile.id,
          avatar: {
            url: profile.photos[0].value,
            publicId: null
          },
          role: 'resident', // Default role
          rewardPoints: 50 // Welcome bonus
        });

      } else if (!user.googleId) {
        // If user exists but hasn't logged in with Google before
        user.googleId = profile.id;
        user.verified = true;
        user.verifiedAt = new Date();
        if (!user.avatar?.url) {
          user.avatar = {
            url: profile.photos[0].value,
            publicId: null
          };
        }
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
};