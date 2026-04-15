export class RenderServiceError extends Error {
    code;
    stage;
    retryable;
    details;
    cause;
    constructor(input) {
        super(input.message, input.cause ? { cause: input.cause } : undefined);
        this.name = "RenderServiceError";
        this.code = input.code;
        this.stage = input.stage;
        this.retryable = input.retryable ?? false;
        this.details = input.details;
        this.cause = input.cause;
    }
}
export function createRenderServiceError(input) {
    return new RenderServiceError(input);
}
export function toRenderServiceError(error, fallback) {
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
export function getRenderServiceErrorData(error) {
    return {
        errorCode: error.code,
        errorStage: error.stage,
        retryable: error.retryable,
        ...(error.details ? { errorDetails: error.details } : {}),
    };
}
export function formatRenderServiceError(error) {
    return `[${error.code}] (${error.stage}) ${error.message}`;
}
