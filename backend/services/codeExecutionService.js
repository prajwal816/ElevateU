import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

// Language ID mappings for Judge0
const LANGUAGE_IDS = {
    javascript: 63, // Node.js
    python: 71,     // Python 3
    java: 62,       // Java
    cpp: 54,        // C++ (GCC 9.2.0)
    c: 50,          // C (GCC 9.2.0)
};

// Security limits
const EXECUTION_LIMITS = {
    timeLimit: 2,      // 2 seconds
    memoryLimit: 256,  // 256 MB
    maxSourceLength: 50000, // 50KB max source code
};

class CodeExecutionService {
    constructor() {
        if (!JUDGE0_API_KEY) {
            console.warn('⚠️  JUDGE0_API_KEY not found. Code execution will not work.');
        }
    }

    /**
     * Execute code using Judge0 API
     * @param {string} code - Source code to execute
     * @param {string} language - Programming language
     * @param {string} stdin - Optional input for the program
     * @returns {Promise<Object>} Execution result
     */
    async executeCode(code, language, stdin = '') {
        try {
            // Validate inputs
            this.validateInput(code, language);

            const languageId = LANGUAGE_IDS[language];
            if (!languageId) {
                throw new Error(`Unsupported language: ${language}`);
            }

            // Create submission
            const submissionData = {
                source_code: Buffer.from(code).toString('base64'),
                language_id: languageId,
                stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
                cpu_time_limit: EXECUTION_LIMITS.timeLimit,
                memory_limit: EXECUTION_LIMITS.memoryLimit * 1024, // Convert MB to KB
                wall_time_limit: EXECUTION_LIMITS.timeLimit + 1,
                max_processes_and_or_threads: 60,
                enable_per_process_and_thread_time_limit: false,
                enable_per_process_and_thread_memory_limit: false,
                max_file_size: 1024, // 1MB
            };

            const submissionResponse = await this.makeJudge0Request('/submissions', 'POST', submissionData);
            const token = submissionResponse.token;

            // Poll for result
            const result = await this.pollForResult(token);

            return this.formatResult(result);
        } catch (error) {
            console.error('Code execution error:', error);
            return this.formatError(error);
        }
    }

    /**
     * Execute code against test cases
     * @param {string} code - Source code
     * @param {string} language - Programming language
     * @param {Array} testCases - Array of test cases with input/expectedOutput
     * @returns {Promise<Object>} Test results
     */
    async executeWithTestCases(code, language, testCases) {
        try {
            this.validateInput(code, language);

            const results = [];
            let passedCount = 0;

            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                const result = await this.executeCode(code, language, testCase.input);

                const passed = this.compareOutput(result.stdout, testCase.expectedOutput);

                results.push({
                    testCaseId: testCase._id || i,
                    input: testCase.input,
                    expectedOutput: testCase.expectedOutput,
                    actualOutput: result.stdout,
                    passed,
                    executionTime: result.time,
                    memoryUsed: result.memory,
                    error: result.stderr || result.compile_output || null,
                });

                if (passed) passedCount++;
            }

            const status = passedCount === testCases.length ? 'Accepted' : 'Wrong Answer';

            return {
                status,
                testResults: results,
                passedTestCases: passedCount,
                totalTestCases: testCases.length,
                executionTime: results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / results.length,
                memoryUsed: results.reduce((sum, r) => sum + (r.memoryUsed || 0), 0) / results.length,
            };
        } catch (error) {
            console.error('Test case execution error:', error);
            return {
                status: 'Runtime Error',
                error: error.message,
                testResults: [],
                passedTestCases: 0,
                totalTestCases: testCases.length,
            };
        }
    }

    /**
     * Make request to Judge0 API
     */
    async makeJudge0Request(endpoint, method = 'GET', data = null) {
        const config = {
            method,
            url: `${JUDGE0_API_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': JUDGE0_API_KEY,
                'X-RapidAPI-Host': JUDGE0_HOST,
            },
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    }

    /**
     * Poll Judge0 for execution result
     */
    async pollForResult(token, maxAttempts = 10) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const result = await this.makeJudge0Request(`/submissions/${token}`);

            if (result.status.id <= 2) {
                // Still processing (In Queue = 1, Processing = 2)
                await this.sleep(1000); // Wait 1 second
                continue;
            }

            return result;
        }

        throw new Error('Execution timeout - result not ready');
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
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(code)) {
                throw new Error('Code contains potentially dangerous operations');
            }
        }
    }

    /**
     * Compare actual output with expected output
     */
    compareOutput(actual, expected) {
        if (!actual && !expected) return true;
        if (!actual || !expected) return false;

        // Normalize whitespace and line endings
        const normalizeOutput = (str) => {
            return str.toString().trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        };

        return normalizeOutput(actual) === normalizeOutput(expected);
    }

    /**
     * Format execution result
     */
    formatResult(judgeResult) {
        const statusMap = {
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

        return {
            status: statusMap[judgeResult.status.id] || 'Unknown',
            stdout: judgeResult.stdout ? Buffer.from(judgeResult.stdout, 'base64').toString() : '',
            stderr: judgeResult.stderr ? Buffer.from(judgeResult.stderr, 'base64').toString() : '',
            compile_output: judgeResult.compile_output ? Buffer.from(judgeResult.compile_output, 'base64').toString() : '',
            time: parseFloat(judgeResult.time) || 0,
            memory: parseInt(judgeResult.memory) || 0,
            exit_code: judgeResult.exit_code,
        };
    }

    /**
     * Format error response
     */
    formatError(error) {
        return {
            status: 'Error',
            stdout: '',
            stderr: error.message || 'Unknown error occurred',
            compile_output: '',
            time: 0,
            memory: 0,
            exit_code: -1,
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default new CodeExecutionService();