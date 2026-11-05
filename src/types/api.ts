/** Standard success envelope returned by the CrediSure API. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  detail: string;
}

export interface ValidationFieldError {
  field: string;
  message: string;
}

/** Standard error envelope returned by the CrediSure API. */
export interface ApiErrorBody {
  success: false;
  data: null;
  detail: string;
  errors?: ValidationFieldError[] | null;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string; // UUID4
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string; // returned by the API but intentionally unused: no refresh endpoint exists
  token_type: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface UsersQuery {
  page: number;
  limit: number;
  search?: string;
  is_active?: boolean;
  role?: UserRole;
}

export interface UserStatusUpdate {
  is_active: boolean;
}

export interface DashboardOverview {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
}

export interface HealthStatus {
  status: string;
  service: string;
}
