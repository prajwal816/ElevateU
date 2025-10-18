import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import session from "express-session";
import MongoStore from "connect-mongo"; // Import MongoStore for persistent sessions
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import plagiarismRoutes from "./routes/plagiarismRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import studySessionRoutes from "./routes/studySessionRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

// CORS Configuration - Uses the environment variable from Render
app.use(cors({
  origin: process.env.CORS_ORIGIN, // This will be your Vercel URL
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// --- UPDATED SESSION CONFIGURATION ---
// This uses MongoDB to store sessions, making them persistent.
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use a dedicated secret for sessions
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only send cookies over HTTPS in production
      maxAge: 1000 * 60 * 60 * 24 * 7, // Cookie valid for 7 days
    },
  })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Connect to the database
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/plagiarism", plagiarismRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// Custom Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("==> Your service is live ✨");
});