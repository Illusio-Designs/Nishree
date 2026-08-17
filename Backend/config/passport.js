import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../model/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Only register Google OAuth when it's actually configured. Instantiating the
// strategy without a clientID throws at startup and crashes the whole API, so
// skip it gracefully when the env vars aren't set.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/users/auth/google/callback",
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({
                where: {
                    googleId: profile.id
                }
            });

            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    username: profile.displayName || profile.name.givenName,
                    email: profile.emails[0].value,
                    profileImage: profile.photos[0]?.value || null,
                    role: 'consumer',
                    status: 'active'
                });
            }

            return done(null, user);
        } catch (error) {
            console.error('Google OAuth Error:', error);
            return done(error, null);
        }
    }));
    console.log('[auth] Google OAuth strategy enabled');
} else {
    console.warn('[auth] Google OAuth disabled — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set');
}

// These are required for maintaining sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
