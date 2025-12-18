import mongoose from "mongoose";

const practiceSessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Session details
    sessionId: {
        type: String,
        required: true,
        unique: true
    },

    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },

    endTime: Date,

    // Optional problem context
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodeProblem"
    },

    language: {
        type: String,
        enum: ["javascript", "python", "java", "cpp", "c", "typescript", "go", "rust"]
    },

    // Activity metrics
    totalTimeSpent: {
        type: Number,
        default: 0
    }, // in seconds

    linesOfCode: {
        type: Number,
        default: 0
    },

    keystrokes: {
        type: Number,
        default: 0
    },

    // Submissions during this session
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodeSubmission"
    }],

    // Session status
    status: {
        type: String,
        enum: ["active", "completed", "abandoned"],
        default: "active"
    },

    // Metadata
    userAgent: String,
    ipAddress: String,

}, { timestamps: true });

// Add indexes
practiceSessionSchema.index({ student: 1, startTime: -1 });
practiceSessionSchema.index({ sessionId: 1 });
practiceSessionSchema.index({ status: 1 });

export default mongoose.model("PracticeSession", practiceSessionSchema);