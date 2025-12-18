import codeArenaService from '../services/codeArenaService.js';

/**
 * Submit code for execution
 * POST /api/code/submit
 */
export const submitCode = async (req, res, next) => {
    try {
        const { source_code, language_id, stdin } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!source_code) {
            res.status(400);
            throw new Error('source_code is required');
        }

        if (!language_id) {
            res.status(400);
            throw new Error('language_id is required');
        }

        // Map language_id to language name (for backward compatibility)
        const languageMap = {
            63: 'javascript',
            71: 'python',
            62: 'java',
            54: 'cpp',
            50: 'c',
        };

        const language = languageMap[language_id] || 'javascript';

        // Submit code to CodeArena
        const result = await codeArenaService.submitCode(source_code, language, stdin || '', userId);

        res.json({
            success: true,
            token: result.token,
            remainingExecutions: result.remainingExecutions,
            message: 'Code submitted successfully',
        });
    } catch (error) {
        // Handle specific error types
        if (error.message.includes('Daily execution limit') ||
            error.message.includes('Please wait') ||
            error.message.includes('API rate limit')) {
            res.status(429).json({
                success: false,
                error: error.message,
                type: 'RATE_LIMIT_ERROR',
            });
        } else {
            next(error);
        }
    }
};

/**
 * Get execution result by token
 * GET /api/code/result/:token
 */
export const getResult = async (req, res, next) => {
    try {
        const { token } = req.params;
        const userId = req.user._id;

        if (!token) {
            res.status(400);
            throw new Error('Token is required');
        }

        // Get result from CodeArena
        const result = await codeArenaService.getResult(token);

        // Add user execution stats
        const executionStats = codeArenaService.getUserExecutionStats(userId);

        res.json({
            success: true,
            result: {
                status: result.status,
                isProcessing: result.isProcessing,
                stdout: result.stdout,
                stderr: result.stderr,
                compile_output: result.compile_output,
                time: result.time,
                memory: result.memory,
                exit_code: result.exit_code,
            },
            executionStats,
        });
    } catch (error) {
        if (error.message.includes('API rate limit')) {
            res.status(429).json({
                success: false,
                error: error.message,
                type: 'RATE_LIMIT_ERROR',
            });
        } else {
            next(error);
        }
    }
};

/**
 * Get user execution statistics
 * GET /api/code/stats
 */
export const getExecutionStats = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const stats = codeArenaService.getUserExecutionStats(userId);

        res.json({
            success: true,
            stats,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Submit code with language name (alternative endpoint)
 * POST /api/code/execute
 */
export const executeCode = async (req, res, next) => {
    try {
        const { code, language, stdin } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!code || !language) {
            res.status(400);
            throw new Error('Code and language are required');
        }

        // Submit code to CodeArena
        const result = await codeArenaService.submitCode(code, language, stdin || '', userId);

        res.json({
            success: true,
            token: result.token,
            remainingExecutions: result.remainingExecutions,
            message: 'Code submitted successfully',
        });
    } catch (error) {
        // Handle specific error types
        if (error.message.includes('Daily execution limit') ||
            error.message.includes('Please wait') ||
            error.message.includes('API rate limit')) {
            res.status(429).json({
                success: false,
                error: error.message,
                type: 'RATE_LIMIT_ERROR',
            });
        } else {
            next(error);
        }
    }
};