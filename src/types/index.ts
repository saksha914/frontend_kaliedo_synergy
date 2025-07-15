// User types
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  assessment_completed: boolean;
  assessment_started_at?: string;
  assessment_completed_at?: string;
  role: string; // 'user' or 'admin'
}

// Admin user types
export interface AdminUser extends User {
  username: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
}

export interface AdminRegisterData extends RegisterData {
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Assessment types
export interface Question {
  id: string;
  question_text: string;
  question_number: number;
  type: 'mcq' | 'descriptive';
}

export interface AssessmentResponse {
  question_id: string;
  response: number;
  domain: string;
  question_type: string;
}

export interface UserData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
}

export interface AssessmentSubmission {
  user_data: UserData;
  responses: AssessmentResponse[];
  started_at: string;
  completed_at: string;
}

export interface AssessmentResult {
  id: string;
  user_data: UserData;
  domain_scores: Record<string, number>;
  descriptive_scores: Record<string, number>;
  total_score: number;
  overall_rating: string;
  domain_ratings: Record<string, string>;
  started_at: string;
  completed_at: string;
  total_time_minutes: number;
  created_at: string;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
}

export interface AdminRegisterFormData extends RegisterFormData {
  username: string;
  password: string;
  confirm_password: string;
}

export interface UserDataFormData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'username' | 'password' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    required?: string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface RadarChartData {
  subject: string;
  A: number;
  fullMark: number;
}

// Component props
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Assessment progress types
export interface AssessmentProgress {
  currentQuestion: number;
  totalQuestions: number;
  timeElapsed: number;
  responses: Record<string, number>;
}

// Error types
export interface ApiError {
  detail: string;
  status_code?: number;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

// Theme types
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Filter types
export interface Filter {
  field: string;
  value: string | number | boolean;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'regex';
}

// Sort types
export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// Search types
export interface SearchParams {
  query?: string;
  filters?: Filter[];
  sort?: Sort;
  pagination?: Pagination;
} 