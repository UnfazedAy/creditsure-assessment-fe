import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorBody, ApiSuccess } from '../types/api';

/* ---------- Base URL ---------- */

const DEFAULT_ORIGIN = 'https://creditsure-assessment-production.up.railway.app';

/** VITE_API_BASE_URL is the backend origin. "/api/v1" is appended exactly once here. */
function resolveBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_ORIGIN;
  const origin = raw.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  return `${origin}/api/v1`;
}

/* ---------- Token storage (sessionStorage; see README for XSS caveats) ---------- */

const TOKEN_KEY = 'credisure.access_token';
let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    try {
      memoryToken = sessionStorage.getItem(TOKEN_KEY);
    } catch {
      /* storage unavailable: fall back to memory only */
    }
    return memoryToken;
  },
  set(token: string): void {
    memoryToken = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* ignore */
    }
  },
  clear(): void {
    memoryToken = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/* ---------- Request activity store (drives the API status indicator) ---------- */

interface Activity {
  inflight: number;
  lastFailed: boolean;
}

let activity: Activity = { inflight: 0, lastFailed: false };
const listeners = new Set<() => void>();

function setActivity(next: Partial<Activity>): void {
  activity = { ...activity, ...next };
  listeners.forEach((listener) => listener());
}

export const activityStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: (): Activity => activity,
};

const isHealthCheck = (config?: AxiosRequestConfig): boolean => config?.url === '/health';

/* ---------- Errors ---------- */

export type ApiErrorKind = 'network' | 'http' | 'canceled';

export class ApiError extends Error {
  status: number | null;
  kind: ApiErrorKind;
  fieldErrors: Record<string, string>;

  constructor(init: {
    message: string;
    status?: number | null;
    kind?: ApiErrorKind;
    fieldErrors?: Record<string, string>;
  }) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status ?? null;
    this.kind = init.kind ?? 'http';
    this.fieldErrors = init.fieldErrors ?? {};
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'The request could not be completed.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to do that. An administrator account is required.",
  404: 'The requested record could not be found.',
  422: 'Some of the information provided is invalid.',
};

/** Converts any thrown value into an ApiError with a safe, human-readable message. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError({ message: 'Request canceled.', kind: 'canceled' });
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED';
      return new ApiError({
        kind: 'network',
        message: timedOut
          ? 'The API took too long to respond. Try again in a moment.'
          : "Can't reach the CrediSure API. Check your connection and try again.",
      });
    }

    const { status, data } = error.response;
    const body = (data ?? {}) as Partial<ApiErrorBody>;
    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(body.errors)) {
      for (const item of body.errors) {
        const key = String(item.field).split('.').pop() ?? item.field;
        if (!(key in fieldErrors)) fieldErrors[key] = item.message;
      }
    }

    // Never surface server internals for 5xx responses.
    let message =
      status >= 500
        ? 'The server ran into a problem. Please try again shortly.'
        : typeof body.detail === 'string' && body.detail.trim()
          ? body.detail
          : (FALLBACK_MESSAGES[status] ?? 'Something went wrong. Please try again.');

    if (status === 422 && typeof body.detail !== 'string') message = FALLBACK_MESSAGES[422];

    return new ApiError({ message, status, fieldErrors });
  }

  return new ApiError({ message: 'Something went wrong. Please try again.' });
}

/* ---------- Axios instance ---------- */

let unauthorizedHandler: (() => void) | null = null;

/** AuthContext registers a callback here so a 401 clears the session and redirects to login. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export const http = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 20000, // generous: the hosted API may cold-start
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Single instance bound to the API baseURL: the token is never sent to third-party hosts.
  const token = tokenStore.get();
  // Never send a (possibly stale) token with the login call itself.
  if (token && config.url !== '/auth/login') config.headers.set('Authorization', `Bearer ${token}`);
  if (!isHealthCheck(config)) setActivity({ inflight: activity.inflight + 1 });
  return config;
});

http.interceptors.response.use(
  (response) => {
    if (!isHealthCheck(response.config)) {
      setActivity({ inflight: Math.max(0, activity.inflight - 1), lastFailed: false });
    }
    return response;
  },
  (error: unknown) => {
    const apiError = toApiError(error);
    const config = axios.isAxiosError(error) ? error.config : undefined;

    if (!isHealthCheck(config)) {
      setActivity({
        inflight: Math.max(0, activity.inflight - 1),
        lastFailed: apiError.kind === 'canceled' ? activity.lastFailed : true,
      });
    }

    // Only treat 401 as an expired session when we actually sent a token (not for bad login attempts).
    const hadToken = Boolean(config?.headers?.get?.('Authorization'));
    if (apiError.status === 401 && hadToken) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }

    return Promise.reject(apiError);
  },
);

/** Performs a request and unwraps the { success, data, detail } envelope into `data`. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiSuccess<T> | ApiErrorBody>(config);
  const body = response.data;
  if (!body || body.success !== true) {
    throw new ApiError({
      message: (body as ApiErrorBody | undefined)?.detail ?? 'Unexpected response from the API.',
      status: response.status,
    });
  }
  return body.data;
}
