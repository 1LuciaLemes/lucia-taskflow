import {
  ApiErrorPayload,
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '../types/task.js';
import { clearDemoKey, getDemoKey, promptDemoKey } from './demoAccess.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildHeaders(options?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  const demoKey = getDemoKey();
  if (demoKey) {
    headers['x-api-key'] = demoKey;
  }

  return headers;
}

async function request<T>(
  path: string,
  options?: RequestInit,
  canRetry = true,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  const isWrite = options?.method !== undefined && options.method !== 'GET';

  if (response.status === 401 && isWrite && canRetry) {
    clearDemoKey();
    const key = promptDemoKey();
    if (key) {
      return request<T>(path, options, false);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as T | ApiErrorPayload)
    : null;

  if (!response.ok) {
    const error = body as ApiErrorPayload | null;
    throw new ApiError(error?.message ?? 'Error de red', response.status, error?.error);
  }

  return body as T;
}

export async function getTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks');
}

export async function getTask(id: string): Promise<Task> {
  return request<Task>(`/tasks/${id}`);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' });
}
