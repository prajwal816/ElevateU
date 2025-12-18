import PracticeSession from '../models/PracticeSession.js';
import CodeProgress from '../models/CodeProgress.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Start a new practice session
 */
export const startPracticeSession = async (req, res, next) => {
    try {
        const { problemId, language } = req.body;
        const userId = req.user._id;

        // End any existing active sessions for this user
        await PracticeSession.updateMany(
            { student: userId, status: 'active' },
            {
                status: 'abandoned',
                endTime: new Date()
            }
        );

        // Create new session
        const sessionId = uuidv4();
        const session = await PracticeSession.create({
            student: userId,
            sessionId,
            problem: problemId || null,
            language: language || null,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
        });

        res.json({
            sessionId: session.sessionId,
            startTime: session.startTime,
            problemId: session.problem,
            language: session.language,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * End a practice session
 */
export const endPracticeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user._id;

        const session = await PracticeSession.findOne({
            sessionId,
            student: userId,
            status: 'active',
        });

        if (!session) {
            res.status(404);
            throw new Error('Active session not found');
        }

        // Calculate total time spent
        const endTime = new Date();
        const totalTimeSpent = Math.floor((endTime - session.startTime) / 1000); // in seconds

        // Update session
        session.endTime = endTime;
        session.totalTimeSpent = Math.max(session.totalTimeSpent, totalTimeSpent);
        session.status = 'completed';
        await session.save();

        // Update user's code progress with practice time
        await updatePracticeTime(userId, totalTimeSpent);

        res.json({
            message: 'Practice session ended successfully',
            sessionId: session.sessionId,
            totalTimeSpent: session.totalTimeSpent,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update practice session activity
 */
export const updatePracticeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { timeSpent, linesOfCode, keystrokes } = req.body;
        const userId = req.user._id;

        const session = await PracticeSession.findOne({
            sessionId,
            student: userId,
            status: 'active',
        });

        if (!session) {
            res.status(404);
            throw new Error('Active session not found');
        }

        // Update session metrics
        if (timeSpent !== undefined) {
            session.totalTimeSpent = Math.max(session.totalTimeSpent, timeSpent);
        }
        if (linesOfCode !== undefined) {
            session.linesOfCode = Math.max(session.linesOfCode, linesOfCode);
        }
        if (keystrokes !== undefined) {
            session.keystrokes = Math.max(session.keystrokes, keystrokes);
        }

        await session.save();

        res.json({ message: 'Session updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's practice sessions
 */
export const getPracticeSessions = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, status } = req.query;

        let query = { student: userId };
        if (status) {
            query.status = status;
        }

        const sessions = await PracticeSession.find(query)
            .populate('problem', 'title difficulty category')
            .sort({ startTime: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await PracticeSession.countDocuments(query);

        res.json({
            sessions,
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

/**
 * Get practice session statistics
 */
export const getPracticeStats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get sessions in the specified period
        const sessions = await PracticeSession.find({
            student: userId,
            startTime: { $gte: startDate },
            status: { $in: ['completed', 'abandoned'] },
        });

        // Calculate statistics
        const totalSessions = sessions.length;
        const totalTimeSpent = sessions.reduce((sum, session) => sum + (session.totalTimeSpent || 0), 0);
        const averageSessionTime = totalSessions > 0 ? Math.floor(totalTimeSpent / totalSessions) : 0;

        // Group by date for daily activity
        const dailyActivity = {};
        sessions.forEach(session => {
            const date = session.startTime.toISOString().split('T')[0];
            if (!dailyActivity[date]) {
                dailyActivity[date] = {
                    date,
                    sessions: 0,
                    timeSpent: 0,
                    linesOfCode: 0,
                };
            }
            dailyActivity[date].sessions += 1;
            dailyActivity[date].timeSpent += session.totalTimeSpent || 0;
            dailyActivity[date].linesOfCode += session.linesOfCode || 0;
        });

        // Language usage
        const languageStats = {};
        sessions.forEach(session => {
            if (session.language) {
                languageStats[session.language] = (languageStats[session.language] || 0) + 1;
            }
        });

        res.json({
            totalSessions,
            totalTimeSpent,
            averageSessionTime,
            dailyActivity: Object.values(dailyActivity).sort((a, b) => a.date.localeCompare(b.date)),
            languageStats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active session for user
 */
export const getActiveSession = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const session = await PracticeSession.findOne({
            student: userId,
            status: 'active',
        }).populate('problem', 'title difficulty category');

        if (!session) {
            return res.json({ activeSession: null });
        }

        res.json({
            activeSession: {
                sessionId: session.sessionId,
                startTime: session.startTime,
                problem: session.problem,
                language: session.language,
                totalTimeSpent: session.totalTimeSpent,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to update practice time in user progress
const updatePracticeTime = async (userId, timeSpentSeconds) => {
    try {
        let progress = await CodeProgress.findOne({ student: userId });

        if (!progress) {
            progress = await CodeProgress.create({
                student: userId,
                categoryProgress: [],
                difficultyProgress: [],
                dailyActivity: [],
            });
        }

        // Add time to total
        const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
        progress.totalTimeSpent += timeSpentMinutes;

        // Update today's activity
        const today = new Date();
        let todayActivity = progress.dailyActivity.find(da =>
            da.date.toDateString() === today.toDateString()
        );

        if (todayActivity) {
            todayActivity.timeSpent += timeSpentMinutes;
        } else {
            progress.dailyActivity.push({
                date: today,
                problemsSolved: 0,
                timeSpent: timeSpentMinutes,
                submissions: 0,
            });
        }

        // Keep only last 30 days
        progress.dailyActivity = progress.dailyActivity
            .filter(da => (today - da.date) / (1000 * 60 * 60 * 24) <= 30)
            .sort((a, b) => b.date - a.date);

        await progress.save();
    } catch (error) {
        console.error('Failed to update practice time:', error);
    }
};