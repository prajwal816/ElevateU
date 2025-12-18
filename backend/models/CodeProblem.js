import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }, // Hidden test cases for final evaluation
});

const codeProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    category: { type: String, required: true },
    tags: [String],

    // Constraints
    timeLimit: { type: Number, default: 1000 }, // in milliseconds
    memoryLimit: { type: Number, default: 256 }, // in MB

    // Example
    example: {
        input: String,
        output: String,
        explanation: String,
    },

    // Test cases
    testCases: [testCaseSchema],

    // Code templates for different languages
    templates: {
        javascript: String,
        python: String,
        java: String,
        cpp: String,
        c: String,
        typescript: String,
        go: String,
        rust: String,
    },

    // Hints for students
    hints: [String],

    // Solution (for teachers/admins)
    solution: {
        javascript: String,
        python: String,
        java: String,
        cpp: String,
        c: String,
        typescript: String,
        go: String,
        rust: String,
    },

    // Statistics
    totalSubmissions: { type: Number, default: 0 },
    successfulSubmissions: { type: Number, default: 0 },

    // Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

// Add indexes for better query performance
codeProblemSchema.index({ difficulty: 1, category: 1 });
codeProblemSchema.index({ tags: 1 });
codeProblemSchema.index({ isActive: 1 });

export default mongoose.model("CodeProblem", codeProblemSchema);