import { request } from './client';
import type { PaginatedUsers, User, UsersQuery, UserStatusUpdate } from '../types/api';

export const getUsers = (query: UsersQuery, signal?: AbortSignal) =>
  request<PaginatedUsers>({ method: 'GET', url: '/users', params: query, signal });

export const getUserById = (userId: string, signal?: AbortSignal) =>
  request<User>({ method: 'GET', url: `/users/${encodeURIComponent(userId)}`, signal });

export const updateUserStatus = (userId: string, isActive: boolean) =>
  request<User>({
    method: 'PATCH',
    url: `/users/${encodeURIComponent(userId)}`,
    data: { is_active: isActive } satisfies UserStatusUpdate,
  });
