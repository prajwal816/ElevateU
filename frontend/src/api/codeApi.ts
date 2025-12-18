import api from '@/lib/api';

export interface ExecuteCodeRequest {
    code: string;
    language: string;
    stdin?: string;
}

export interface SubmitCodeRequest {
    source_code: string;
    language_id: number;
    stdin?: string;
}

export interface ExecutionResult {
    success: boolean;
    token?: string;
    remainingExecutions?: number;
    result?: {
        status: string;
        isProcessing: boolean;
        stdout: string;
        stderr: string;
        compile_output: string;
        time: number;
        memory: number;
        exit_code: number;
    };
    executionStats?: {
        executionsToday: number;
        remainingExecutions: number;
        dailyLimit: number;
        cooldownSeconds: number;
        canExecute: boolean;
    };
    error?: string;
    type?: string;
}

export interface SubmissionResult {
    success: boolean;
    submissionId?: string;
    status: string;
    testResults?: Array<{
        testCaseId: string;
        passed: boolean;
        executionTime: number;
        memoryUsed: number;
        error?: string;
    }>;
    passedTestCases: number;
    totalTestCases: number;
    executionTime?: number;
    memoryUsed?: number;
    xpEarned?: number;
    error?: string;
}

export interface PracticeSession {
    sessionId: string;
    startTime: string;
    endTime?: string;
    problemId?: string;
    language?: string;
}

class CodeApi {
    // Language ID mappings for CodeArena
    private languageIds = {
        javascript: 63,
        python: 71,
        java: 62,
        cpp: 54,
        c: 50,
    };

    /**
     * Execute code using CodeArena with polling
     */
    async executeCode(request: ExecuteCodeRequest): Promise<ExecutionResult> {
        try {
            const languageId = this.languageIds[request.language as keyof typeof this.languageIds] || 63;

            // Submit code
            const submitResult = await this.submitCode({
                source_code: request.code,
                language_id: languageId,
                stdin: request.stdin,
            });

            if (!submitResult.success) {
                return submitResult;
            }

            // Poll for result
            const token = submitResult.token!;
            return await this.pollForResult(token);
        } catch (error: any) {
            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: error.response.data?.error || 'Rate limit exceeded',
                    type: 'RATE_LIMIT_ERROR',
                };
            }
            throw new Error(error.response?.data?.message || 'Failed to execute code');
        }
    }

    /**
     * Submit code to CodeArena and get token
     */
    async submitCode(request: SubmitCodeRequest): Promise<ExecutionResult> {
        try {
            const response = await api.post('/code/submit', request);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: error.response.data?.error || 'Rate limit exceeded',
                    type: 'RATE_LIMIT_ERROR',
                };
            }
            throw new Error(error.response?.data?.message || 'Failed to submit code');
        }
    }

    /**
     * Get execution result by token
     */
    async getResult(token: string): Promise<ExecutionResult> {
        try {
            const response = await api.get(`/code/result/${token}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: error.response.data?.error || 'Rate limit exceeded',
                    type: 'RATE_LIMIT_ERROR',
                };
            }
            throw new Error(error.response?.data?.message || 'Failed to get result');
        }
    }

    /**
     * Get user execution statistics
     */
    async getExecutionStats() {
        try {
            const response = await api.get('/code/stats');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get execution stats');
        }
    }

    /**
     * Poll for execution result
     */
    private async pollForResult(token: string): Promise<ExecutionResult> {
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max
        const pollInterval = 1000; // 1 second

        while (attempts < maxAttempts) {
            await this.sleep(pollInterval);

            const result = await this.getResult(token);

            if (!result.success) {
                return result;
            }

            if (!result.result?.isProcessing) {
                return result;
            }

            attempts++;
        }

        return {
            success: false,
            error: 'Execution timeout - result not ready after 30 seconds',
        };
    }

    /**
     * Submit code for a problem (with test cases) - Legacy method
     */
    async submitCodeForProblem(request: { problemId: string; code: string; language: string }): Promise<SubmissionResult> {
        try {
            const response = await api.post('/code-execution/submit', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to submit code');
        }
    }

    /**
     * Get submission details - Legacy method
     */
    async getSubmission(submissionId: string) {
        try {
            const response = await api.get(`/code-execution/submissions/${submissionId}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get submission');
        }
    }

    /**
     * Get user's submissions for a problem - Legacy method
     */
    async getProblemSubmissions(problemId: string, page = 1, limit = 10) {
        try {
            const response = await api.get(`/code-execution/problems/${problemId}/submissions`, {
                params: { page, limit }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get submissions');
        }
    }

    /**
     * Start a practice session
     */
    async startPracticeSession(problemId?: string, language?: string): Promise<PracticeSession> {
        try {
            const response = await api.post('/code-practice/session/start', {
                problemId,
                language
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to start practice session');
        }
    }

    /**
     * End a practice session
     */
    async endPracticeSession(sessionId: string): Promise<void> {
        try {
            await api.post('/code-practice/session/end', { sessionId });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to end practice session');
        }
    }

    /**
     * Update practice session activity
     */
    async updatePracticeSession(sessionId: string, data: {
        timeSpent?: number;
        linesOfCode?: number;
        keystrokes?: number;
    }): Promise<void> {
        try {
            await api.put(`/code-practice/session/${sessionId}`, data);
        } catch (error: any) {
            // Don't throw error for session updates to avoid disrupting user experience
            console.warn('Failed to update practice session:', error.message);
        }
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const codeApi = new CodeApi();
export default codeApi;