import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  validate,
  validateBatch,
  validateWithPartialSuccess,
  formatValidationIssues,
  formatValidationResult,
  withGracefulDegradation,
  ValidationError,
  assertValid,
  createValidator,
} from "../validation";

const schema = z.object({ name: z.string(), count: z.number() });

describe("validation utilities", () => {
  it("validates inputs and formats issues", () => {
    const result = validate(schema, { name: "ok", count: 1 });
    expect(result.success).toBe(true);

    expect(formatValidationIssues([])).toBe("No validation issues");

    const invalid = validate(schema, { name: 1 }, { logErrors: false });
    expect(invalid.success).toBe(false);
    expect(formatValidationIssues(invalid.issues)).toContain("name");
    expect(formatValidationResult(invalid)).toContain("Validation failed");
  });

  it("validates batches with optional early exit", () => {
    const batch = validateBatch(schema, [
      { name: "ok", count: 1 },
      { name: 2 },
      { name: "ok", count: 2 },
    ]);

    expect(batch.validCount).toBe(2);
    expect(batch.invalidCount).toBe(1);

    const stop = validateBatch(schema, [{ name: 2 }, { name: 3 }], {
      stopOnFirstError: true,
      logErrors: false,
    });

    expect(stop.invalidItems).toHaveLength(1);
  });

  it("supports partial success and graceful degradation", () => {
    const partial = validateWithPartialSuccess(schema, [
      { name: "ok", count: 1 },
      { name: 2 },
    ]);

    expect(partial.validItems).toHaveLength(1);
    expect(partial.skippedItems).toHaveLength(1);

    const onError = vi.fn();
    const fallback = withGracefulDegradation(
      schema,
      { name: 2 },
      { name: "fallback", count: 0 },
      onError,
    );

    expect(fallback).toEqual({ name: "fallback", count: 0 });
    expect(onError).toHaveBeenCalled();
  });

  it("builds validators and throws validation errors", () => {
    const validator = createValidator(schema);
    expect(validator.isValid({ name: "ok", count: 1 })).toBe(true);
    expect(validator.parse({ name: "ok", count: 2 })).toEqual({
      name: "ok",
      count: 2,
    });
    expect(validator.safeParse({ name: "ok", count: 3 }).success).toBe(true);

    const parsed = schema.safeParse({ name: 1 });
    if (parsed.success) {
      throw new Error("Expected validation to fail");
    }
    const error = ValidationError.fromZodError(parsed.error, { name: 1 });

    expect(error.format()).toContain("name");

    expect(() => assertValid(schema, { name: 1 })).toThrow(ValidationError);
    expect(() => assertValid(schema, { name: "ok", count: 1 })).not.toThrow();
  });
});
