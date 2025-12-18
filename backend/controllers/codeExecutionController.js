import codeExecutionService from '../services/codeExecutionService.js';
import CodeSubmission from '../models/CodeSubmission.js';
import CodeProblem from '../models/CodeProblem.js';
import CodeProgress from '../models/CodeProgress.js';
import User from '../models/User.js';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();
const RATE_LIMIT = {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
};

/**
 * Execute code without test cases (for testing/debugging)
 */
export const executeCode = async (req, res, next) => {
    try {
        const { code, language, stdin } = req.body;
        const userId = req.user._id;

        // Rate limiting
        if (!checkRateLimit(userId)) {
            res.status(429);
            throw new Error('Too many requests. Please wait before trying again.');
        }

        // Validate input
        if (!code || !language) {
            res.status(400);
            throw new Error('Code and language are required');
        }

        // Execute code
        const result = await codeExecutionService.executeCode(code, language, stdin);

        res.json({
            success: true,
            result: {
                status: result.status,
                stdout: result.stdout,
                stderr: result.stderr,
                compile_output: result.compile_output,
                time: result.time,
                memory: result.memory,
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Submit code for a specific problem (with test cases)
 */
export const submitCode = async (req, res, next) => {
    try {
        const { problemId, code, language } = req.body;
        const userId = req.user._id;

        // Rate limiting
        if (!checkRateLimit(userId)) {
            res.status(429);
            throw new Error('Too many requests. Please wait before trying again.');
        }

        // Validate input
        if (!problemId || !code || !language) {
            res.status(400);
            throw new Error('Problem ID, code, and language are required');
        }

        // Get problem with test cases
        const problem = await CodeProblem.findById(problemId);
        if (!problem || !problem.isActive) {
            res.status(404);
            throw new Error('Problem not found');
        }

        // Create submission record
        const submission = await CodeSubmission.create({
            problem: problemId,
            student: userId,
            code,
            language,
            status: 'Running',
            totalTestCases: problem.testCases.length,
        });

        try {
            // Execute code against test cases
            const executionResult = await codeExecutionService.executeWithTestCases(
                code,
                language,
                problem.testCases
            );

            // Update submission with results
            submission.status = executionResult.status;
            submission.testResults = executionResult.testResults;
            submission.passedTestCases = executionResult.passedTestCases;
            submission.executionTime = executionResult.executionTime;
            submission.memoryUsed = executionResult.memoryUsed;
            submission.error = executionResult.error;

            // Calculate XP if accepted
            let xpEarned = 0;
            if (executionResult.status === 'Accepted') {
                xpEarned = calculateXPReward(problem.difficulty);
                submission.xpEarned = xpEarned;

                // Update user progress
                await updateUserProgress(userId, problemId, xpEarned, problem);
            }

            await submission.save();

            // Update problem statistics
            await CodeProblem.findByIdAndUpdate(problemId, {
                $inc: {
                    totalSubmissions: 1,
                    ...(executionResult.status === 'Accepted' && { successfulSubmissions: 1 })
                }
            });

            // Return results (hide expected outputs for security)
            const sanitizedResults = executionResult.testResults.map(result => ({
                testCaseId: result.testCaseId,
                passed: result.passed,
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed,
                error: result.error,
                // Don't expose input/expectedOutput for security
            }));

            res.json({
                success: true,
                submissionId: submission._id,
                status: submission.status,
                testResults: sanitizedResults,
                passedTestCases: submission.passedTestCases,
                totalTestCases: submission.totalTestCases,
                executionTime: submission.executionTime,
                memoryUsed: submission.memoryUsed,
                xpEarned: submission.xpEarned,
            });

        } catch (executionError) {
            // Update submission with error
            submission.status = 'Runtime Error';
            submission.error = executionError.message;
            await submission.save();

            res.status(500).json({
                success: false,
                submissionId: submission._id,
                status: 'Runtime Error',
                error: executionError.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get submission details
 */
export const getSubmission = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user._id;

        const submission = await CodeSubmission.findById(submissionId)
            .populate('problem', 'title difficulty category')
            .populate('student', 'name email');

        if (!submission) {
            res.status(404);
            throw new Error('Submission not found');
        }

        // Check if user owns this submission or is admin
        if (submission.student._id.toString() !== userId.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Access denied');
        }

        res.json(submission);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's submissions for a problem
 */
export const getProblemSubmissions = async (req, res, next) => {
    try {
        const { problemId } = req.params;
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const submissions = await CodeSubmission.find({
            problem: problemId,
            student: userId,
        })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-code'); // Don't return code for security

        const total = await CodeSubmission.countDocuments({
            problem: problemId,
            student: userId,
        });

        res.json({
            submissions,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Helper functions
const checkRateLimit = (userId) => {
    const now = Date.now();
    const userKey = userId.toString();

    if (!rateLimitStore.has(userKey)) {
        rateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
        return true;
    }

    const userData = rateLimitStore.get(userKey);

    if (now > userData.resetTime) {
        // Reset window
        rateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
        return true;
    }

    if (userData.count >= RATE_LIMIT.maxRequests) {
        return false;
    }

    userData.count++;
    return true;
};

const calculateXPReward = (difficulty) => {
    const xpMap = {
        'Easy': 10,
        'Medium': 25,
        'Hard': 50,
    };
    return xpMap[difficulty] || 10;
};

const updateUserProgress = async (userId, problemId, xpEarned, problem) => {
    let progress = await CodeProgress.findOne({ student: userId });

    if (!progress) {
        progress = await CodeProgress.create({
            student: userId,
            categoryProgress: [],
            difficultyProgress: [
                { difficulty: 'Easy', problemsSolved: 0, totalProblems: 0 },
                { difficulty: 'Medium', problemsSolved: 0, totalProblems: 0 },
                { difficulty: 'Hard', problemsSolved: 0, totalProblems: 0 },
            ],
            dailyActivity: [],
        });
    }

    // Check if problem was already solved
    if (progress.solvedProblems.includes(problemId)) {
        return; // Don't update if already solved
    }

    // Add to solved problems
    progress.solvedProblems.push(problemId);
    progress.totalProblemsSolved += 1;
    progress.totalXP += xpEarned;
    progress.totalSubmissions += 1;
    progress.successfulSubmissions += 1;

    // Update category progress
    let categoryProgress = progress.categoryProgress.find(cp => cp.category === problem.category);
    if (!categoryProgress) {
        categoryProgress = { category: problem.category, problemsSolved: 0, totalProblems: 0 };
        progress.categoryProgress.push(categoryProgress);
    }
    categoryProgress.problemsSolved += 1;
    categoryProgress.lastSolved = new Date();

    // Update difficulty progress
    let difficultyProgress = progress.difficultyProgress.find(dp => dp.difficulty === problem.difficulty);
    if (!difficultyProgress) {
        difficultyProgress = { difficulty: problem.difficulty, problemsSolved: 0, totalProblems: 0 };
        progress.difficultyProgress.push(difficultyProgress);
    }
    difficultyProgress.problemsSolved += 1;
    difficultyProgress.lastSolved = new Date();

    // Update streak
    const today = new Date();
    const lastSolved = progress.lastSolvedDate;

    if (!lastSolved || isConsecutiveDay(lastSolved, today)) {
        progress.currentStreak += 1;
        progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
    } else if (!isSameDay(lastSolved, today)) {
        progress.currentStreak = 1;
    }

    progress.lastSolvedDate = today;

    // Update daily activity
    const todayActivity = progress.dailyActivity.find(da => isSameDay(da.date, today));
    if (todayActivity) {
        todayActivity.problemsSolved += 1;
        todayActivity.submissions += 1;
    } else {
        progress.dailyActivity.push({
            date: today,
            problemsSolved: 1,
            timeSpent: 0,
            submissions: 1,
        });
    }

    // Keep only last 30 days of activity
    progress.dailyActivity = progress.dailyActivity
        .filter(da => (today - da.date) / (1000 * 60 * 60 * 24) <= 30)
        .sort((a, b) => b.date - a.date);

    await progress.save();

    // Update user XP
    await User.findByIdAndUpdate(userId, { $inc: { xp: xpEarned } });
};

const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
};

const isConsecutiveDay = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};