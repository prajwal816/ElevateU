// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g., http://localhost:5000/api/auth/google/callback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user for first-time OAuth login
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            role: "Student", // default role
            password: null,  // no password required
            isVerified: true // OAuth users are automatically verified
          });
        } else if (!user.googleId) {
          // Link existing account to Google if email exists
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        done(null, { token });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
