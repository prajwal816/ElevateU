import codeExecutionService from '../services/codeExecutionService.js';

export const testJudge0Connection = async (req, res, next) => {
    try {
        // Test with a simple "Hello World" program
        const testCode = 'console.log("Hello from Judge0!");';
        const result = await codeExecutionService.executeCode(testCode, 'javascript');

        res.json({
            success: true,
            message: "Judge0 API connection successful",
            result: {
                status: result.status,
                stdout: result.stdout,
                stderr: result.stderr,
                time: result.time,
                memory: result.memory,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Judge0 API connection failed",
            error: error.message,
        });
    }
};

export const testBackendHealth = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: "Backend is healthy",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            judge0Configured: !!process.env.JUDGE0_API_KEY,
        });
    } catch (error) {
        next(error);
    }
};