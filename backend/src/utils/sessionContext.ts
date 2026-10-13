import { AsyncLocalStorage } from 'node:async_hooks';

const sessionStorage = new AsyncLocalStorage<string>();

export function runWithSession<T>(sessionId: string, callback: () => T): T {
  return sessionStorage.run(sessionId, callback);
}

export function getSessionId(): string | undefined {
  return sessionStorage.getStore();
}
