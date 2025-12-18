import mongoose from "mongoose";

const categoryProgressSchema = new mongoose.Schema({
    category: { type: String, required: true },
    problemsSolved: { type: Number, default: 0 },
    totalProblems: { type: Number, default: 0 },
    lastSolved: Date,
});

const difficultyProgressSchema = new mongoose.Schema({
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    problemsSolved: { type: Number, default: 0 },
    totalProblems: { type: Number, default: 0 },
    lastSolved: Date,
});

const dailyActivitySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    problemsSolved: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    submissions: { type: Number, default: 0 },
});

const achievementSchema = new mongoose.Schema({
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
});

const codeProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    // Overall statistics
    totalProblemsSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    successfulSubmissions: { type: Number, default: 0 },

    // Streak tracking
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: Date,

    // Time tracking
    totalTimeSpent: { type: Number, default: 0 }, // in minutes

    // XP and ranking
    totalXP: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },

    // Progress by category
    categoryProgress: [categoryProgressSchema],

    // Progress by difficulty
    difficultyProgress: [difficultyProgressSchema],

    // Daily activity (last 30 days)
    dailyActivity: [dailyActivitySchema],

    // Solved problems (for quick lookup)
    solvedProblems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodeProblem"
    }],

    // Achievements
    achievements: [achievementSchema],

    // Preferred programming language
    preferredLanguage: {
        type: String,
        default: "javascript",
        enum: ["javascript", "python", "java", "cpp", "c", "typescript", "go", "rust"]
    },

}, { timestamps: true });

// Add indexes
codeProgressSchema.index({ student: 1 });
codeProgressSchema.index({ totalXP: -1 }); // For leaderboard
codeProgressSchema.index({ rank: 1 });

export default mongoose.model("CodeProgress", codeProgressSchema);