import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CODEARENA_API_URL = process.env.CODEARENA_API_URL;
const CODEARENA_API_KEY = process.env.CODEARENA_API_KEY;
const CODEARENA_API_HOST = process.env.CODEARENA_API_HOST;
const DAILY_EXECUTION_LIMIT = parseInt(process.env.DAILY_EXECUTION_LIMIT) || 100;
const EXECUTION_COOLDOWN_SECONDS = parseInt(process.env.EXECUTION_COOLDOWN_SECONDS) || 3;

// Language ID mappings for CodeArena/Judge0
const LANGUAGE_IDS = {
    javascript: 63, // Node.js (18.15.0)
    python: 71,     // Python (3.8.1)
    java: 62,       // Java (OpenJDK 13.0.1)
    cpp: 54,        // C++ (GCC 9.2.0)
    c: 50,          // C (GCC 9.2.0)
};

// Security limits
const EXECUTION_LIMITS = {
    timeLimit: 5,      // 5 seconds
    memoryLimit: 128,  // 128 MB
    maxSourceLength: 65536, // 64KB max source code
};

class CodeArenaService {
    constructor() {
        if (!CODEARENA_API_KEY) {
            console.warn('⚠️  CODEARENA_API_KEY not found. Code execution will not work.');
        }

        // In-memory storage for execution tracking (use Redis in production)
        this.dailyExecutions = new Map(); // userId -> { count, date }
        this.lastExecution = new Map();   // userId -> timestamp
    }

    /**
     * Check if user can execute code (rate limiting)
     */
    canUserExecute(userId) {
        const today = new Date().toDateString();
        const userExecution = this.dailyExecutions.get(userId);

        // Check daily limit
        if (userExecution && userExecution.date === today) {
            if (userExecution.count >= DAILY_EXECUTION_LIMIT) {
                return {
                    canExecute: false,
                    reason: 'DAILY_LIMIT_EXCEEDED',
                    message: 'Daily execution limit reached. Try again tomorrow.',
                    remainingExecutions: 0,
                };
            }
        }

        // Check cooldown
        const lastExecution = this.lastExecution.get(userId);
        if (lastExecution) {
            const timeSinceLastExecution = (Date.now() - lastExecution) / 1000;
            if (timeSinceLastExecution < EXECUTION_COOLDOWN_SECONDS) {
                return {
                    canExecute: false,
                    reason: 'COOLDOWN_ACTIVE',
                    message: `Please wait ${Math.ceil(EXECUTION_COOLDOWN_SECONDS - timeSinceLastExecution)} seconds before running again.`,
                    remainingExecutions: this.getRemainingExecutions(userId),
                };
            }
        }

        return {
            canExecute: true,
            remainingExecutions: this.getRemainingExecutions(userId),
        };
    }

    /**
     * Get remaining executions for user today
     */
    getRemainingExecutions(userId) {
        const today = new Date().toDateString();
        const userExecution = this.dailyExecutions.get(userId);

        if (!userExecution || userExecution.date !== today) {
            return DAILY_EXECUTION_LIMIT;
        }

        return Math.max(0, DAILY_EXECUTION_LIMIT - userExecution.count);
    }

    /**
     * Track execution for user
     */
    trackExecution(userId) {
        const today = new Date().toDateString();
        const userExecution = this.dailyExecutions.get(userId);

        if (!userExecution || userExecution.date !== today) {
            this.dailyExecutions.set(userId, { count: 1, date: today });
        } else {
            userExecution.count += 1;
        }

        this.lastExecution.set(userId, Date.now());
    }

    /**
     * Submit code for execution
     */
    async submitCode(code, language, stdin = '', userId) {
        try {
            // Check if user can execute
            const canExecute = this.canUserExecute(userId);
            if (!canExecute.canExecute) {
                throw new Error(canExecute.message);
            }

            // Validate inputs
            this.validateInput(code, language);

            const languageId = LANGUAGE_IDS[language];
            if (!languageId) {
                throw new Error(`Unsupported language: ${language}`);
            }

            // Prepare submission data
            const submissionData = {
                source_code: Buffer.from(code).toString('base64'),
                language_id: languageId,
                stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
                cpu_time_limit: EXECUTION_LIMITS.timeLimit,
                memory_limit: EXECUTION_LIMITS.memoryLimit * 1024, // Convert MB to KB
                wall_time_limit: EXECUTION_LIMITS.timeLimit + 2,
                max_processes_and_or_threads: 60,
                enable_per_process_and_thread_time_limit: false,
                enable_per_process_and_thread_memory_limit: false,
                max_file_size: 1024, // 1MB
            };

            // Submit to CodeArena
            const response = await this.makeCodeArenaRequest('/submissions', 'POST', submissionData);

            // Track execution
            this.trackExecution(userId);

            return {
                token: response.token,
                remainingExecutions: this.getRemainingExecutions(userId),
            };
        } catch (error) {
            console.error('Code submission error:', error);

            // Handle rate limit errors from API
            if (error.response?.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }

            throw error;
        }
    }

    /**
     * Get execution result by token
     */
    async getResult(token) {
        try {
            const result = await this.makeCodeArenaRequest(`/submissions/${token}`);
            return this.formatResult(result);
        } catch (error) {
            console.error('Get result error:', error);

            if (error.response?.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }

            throw error;
        }
    }

    /**
     * Make request to CodeArena API
     */
    async makeCodeArenaRequest(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            url: `${CODEARENA_API_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': CODEARENA_API_KEY,
                'X-RapidAPI-Host': CODEARENA_API_HOST,
            },
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    /**
     * Validate input parameters
     */
    validateInput(code, language) {
        if (!code || typeof code !== 'string') {
            throw new Error('Code is required and must be a string');
        }

        if (code.length > EXECUTION_LIMITS.maxSourceLength) {
            throw new Error(`Code too long. Maximum ${EXECUTION_LIMITS.maxSourceLength} characters allowed`);
        }

        if (!language || !LANGUAGE_IDS[language]) {
            throw new Error(`Invalid or unsupported language: ${language}`);
        }

        // Basic security checks
        const dangerousPatterns = [
            /import\s+os/i,
            /import\s+subprocess/i,
            /import\s+sys/i,
            /Runtime\.getRuntime/i,
            /ProcessBuilder/i,
            /system\s*\(/i,
            /exec\s*\(/i,
            /eval\s*\(/i,
            /#include\s*<stdlib\.h>/i,
            /require\s*\(\s*['"]fs['"]\s*\)/i,
            /require\s*\(\s*['"]child_process['"]\s*\)/i,
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                throw new Error('Code contains potentially dangerous operations');
            }
        }
    }

    /**
     * Format execution result
     */
    formatResult(codeArenaResult) {
        const statusMap = {
            1: 'In Queue',
            2: 'Processing',
            3: 'Accepted',
            4: 'Wrong Answer',
            5: 'Time Limit Exceeded',
            6: 'Compilation Error',
            7: 'Runtime Error (SIGSEGV)',
            8: 'Runtime Error (SIGXFSZ)',
            9: 'Runtime Error (SIGFPE)',
            10: 'Runtime Error (SIGABRT)',
            11: 'Runtime Error (NZEC)',
            12: 'Runtime Error (Other)',
            13: 'Internal Error',
            14: 'Exec Format Error',
        };

        const isProcessing = codeArenaResult.status.id <= 2;
        const status = statusMap[codeArenaResult.status.id] || 'Unknown';

        return {
            status,
            isProcessing,
            stdout: codeArenaResult.stdout ? Buffer.from(codeArenaResult.stdout, 'base64').toString() : '',
            stderr: codeArenaResult.stderr ? Buffer.from(codeArenaResult.stderr, 'base64').toString() : '',
            compile_output: codeArenaResult.compile_output ? Buffer.from(codeArenaResult.compile_output, 'base64').toString() : '',
            time: parseFloat(codeArenaResult.time) || 0,
            memory: parseInt(codeArenaResult.memory) || 0,
            exit_code: codeArenaResult.exit_code,
            token: codeArenaResult.token,
        };
    }

    /**
     * Get user execution stats
     */
    getUserExecutionStats(userId) {
        const today = new Date().toDateString();
        const userExecution = this.dailyExecutions.get(userId);
        const executionsToday = (userExecution && userExecution.date === today) ? userExecution.count : 0;

        return {
            executionsToday,
            remainingExecutions: DAILY_EXECUTION_LIMIT - executionsToday,
            dailyLimit: DAILY_EXECUTION_LIMIT,
            cooldownSeconds: EXECUTION_COOLDOWN_SECONDS,
            canExecute: this.canUserExecute(userId).canExecute,
        };
    }
}

export default new CodeArenaService();