const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/userModel'); // Adjust the path if needed
const dotenv = require('dotenv');

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/users/auth/google/callback",
    passReqToCallback: true,
    scope: ['profile', 'email']
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google Profile:', profile);
        
        let user = await User.findOne({
            where: { 
                googleId: profile.id 
            }
        });

        if (!user) {
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName || profile.name.givenName,
                email: profile.emails[0].value,
                profilePicture: profile.photos[0]?.value || null,
                role: 'consumer'
            });
        }

        return done(null, user);
    } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error);
    }
}));

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
