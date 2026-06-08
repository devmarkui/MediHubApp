import axios, { AxiosError, AxiosInstance } from 'axios';

import { env } from '@/config/env';
import { ApiEnvelope, ApiError, ApiErrorBody } from '@/types/api';
import { logger } from '@/utils/logger';

let tokenProvider: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureAuth(provider: () => string | null, onLogout: () => void): void {
  tokenProvider = provider;
  onUnauthorized = onLogout;
}

export const http: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  // Shorter timeout so a flaky network surfaces a retry UI quickly instead of
  // leaving screens on a spinner.
  timeout: 12000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = tokenProvider();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    // No HTTP response: the request never reached the server (offline, server
    // down, wrong host/port, or it timed out). Surface the specific cause and
    // log the exact target so the failure point is obvious in dev.
    if (!error.response) {
      const method = error.config?.method?.toUpperCase() ?? 'GET';
      const target = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
      logger.warn('network.error', {
        method,
        target,
        code: error.code,
        message: error.message,
      });

      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new ApiError('The server took too long to respond. Please try again.', 0),
        );
      }

      return Promise.reject(
        new ApiError(
          `Can’t reach the server at ${env.apiUrl}. Make sure you’re online and the backend is running.`,
          0,
        ),
      );
    }

    const status = error.response.status;
    const body = error.response.data;
    const message = body?.message ?? defaultMessageForStatus(status);

    logger.warn('api.error', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status,
      message,
    });

    if (status === 401) {
      onUnauthorized();
    }

    return Promise.reject(new ApiError(message, status, body?.errors));
  },
);

function defaultMessageForStatus(status: number): string {
  if (status === 401) return 'Please sign in again.';
  if (status === 403) return 'You don’t have access to this resource.';
  if (status === 404) return 'Not found.';
  if (status >= 500) return 'Something went wrong on our end. Please try again.';
  return 'Request failed.';
}

export async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const r = await http.get<ApiEnvelope<T>>(path, { params });
  return r.data.data;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const r = await http.post<ApiEnvelope<T>>(path, body);
  return r.data.data;
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  const r = await http.put<ApiEnvelope<T>>(path, body);
  return r.data.data;
}

export async function del<T>(path: string): Promise<T> {
  const r = await http.delete<ApiEnvelope<T>>(path);
  return r.data.data;
}
