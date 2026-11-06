import { request } from './client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types/api';

export const login = (payload: LoginRequest) =>
  request<TokenResponse>({ method: 'POST', url: '/auth/login', data: payload });

export const getCurrentUser = (signal?: AbortSignal) =>
  request<User>({ method: 'GET', url: '/auth/me', signal });

export const register = (payload: RegisterRequest) =>
  request<User>({ method: 'POST', url: '/auth/register', data: payload });
