/**
 * Validate Pass
 * 
 * Validates Timeline IR for semantic correctness:
 * - Read before send detection
 * - Delete missing message detection
 * - Frame ordering issues
 * 
 * Supports two modes:
 * - STRICT: Errors halt compilation
 * - LENIENT: Warnings + auto-fix where possible
 */

import { TimelineOp, validateTimelineIRFull, TimelineIR, ValidationError } from "@tokovo/ir";
import { CompilerContext } from "../context";

/**
 * Validation result.
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Validate timeline operations.
 */
export function validateTimeline(
    ops: TimelineOp[],
    ctx: CompilerContext
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check read/delete before send
    const sentMessages = new Set<string>();

    for (const op of ops) {
        if (op.kind === "MessageReceived" || op.kind === "MessageSent") {
            sentMessages.add(op.message.id);
        }

        if (op.kind === "MessageRead") {
            if (!sentMessages.has(op.messageId)) {
                const err: ValidationError = {
                    code: "READ_BEFORE_SEND",
                    message: `Message "${op.messageId}" is read at frame ${op.at} but not yet sent`,
                };

                if (ctx.config.mode === "strict") {
                    errors.push(err);
                } else {
                    warnings.push(err);
                }
            }
        }

        if (op.kind === "MessageDeleted") {
            if (!sentMessages.has(op.messageId)) {
                const err: ValidationError = {
                    code: "DELETE_MISSING",
                    message: `Message "${op.messageId}" is deleted at frame ${op.at} but never existed`,
                };

                if (ctx.config.mode === "strict") {
                    errors.push(err);
                } else {
                    warnings.push(err);
                }
            }
        }
    }

    // Check for negative frames
    for (const op of ops) {
        if (op.at < 0) {
            errors.push({
                code: "NEGATIVE_FRAME",
                message: `Operation at frame ${op.at} has negative frame number`,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
