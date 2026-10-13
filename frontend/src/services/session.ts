const STORAGE_KEY = 'task-system-demo-session';

function storage(): Storage | undefined {
  return typeof localStorage === 'undefined' ? undefined : localStorage;
}

export function getSessionId(): string {
  const existing = storage()?.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const id = globalThis.crypto.randomUUID();
  storage()?.setItem(STORAGE_KEY, id);
  return id;
}
