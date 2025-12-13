/**
 * IR Invariants & Validation
 * 
 * Ensures IR types maintain their contracts.
 */

import { SceneIR, SceneOp, MessageRef } from "./scene";
import { TimelineIR, TimelineOp } from "./timeline";

// =============================================================================
// SCENE IR VALIDATION
// =============================================================================

export interface ValidationError {
    readonly code: string;
    readonly message: string;
    readonly path?: string;
}

/**
 * Validate Scene IR invariants.
 */
export function validateSceneIR(ir: SceneIR): ValidationError[] {
    const errors: ValidationError[] = [];

    // Must have episode ID
    if (!ir.episodeId) {
        errors.push({
            code: "MISSING_EPISODE_ID",
            message: "Episode ID is required",
        });
    }

    // Must have FPS
    if (!ir.meta.fps || ir.meta.fps <= 0) {
        errors.push({
            code: "INVALID_FPS",
            message: "FPS must be a positive number",
        });
    }

    // Must have at least one device
    if (ir.devices.length === 0) {
        errors.push({
            code: "NO_DEVICES",
            message: "At least one device is required",
        });
    }

    // Validate each device
    for (const device of ir.devices) {
        if (!device.deviceId) {
            errors.push({
                code: "MISSING_DEVICE_ID",
                message: "Device ID is required",
                path: `devices[${ir.devices.indexOf(device)}]`,
            });
        }
    }

    return errors;
}

// =============================================================================
// TIMELINE IR VALIDATION
// =============================================================================

/**
 * Validate Timeline IR invariants.
 */
export function validateTimelineIR(ir: TimelineIR): ValidationError[] {
    const errors: ValidationError[] = [];

    // Must have episode ID
    if (!ir.episodeId) {
        errors.push({
            code: "MISSING_EPISODE_ID",
            message: "Episode ID is required",
        });
    }

    // Must have FPS
    if (!ir.fps || ir.fps <= 0) {
        errors.push({
            code: "INVALID_FPS",
            message: "FPS must be a positive number",
        });
    }

    // All ops must have valid frame numbers
    for (let i = 0; i < ir.ops.length; i++) {
        const op = ir.ops[i];
        if (op.at < 0) {
            errors.push({
                code: "NEGATIVE_FRAME",
                message: `Operation at index ${i} has negative frame number`,
                path: `ops[${i}]`,
            });
        }

        // All ops must have trace
        if (!op.trace) {
            errors.push({
                code: "MISSING_TRACE",
                message: `Operation at index ${i} is missing trace`,
                path: `ops[${i}]`,
            });
        }
    }

    return errors;
}

// =============================================================================
// SEMANTIC VALIDATION
// =============================================================================

/**
 * Check if a message is read before it's sent.
 * Returns errors if found.
 */
export function validateReadBeforeSend(ops: TimelineOp[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const sentMessages = new Set<string>();

    for (const op of ops) {
        if (op.kind === "MessageReceived" || op.kind === "MessageSent") {
            sentMessages.add(op.message.id);
        }

        if (op.kind === "MessageRead" || op.kind === "MessageDeleted") {
            if (!sentMessages.has(op.messageId)) {
                errors.push({
                    code: "READ_BEFORE_SEND",
                    message: `Message ${op.messageId} is ${op.kind === "MessageRead" ? "read" : "deleted"} before it was sent`,
                });
            }
        }
    }

    return errors;
}

/**
 * Full validation of Timeline IR including semantic checks.
 */
export function validateTimelineIRFull(ir: TimelineIR): ValidationError[] {
    return [
        ...validateTimelineIR(ir),
        ...validateReadBeforeSend(ir.ops),
    ];
}
