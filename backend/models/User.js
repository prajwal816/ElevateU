// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },

  // password required only for non-OAuth users
  password: {
    type: String,
    required: function () {
      return !this.googleId; // only required if googleId is not set
    },
  },

  role: {
    type: String,
    enum: ["Student", "Teacher"],
    required: true,
    default: "Student", // default role for Google OAuth
  },

  googleId: { type: String }, // optional, used for OAuth users

  // Email verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationExpires: { type: Date, default: null },

  // Gamification
  xp: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  
  // Profile
  bio: String,
  avatar: String,
  profilePicture: String,
  
  // Notification Settings
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    assignmentReminders: { type: Boolean, default: true },
    gradeNotifications: { type: Boolean, default: true },
    forumReplies: { type: Boolean, default: true },
    courseAnnouncements: { type: Boolean, default: true },
  },
}, { timestamps: true });

// hash password before saving (skip if no password)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
