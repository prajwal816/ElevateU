import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Student' | 'Teacher';
}

export interface AuthResponse {
  _id?: string;
  name?: string;
  email?: string;
  role?: 'Student' | 'Teacher';
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'Student' | 'Teacher';
}

// Auth API functions
export const authApi = {
  // Register user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Google OAuth login
  googleLogin: async (): Promise<void> => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (token: string): Promise<AuthResponse> => {
    // Store token and get user profile
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      token: token
    };
  },
};

// Local storage helpers
export const authStorage = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },
};

// Export individual functions for convenience
export const getToken = authStorage.getToken;
export const setToken = authStorage.setToken;
export const getUser = authStorage.getUser;
export const setUser = authStorage.setUser;
export const clearAuth = authStorage.clear;
export const isAuthenticated = authStorage.isAuthenticated;