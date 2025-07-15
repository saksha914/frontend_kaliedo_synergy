import axios, { AxiosResponse } from "axios";
import {
  User,
  LoginCredentials,
  RegisterData,
  AdminRegisterData,
  AuthTokens,
  Question,
  AssessmentSubmission,
  AssessmentResult,
} from "../types/index.ts";

// Create axios instance
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "http://lk76wj9g-8000.inc1.devtunnels.ms/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await api.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth helper functions
export const setAuthTokens = (tokens: AuthTokens) => {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
};

export const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

// Auth API
export const authAPI = {
  async register(data: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await api.post(
      "/auth/register",
      data
    );
    return response.data;
  },

  async registerAdmin(data: AdminRegisterData): Promise<User> {
    const response: AxiosResponse<User> = await api.post(
      "/auth/admin/register",
      data
    );
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response: AxiosResponse<AuthTokens> = await api.post(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response: AxiosResponse<AuthTokens> = await api.post(
      "/auth/refresh",
      {
        refresh_token: refreshToken,
      }
    );
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await api.get("/auth/me");
    return response.data;
  },

  async logout(): Promise<void> {
    clearAuth();
  },
};

// Assessment API
export const assessmentAPI = {
  async getQuestions(): Promise<{
    questions: Question[];
    total_questions: number;
    domains: string[];
  }> {
    const response: AxiosResponse<{
      questions: Question[];
      total_questions: number;
      domains: string[];
    }> = await api.get("/assessment/questions");
    return response.data;
  },

  async submitAssessment(
    data: AssessmentSubmission
  ): Promise<AssessmentResult> {
    const response: AxiosResponse<AssessmentResult> = await api.post(
      "/assessment/submit",
      data
    );
    return response.data;
  },

  async getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
    const response: AxiosResponse<AssessmentResult> = await api.get(
      `/assessment/results/${assessmentId}`
    );
    return response.data;
  },

  // Admin-only endpoints
  async getAllAssessmentResults(): Promise<AssessmentResult[]> {
    const response: AxiosResponse<AssessmentResult[]> = await api.get(
      "/assessment/admin/results"
    );
    return response.data;
  },

  async getUserAssessmentResults(
    userEmail: string
  ): Promise<AssessmentResult[]> {
    const response: AxiosResponse<AssessmentResult[]> = await api.get(
      `/assessment/admin/results/${userEmail}`
    );
    return response.data;
  },
};

// User API
export const userAPI = {
  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await api.put("/users/profile", data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await api.get("/users/profile");
    return response.data;
  },
};

// Utility functions
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("access_token");
};

export const adminAPI = {
  async listQuestions() {
    const res = await api.get("/admin/questions");
    return res.data;
  },
  async addQuestion(data: any) {
    const res = await api.post("/admin/questions", data);
    return res.data;
  },
  async listUsers() {
    const res = await api.get("/admin/users");
    return res.data;
  },
  async getUserAssessments(userId: string) {
    const res = await api.get(`/admin/users/${userId}/assessments`);
    return res.data;
  },
};

export default api;
