import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false,
      verificationToken,
      verificationExpires,
    });

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyLink = `${frontendUrl}/verify?token=${verificationToken}`;

    try {
      console.log("📬 Sending verification email to:", user.email); // ✅ Check recipient
      const info = await sendEmail(
        user.email,
        "Verify your LMS account",
        `
          <h2>Welcome to LMS</h2>
          <p>Click the button below to verify your email address and activate your account.</p>
          <p><a href="${verifyLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${verifyLink}">${verifyLink}</a></p>
          <p>This link expires in 24 hours.</p>
        `
      );
      console.log("✅ Verification email sent successfully:", info.messageId);
    } catch (e) {
      console.error("❌ Verification email failed:", e.message);
    }

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        res.status(403);
        throw new Error("Please verify your email before logging in.");
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      res.status(400);
      throw new Error("Verification token is required");
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired verification token");
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.isVerified) {
      res.status(400);
      throw new Error("Email already verified");
    }

    user.verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyLink = `${frontendUrl}/verify?token=${user.verificationToken}`;

    try {
      console.log("📬 Resending verification email to:", user.email); // ✅ Check recipient
      const info = await sendEmail(
        user.email,
        "Resend: Verify your LMS account",
        `
          <h2>Verify your LMS account</h2>
          <p>Click the button below to verify your email address.</p>
          <p><a href="${verifyLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none">Verify Email</a></p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${verifyLink}">${verifyLink}</a></p>
          <p>This link expires in 24 hours.</p>
        `
      );
      console.log("✅ Verification email resent successfully:", info.messageId);
    } catch (e) {
      console.error("❌ Resend verification email failed:", e.message);
    }

    res.json({ success: true, message: "Verification email resent." });
  } catch (err) {
    next(err);
  }
};


export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error("Email already in use");
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

export const updateNotificationSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Update notification settings
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }
    
    Object.keys(settings).forEach(key => {
      user.notificationSettings[key] = settings[key];
    });

    await user.save();

    res.json({
      message: "Notification settings updated successfully",
      settings: user.notificationSettings,
    });
  } catch (err) {
    next(err);
  }
};
