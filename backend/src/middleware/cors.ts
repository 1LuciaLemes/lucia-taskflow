import { CorsOptions } from 'cors';

export function createCorsOptions(): CorsOptions | undefined {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    return undefined;
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return undefined;
  }

  if (origins.includes('*')) {
    return { origin: true };
  }

  return { origin: origins };
}
