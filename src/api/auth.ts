import { request } from './client';
import type { LoginRequest, TokenResponse, User } from '../types/api';

export const login = (payload: LoginRequest) =>
  request<TokenResponse>({ method: 'POST', url: '/auth/login', data: payload });

export const getCurrentUser = () => request<User>({ method: 'GET', url: '/auth/me' });
