const STORAGE_KEY = 'task-system-demo-key';

function storage(): Storage | undefined {
  return typeof localStorage === 'undefined' ? undefined : localStorage;
}

export function getDemoKey(): string | null {
  return storage()?.getItem(STORAGE_KEY) ?? null;
}

export function setDemoKey(key: string): void {
  storage()?.setItem(STORAGE_KEY, key);
}

export function clearDemoKey(): void {
  storage()?.removeItem(STORAGE_KEY);
}

export function promptDemoKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.prompt('Ingresá la clave de la demo para modificar tareas');
  const key = value?.trim();
  if (!key) {
    return null;
  }

  setDemoKey(key);
  return key;
}
