export const TITLE_REQUIRED_MESSAGE = 'El título es obligatorio';

export function isValidTitle(title: string): boolean {
  return title.trim().length > 0;
}

export function isValidEstimateNumber(value: number): boolean {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

export function isEnumValue<T extends Record<string, string>>(
  enumObject: T,
  value: string,
): boolean {
  return Object.values(enumObject).includes(value);
}

export function validateTitleInput(title: string): string | null {
  return isValidTitle(title) ? null : TITLE_REQUIRED_MESSAGE;
}

export function validateEstimateLive(raw: string): string | null {
  if (raw.trim().startsWith('-')) {
    return 'La estimación no puede ser negativa';
  }
  return null;
}

export function validateEstimateInput(raw: string): string | null {
  const value = raw.trim().replace(',', '.');
  if (value === '') {
    return null;
  }
  if (value.startsWith('-')) {
    return 'La estimación no puede ser negativa';
  }
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return 'La estimación debe ser un número positivo';
  }
  return null;
}

export function parseEstimate(raw: string): number | null {
  const value = raw.trim().replace(',', '.');
  if (value === '') {
    return null;
  }
  return Number(value);
}