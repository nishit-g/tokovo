export type RenderStage =
  | "cli"
  | "bootstrap"
  | "preflight"
  | "bundle"
  | "browser"
  | "composition"
  | "render-media"
  | "render-poster"
  | "storage"
  | "artifacts"
  | "render";

export type RenderServiceErrorCode =
  | "CLI_INVALID_ARGUMENT"
  | "CLI_UNKNOWN_COMMAND"
  | "ARTIFACT_NOT_FOUND"
  | "RENDER_DATA_FAILED"
  | "RENDER_PREFLIGHT_FAILED"
  | "BUNDLE_FAILED"
  | "BROWSER_LAUNCH_FAILED"
  | "COMPOSITION_SELECT_FAILED"
  | "MEDIA_RENDER_FAILED"
  | "POSTER_RENDER_FAILED"
  | "STORAGE_CONFIG_INVALID"
  | "STORAGE_UPLOAD_FAILED"
  | "ARTIFACT_WRITE_FAILED"
  | "RENDER_JOB_FAILED";

export class RenderServiceError extends Error {
  readonly code: RenderServiceErrorCode;
  readonly stage: RenderStage;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;
  override readonly cause?: Error;

  constructor(input: {
    code: RenderServiceErrorCode;
    stage: RenderStage;
    message: string;
    retryable?: boolean;
    details?: Record<string, unknown>;
    cause?: Error;
  }) {
    super(input.message, input.cause ? { cause: input.cause } : undefined);
    this.name = "RenderServiceError";
    this.code = input.code;
    this.stage = input.stage;
    this.retryable = input.retryable ?? false;
    this.details = input.details;
    this.cause = input.cause;
  }
}

export function createRenderServiceError(input: {
  code: RenderServiceErrorCode;
  stage: RenderStage;
  message: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
  cause?: Error;
}): RenderServiceError {
  return new RenderServiceError(input);
}

export function toRenderServiceError(
  error: unknown,
  fallback: {
    code: RenderServiceErrorCode;
    stage: RenderStage;
    message: string;
    retryable?: boolean;
    details?: Record<string, unknown>;
  },
): RenderServiceError {
  if (error instanceof RenderServiceError) {
    return error;
  }

  const cause = error instanceof Error ? error : undefined;

  return createRenderServiceError({
    ...fallback,
    message: cause?.message ?? fallback.message,
    cause,
  });
}

export function getRenderServiceErrorData(
  error: RenderServiceError,
): Record<string, unknown> {
  return {
    errorCode: error.code,
    errorStage: error.stage,
    retryable: error.retryable,
    ...(error.details ? { errorDetails: error.details } : {}),
  };
}

export function formatRenderServiceError(error: RenderServiceError): string {
  return `[${error.code}] (${error.stage}) ${error.message}`;
}
