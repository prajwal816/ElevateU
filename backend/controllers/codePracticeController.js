import CodeProblem from "../models/CodeProblem.js";
import CodeSubmission from "../models/CodeSubmission.js";
import CodeProgress from "../models/CodeProgress.js";
import User from "../models/User.js";

// Get all problems with filters
export const getProblems = async (req, res, next) => {
    try {
        const {
            difficulty,
            category,
            status,
            search,
            page = 1,
            limit = 20
        } = req.query;

        let query = { isActive: true };

        // Apply filters
        if (difficulty && difficulty !== 'all') {
            query.difficulty = difficulty;
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const problems = await CodeProblem.find(query)
            .select('-solution -testCases.expectedOutput') // Hide solutions and expected outputs
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // If user is logged in, check which problems they've solved
        if (req.user) {
            const userProgress = await CodeProgress.findOne({ student: req.user._id });
            const solvedProblemIds = userProgress?.solvedProblems || [];

            problems.forEach(problem => {
                problem._doc.solved = solvedProblemIds.includes(problem._id);
            });
        }

        const total = await CodeProblem.countDocuments(query);

        res.json({
            problems,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get problem by ID
export const getProblemById = async (req, res, next) => {
    try {
        const problem = await CodeProblem.findById(req.params.id)
            .select('-solution'); // Hide solution

        if (!problem || !problem.isActive) {
            res.status(404);
            throw new Error("Problem not found");
        }

        // Check if user has solved this problem
        let solved = false;
        if (req.user) {
            const userProgress = await CodeProgress.findOne({ student: req.user._id });
            solved = userProgress?.solvedProblems.includes(problem._id) || false;
        }

        res.json({ ...problem.toObject(), solved });
    } catch (err) {
        next(err);
    }
};

// Submit code for execution
export const submitCode = async (req, res, next) => {
    try {
        const { problemId, code, language } = req.body;

        if (!problemId || !code || !language) {
            res.status(400);
            throw new Error("Problem ID, code, and language are required");
        }

        const problem = await CodeProblem.findById(problemId);
        if (!problem || !problem.isActive) {
            res.status(404);
            throw new Error("Problem not found");
        }

        // Create submission record
        const submission = await CodeSubmission.create({
            problem: problemId,
            student: req.user._id,
            code,
            language,
            status: "Running",
            totalTestCases: problem.testCases.length
        });

        // Mock code execution (replace with actual code execution service)
        const executionResult = await executeCode(code, language, problem.testCases);

        // Update submission with results
        submission.status = executionResult.status;
        submission.testResults = executionResult.testResults;
        submission.passedTestCases = executionResult.passedTestCases;
        submission.executionTime = executionResult.executionTime;
        submission.memoryUsed = executionResult.memoryUsed;
        submission.error = executionResult.error;

        // Calculate XP if accepted
        if (executionResult.status === "Accepted") {
            const xpReward = calculateXPReward(problem.difficulty);
            submission.xpEarned = xpReward;

            // Update user progress
            await updateUserProgress(req.user._id, problemId, xpReward);
        }

        await submission.save();

        // Update problem statistics
        await CodeProblem.findByIdAndUpdate(problemId, {
            $inc: {
                totalSubmissions: 1,
                ...(executionResult.status === "Accepted" && { successfulSubmissions: 1 })
            }
        });

        res.json({
            submissionId: submission._id,
            status: submission.status,
            testResults: submission.testResults.map(result => ({
                passed: result.passed,
                input: result.input,
                expectedOutput: result.expectedOutput,
                actualOutput: result.actualOutput,
                executionTime: result.executionTime,
                error: result.error
            })),
            passedTestCases: submission.passedTestCases,
            totalTestCases: submission.totalTestCases,
            executionTime: submission.executionTime,
            memoryUsed: submission.memoryUsed,
            xpEarned: submission.xpEarned
        });
    } catch (err) {
        next(err);
    }
};

// Get user's code progress
export const getUserProgress = async (req, res, next) => {
    try {
        let progress = await CodeProgress.findOne({ student: req.user._id });

        if (!progress) {
            // Create initial progress record
            progress = await CodeProgress.create({
                student: req.user._id,
                categoryProgress: [],
                difficultyProgress: [
                    { difficulty: "Easy", problemsSolved: 0, totalProblems: 0 },
                    { difficulty: "Medium", problemsSolved: 0, totalProblems: 0 },
                    { difficulty: "Hard", problemsSolved: 0, totalProblems: 0 }
                ],
                dailyActivity: []
            });
        }

        // Get total problems count for each category and difficulty
        const categories = await CodeProblem.distinct("category", { isActive: true });
        const categoryStats = await Promise.all(
            categories.map(async (category) => {
                const total = await CodeProblem.countDocuments({ category, isActive: true });
                const userProgress = progress.categoryProgress.find(cp => cp.category === category);
                return {
                    category,
                    solved: userProgress?.problemsSolved || 0,
                    total,
                    percentage: total > 0 ? Math.round(((userProgress?.problemsSolved || 0) / total) * 100) : 0
                };
            })
        );

        const difficultyStats = await Promise.all(
            ["Easy", "Medium", "Hard"].map(async (difficulty) => {
                const total = await CodeProblem.countDocuments({ difficulty, isActive: true });
                const userProgress = progress.difficultyProgress.find(dp => dp.difficulty === difficulty);
                return {
                    difficulty,
                    solved: userProgress?.problemsSolved || 0,
                    total,
                    percentage: total > 0 ? Math.round(((userProgress?.problemsSolved || 0) / total) * 100) : 0
                };
            })
        );

        res.json({
            ...progress.toObject(),
            categoryStats,
            difficultyStats
        });
    } catch (err) {
        next(err);
    }
};

// Get user's submissions
export const getUserSubmissions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, problemId } = req.query;

        let query = { student: req.user._id };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (problemId) {
            query.problem = problemId;
        }

        const submissions = await CodeSubmission.find(query)
            .populate('problem', 'title difficulty category')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CodeSubmission.countDocuments(query);

        res.json({
            submissions,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get leaderboard
export const getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 50 } = req.query;

        const leaderboard = await CodeProgress.find()
            .populate('student', 'name email')
            .sort({ totalXP: -1 })
            .limit(parseInt(limit));

        // Update ranks
        for (let i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].rank !== i + 1) {
                await CodeProgress.findByIdAndUpdate(leaderboard[i]._id, { rank: i + 1 });
                leaderboard[i].rank = i + 1;
            }
        }

        res.json(leaderboard);
    } catch (err) {
        next(err);
    }
};

// Helper functions
const executeCode = async (code, language, testCases) => {
    // Mock implementation - replace with actual code execution service
    // This would typically call a sandboxed code execution service

    const mockResults = testCases.map((testCase, index) => ({
        testCaseId: testCase._id,
        passed: Math.random() > 0.3, // 70% pass rate for demo
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: testCase.expectedOutput, // Mock correct output
        executionTime: Math.floor(Math.random() * 100) + 10, // 10-110ms
        memoryUsed: Math.floor(Math.random() * 50) + 10, // 10-60MB
        error: null
    }));

    const passedTestCases = mockResults.filter(r => r.passed).length;
    const status = passedTestCases === testCases.length ? "Accepted" : "Wrong Answer";

    return {
        status,
        testResults: mockResults,
        passedTestCases,
        executionTime: mockResults.reduce((sum, r) => sum + r.executionTime, 0) / mockResults.length,
        memoryUsed: mockResults.reduce((sum, r) => sum + r.memoryUsed, 0) / mockResults.length,
        error: null
    };
};

const calculateXPReward = (difficulty) => {
    const xpMap = {
        "Easy": 10,
        "Medium": 25,
        "Hard": 50
    };
    return xpMap[difficulty] || 10;
};

const updateUserProgress = async (userId, problemId, xpEarned) => {
    const problem = await CodeProblem.findById(problemId);
    let progress = await CodeProgress.findOne({ student: userId });

    if (!progress) {
        progress = await CodeProgress.create({ student: userId });
    }

    // Check if problem was already solved
    if (progress.solvedProblems.includes(problemId)) {
        return; // Don't update if already solved
    }

    // Add to solved problems
    progress.solvedProblems.push(problemId);
    progress.totalProblemsSolved += 1;
    progress.totalXP += xpEarned;

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
    } else {
        progress.dailyActivity.push({
            date: today,
            problemsSolved: 1,
            timeSpent: 0,
            submissions: 1
        });
    }

    // Keep only last 30 days of activity
    progress.dailyActivity = progress.dailyActivity
        .filter(da => (today - da.date) / (1000 * 60 * 60 * 24) <= 30)
        .sort((a, b) => b.date - a.date);

    // Check for achievements
    await checkAndAwardAchievements(progress);

    await progress.save();

    // Update user XP
    await User.findByIdAndUpdate(userId, { $inc: { xp: xpEarned } });
};

const checkAndAwardAchievements = async (progress) => {
    const achievements = [
        {
            id: "first_solve",
            title: "First Steps",
            description: "Solved your first problem",
            condition: () => progress.totalProblemsSolved >= 1
        },
        {
            id: "problem_solver",
            title: "Problem Solver",
            description: "Solved 10 problems",
            condition: () => progress.totalProblemsSolved >= 10
        },
        {
            id: "streak_master",
            title: "Streak Master",
            description: "5-day solving streak",
            condition: () => progress.currentStreak >= 5
        },
        {
            id: "hard_worker",
            title: "Hard Worker",
            description: "Solved a hard problem",
            condition: () => progress.difficultyProgress.find(dp => dp.difficulty === "Hard")?.problemsSolved >= 1
        }
    ];

    for (const achievement of achievements) {
        const alreadyEarned = progress.achievements.find(a => a.achievementId === achievement.id);
        if (!alreadyEarned && achievement.condition()) {
            progress.achievements.push({
                achievementId: achievement.id,
                title: achievement.title,
                description: achievement.description,
                earnedAt: new Date()
            });
        }
    }
};

const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
};

const isConsecutiveDay = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};