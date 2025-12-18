import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Code Practice API endpoints
export const codePracticeApi = {
  // Get all problems with filters
  getProblems: (params?: {
    difficulty?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/code-practice/problems', { params }),

  // Get problem by ID
  getProblem: (id: string) => api.get(`/code-practice/problems/${id}`),

  // Submit code for execution
  submitCode: (data: {
    problemId: string;
    code: string;
    language: string;
  }) => api.post('/code-practice/submit', data),

  // Get user progress
  getUserProgress: () => api.get('/code-practice/progress'),

  // Get user submissions
  getUserSubmissions: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    problemId?: string;
  }) => api.get('/code-practice/submissions', { params }),

  // Get leaderboard
  getLeaderboard: (limit?: number) => api.get('/code-practice/leaderboard', {
    params: { limit }
  }),
};

export default api;
