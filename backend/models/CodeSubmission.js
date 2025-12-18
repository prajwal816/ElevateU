import mongoose from "mongoose";

const testResultSchema = new mongoose.Schema({
    testCaseId: mongoose.Schema.Types.ObjectId,
    passed: { type: Boolean, required: true },
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number, // in milliseconds
    memoryUsed: Number, // in MB
    error: String,
});

const codeSubmissionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CodeProblem",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Submission details
    code: { type: String, required: true },
    language: {
        type: String,
        required: true,
        enum: ["javascript", "python", "java", "cpp", "c", "typescript", "go", "rust"]
    },

    // Execution results
    status: {
        type: String,
        enum: ["Pending", "Running", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Memory Limit Exceeded", "Runtime Error", "Compilation Error"],
        default: "Pending"
    },

    testResults: [testResultSchema],

    totalTestCases: { type: Number, default: 0 },
    passedTestCases: { type: Number, default: 0 },

    // Performance metrics
    executionTime: Number, // Average execution time in milliseconds
    memoryUsed: Number, // Average memory used in MB

    // Error details (if any)
    error: String,

    // XP reward (if accepted)
    xpEarned: { type: Number, default: 0 },

}, { timestamps: true });

// Add indexes
codeSubmissionSchema.index({ student: 1, problem: 1 });
codeSubmissionSchema.index({ status: 1 });
codeSubmissionSchema.index({ createdAt: -1 });

export default mongoose.model("CodeSubmission", codeSubmissionSchema);