import express from "express";
import passport from "passport";
import {
  register,
  login,
  getProfile,
  verifyEmail,
  resendVerification,
  updateProfile,
  updateNotificationSettings,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Normal Auth
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/notifications", protect, updateNotificationSettings);

// Email verification
router.get("/verify-email", verifyEmail);
router.post("/verify-email/resend", resendVerification);

// Google OAuth
router.get(
  "/google",
  (req, res, next) => {
    req.session.selectedRole = req.query.role; // save selected role
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = req.user.token;
    const role = req.user.role;
    const selectedRole = req.session?.selectedRole || "student";

    res.redirect(
      `http://localhost:5173/auth/callback?token=${token}&role=${role}&selectedRole=${selectedRole}`
    );
  }
);

export default router;
