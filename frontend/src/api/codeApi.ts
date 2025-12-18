import api from '@/lib/api';

export interface ExecuteCodeRequest {
    code: string;
    language: string;
    stdin?: string;
}

export interface SubmitCodeRequest {
    problemId: string;
    code: string;
    language: string;
}

export interface ExecutionResult {
    success: boolean;
    result?: {
        status: string;
        stdout: string;
        stderr: string;
        compile_output: string;
        time: number;
        memory: number;
    };
    error?: string;
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
    /**
     * Execute code for testing/debugging (no test cases)
     */
    async executeCode(request: ExecuteCodeRequest): Promise<ExecutionResult> {
        try {
            const response = await api.post('/code-execution/execute', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to execute code');
        }
    }

    /**
     * Submit code for a problem (with test cases)
     */
    async submitCode(request: SubmitCodeRequest): Promise<SubmissionResult> {
        try {
            const response = await api.post('/code-execution/submit', request);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to submit code');
        }
    }

    /**
     * Get submission details
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
     * Get user's submissions for a problem
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
}

export const codeApi = new CodeApi();
export default codeApi;