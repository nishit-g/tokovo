export function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function expectObjectRecord(
  value: unknown,
  path: string,
  errors: string[],
): Record<string, unknown> | null {
  if (!isObjectRecord(value)) {
    errors.push(`${path} must be an object`);
    return null;
  }

  return value;
}

export function expectArray(
  value: unknown,
  path: string,
  errors: string[],
): unknown[] | null {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return null;
  }

  return value;
}

export function expectString(
  value: unknown,
  path: string,
  errors: string[],
): string | null {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${path} must be a non-empty string`);
    return null;
  }

  return value;
}

export function expectOptionalString(
  value: unknown,
  path: string,
  errors: string[],
): string | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    errors.push(`${path} must be a string`);
    return undefined;
  }

  return value;
}

export function expectOptionalNumber(
  value: unknown,
  path: string,
  errors: string[],
): number | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push(`${path} must be a number`);
    return undefined;
  }

  return value;
}

export function expectOptionalBoolean(
  value: unknown,
  path: string,
  errors: string[],
): boolean | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    errors.push(`${path} must be a boolean`);
    return undefined;
  }

  return value;
}

export function expectOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
  errors: string[],
): T | null {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    errors.push(`${path} must be one of: ${allowed.join(", ")}`);
    return null;
  }

  return value as T;
}
