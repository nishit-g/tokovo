import type { JsonObject, JsonValue } from "@tokovo/ir";

export function numberParameter(parameters: JsonObject, key: string, fallback: number): number {
  const value = parameters[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function stringParameter<T extends string>(
  parameters: JsonObject,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = parameters[key];
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

export function tupleParameter(
  value: JsonValue | undefined,
  fallback: readonly [number, number],
): readonly [number, number] {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    Number.isFinite(value[0]) &&
    typeof value[1] === "number" &&
    Number.isFinite(value[1])
  ) {
    return [value[0], value[1]];
  }
  return fallback;
}

export function requireRange(
  parameters: JsonObject,
  key: string,
  minimum: number,
  maximum: number,
): string[] {
  const value = parameters[key];
  if (value === undefined) return [];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return [`${key} must be a finite number`];
  }
  return value < minimum || value > maximum
    ? [`${key} must be between ${minimum} and ${maximum}`]
    : [];
}

export function rejectUnknownParameters(
  parameters: JsonObject,
  allowed: readonly string[],
): string[] {
  const known = new Set(allowed);
  return Object.keys(parameters)
    .filter((key) => !known.has(key))
    .sort()
    .map((key) => `unknown parameter "${key}"`);
}

export function requireTuple2(
  parameters: JsonObject,
  key: string,
  minimum?: number,
  maximum?: number,
): string[] {
  const value = parameters[key];
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    value.some((entry) => typeof entry !== "number" || !Number.isFinite(entry))
  ) {
    return [`${key} must be a tuple of two finite numbers`];
  }
  if (
    minimum !== undefined &&
    maximum !== undefined &&
    value.some((entry) => (entry as number) < minimum || (entry as number) > maximum)
  ) {
    return [`${key} entries must be between ${minimum} and ${maximum}`];
  }
  return [];
}

export function requireEnum(
  parameters: JsonObject,
  key: string,
  allowed: readonly string[],
): string[] {
  const value = parameters[key];
  if (value === undefined) return [];
  return typeof value === "string" && allowed.includes(value)
    ? []
    : [`${key} must be one of ${allowed.join(", ")}`];
}
