import GoogleStrategy from 'passport-google-oauth20';
import passport from 'passport';
import User from '../models/userModel.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL

const googleStrategy = new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: crypto.randomBytes(20).toString('hex'),
                verified: true,
                verifiedAt: new Date(),
                googleId: profile.id,
                avatar: {
                    url: profile.photos[0].value
                }
            });
        } else if (!user.googleId) {
            user.googleId = profile.id;
            if (!user.avatar.url) {
                user.avatar = {
                    url: profile.photos[0].value
                };
            }
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
});

passport.use(googleStrategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
