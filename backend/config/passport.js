import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

export default function configurePassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: {
            url: profile.photos[0].value,
            publicId: null
          },
          verified: true,
          verifiedAt: new Date(),
          role: 'resident',
          rewardPoints: 50 // Welcome bonus
        });
      } else if (!user.googleId) {
        // Update existing user with Google info
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
}