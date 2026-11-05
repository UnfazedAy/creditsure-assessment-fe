import { request } from './client';
import type { DashboardOverview, HealthStatus } from '../types/api';

export const getDashboardOverview = (signal?: AbortSignal) =>
  request<DashboardOverview>({ method: 'GET', url: '/dashboard/overview', signal });

export const getHealthStatus = () => request<HealthStatus>({ method: 'GET', url: '/health' });
