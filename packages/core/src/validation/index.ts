import { z, ZodError, ZodSchema, ZodIssue } from "zod";
import { logger, createScopedLogger } from "../logger";

const log = createScopedLogger("validation");

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  path: string;
  message: string;
  code: string;
  severity: ValidationSeverity;
  received?: unknown;
  expected?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  issues: ValidationIssue[];
  issueCount: number;
  errorCount: number;
  warningCount: number;
}

export interface BatchValidationResult<T> {
  validItems: T[];
  invalidItems: Array<{
    index: number;
    input: unknown;
    issues: ValidationIssue[];
  }>;
  totalCount: number;
  validCount: number;
  invalidCount: number;
  allIssues: ValidationIssue[];
}

function zodIssueToValidationIssue(
  issue: ZodIssue,
  severity: ValidationSeverity = "error",
): ValidationIssue {
  return {
    path: issue.path.join(".") || "<root>",
    message: issue.message,
    code: issue.code,
    severity,
    received: "received" in issue ? issue.received : undefined,
    expected: "expected" in issue ? String(issue.expected) : undefined,
  };
}

function zodErrorToIssues(
  error: ZodError,
  severity: ValidationSeverity = "error",
): ValidationIssue[] {
  return error.issues.map((issue) =>
    zodIssueToValidationIssue(issue, severity),
  );
}

export function validate<T>(
  schema: ZodSchema<T>,
  input: unknown,
  options: { logErrors?: boolean } = {},
): ValidationResult<T> {
  const result = schema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      issues: [],
      issueCount: 0,
      errorCount: 0,
      warningCount: 0,
    };
  }

  const issues = zodErrorToIssues(result.error);

  if (options.logErrors !== false) {
    for (const issue of issues) {
      log.warn(`Validation failed: ${issue.path} - ${issue.message}`, {
        code: issue.code,
        received: issue.received,
        expected: issue.expected,
      });
    }
  }

  return {
    success: false,
    data: undefined,
    issues,
    issueCount: issues.length,
    errorCount: issues.filter((i) => i.severity === "error").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
  };
}

export function validateBatch<T>(
  schema: ZodSchema<T>,
  inputs: unknown[],
  options: { stopOnFirstError?: boolean; logErrors?: boolean } = {},
): BatchValidationResult<T> {
  const validItems: T[] = [];
  const invalidItems: BatchValidationResult<T>["invalidItems"] = [];
  const allIssues: ValidationIssue[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const result = validate(schema, input, { logErrors: options.logErrors });

    if (result.success && result.data !== undefined) {
      validItems.push(result.data);
    } else {
      const itemIssues = result.issues.map((issue) => ({
        ...issue,
        path: `[${i}].${issue.path}`,
      }));
      invalidItems.push({ index: i, input, issues: itemIssues });
      allIssues.push(...itemIssues);

      if (options.stopOnFirstError) {
        break;
      }
    }
  }

  return {
    validItems,
    invalidItems,
    totalCount: inputs.length,
    validCount: validItems.length,
    invalidCount: invalidItems.length,
    allIssues,
  };
}

export function formatValidationIssues(issues: ValidationIssue[]): string {
  if (issues.length === 0) return "No validation issues";

  const lines = issues.map((issue) => {
    const prefix = issue.severity === "error" ? "✗" : "⚠";
    let line = `${prefix} ${issue.path}: ${issue.message}`;
    if (issue.expected) {
      line += ` (expected: ${issue.expected})`;
    }
    if (issue.received !== undefined) {
      const received =
        typeof issue.received === "object"
          ? JSON.stringify(issue.received)
          : String(issue.received);
      line += ` (received: ${received})`;
    }
    return line;
  });

  return lines.join("\n");
}

export function formatValidationResult<T>(result: ValidationResult<T>): string {
  if (result.success) {
    return "✓ Validation passed";
  }

  return [
    `✗ Validation failed with ${result.errorCount} error(s)`,
    "",
    formatValidationIssues(result.issues),
  ].join("\n");
}

export function createValidator<T>(schema: ZodSchema<T>) {
  return {
    validate: (input: unknown) => validate(schema, input),
    validateBatch: (inputs: unknown[]) => validateBatch(schema, inputs),
    isValid: (input: unknown): input is T => schema.safeParse(input).success,
    parse: (input: unknown): T => schema.parse(input),
    safeParse: (input: unknown) => schema.safeParse(input),
  };
}

export function withGracefulDegradation<T, F>(
  schema: ZodSchema<T>,
  input: unknown,
  fallback: F,
  onError?: (issues: ValidationIssue[]) => void,
): T | F {
  const result = validate(schema, input);

  if (result.success && result.data !== undefined) {
    return result.data;
  }

  if (onError) {
    onError(result.issues);
  }

  logger.warn("validation", "Using fallback due to validation failure", {
    issueCount: result.issueCount,
    firstIssue: result.issues[0],
  });

  return fallback;
}

export interface PartialValidationResult<T> {
  validItems: T[];
  skippedItems: Array<{
    index: number;
    input: unknown;
    issues: ValidationIssue[];
  }>;
  totalProcessed: number;
  successRate: number;
}

export function validateWithPartialSuccess<T>(
  schema: ZodSchema<T>,
  inputs: unknown[],
): PartialValidationResult<T> {
  const batchResult = validateBatch(schema, inputs, {
    stopOnFirstError: false,
  });

  return {
    validItems: batchResult.validItems,
    skippedItems: batchResult.invalidItems,
    totalProcessed: batchResult.totalCount,
    successRate:
      batchResult.totalCount > 0
        ? batchResult.validCount / batchResult.totalCount
        : 1,
  };
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: ValidationIssue[],
    public readonly input?: unknown,
  ) {
    super(message);
    this.name = "ValidationError";
  }

  static fromZodError(error: ZodError, input?: unknown): ValidationError {
    const issues = zodErrorToIssues(error);
    return new ValidationError(
      `Validation failed with ${issues.length} issue(s)`,
      issues,
      input,
    );
  }

  format(): string {
    return formatValidationIssues(this.issues);
  }
}

export function assertValid<T>(
  schema: ZodSchema<T>,
  input: unknown,
  errorMessage?: string,
): asserts input is T {
  const result = validate(schema, input);

  if (!result.success) {
    throw new ValidationError(
      errorMessage || `Validation failed with ${result.errorCount} error(s)`,
      result.issues,
      input,
    );
  }
}
