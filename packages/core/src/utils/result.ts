export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(
  result: Result<T, E>,
): result is { ok: true; value: T } {
  return result.ok === true;
}

export function isErr<T, E>(
  result: Result<T, E>,
): result is { ok: false; error: E } {
  return result.ok === false;
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

export function map<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  return result.ok ? Ok(fn(result.value)) : result;
}

export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  return result.ok ? result : Err(fn(result.error));
}

export function andThen<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
): Promise<Result<T, Error>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(e instanceof Error ? e : new Error(String(e)));
  }
}

export interface TokovoError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  cause?: Error;
}

export function createTokovoError(
  code: string,
  message: string,
  context?: Record<string, unknown>,
  cause?: Error,
): TokovoError {
  return { code, message, context, cause };
}

export const ErrorCodes = {
  PLUGIN_NOT_FOUND: "PLUGIN_NOT_FOUND",
  PLUGIN_ALREADY_REGISTERED: "PLUGIN_ALREADY_REGISTERED",
  PLUGIN_VALIDATION_FAILED: "PLUGIN_VALIDATION_FAILED",
  EVENT_HANDLER_NOT_FOUND: "EVENT_HANDLER_NOT_FOUND",
  LOWERING_FAILED: "LOWERING_FAILED",
  REDUCER_ERROR: "REDUCER_ERROR",
  INVALID_STATE: "INVALID_STATE",
  ASSET_NOT_FOUND: "ASSET_NOT_FOUND",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
