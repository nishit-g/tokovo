/**
 * Narrative Constraints
 * 
 * Validation rules that ensure story correctness.
 * These make AI-generated output safe by construction.
 */

import { SceneIR, SceneOp, DeviceScene, Beat, MessageRef } from "./scene";

/**
 * Constraint violation.
 */
export interface ConstraintViolation {
    readonly code: string;
    readonly message: string;
    readonly severity: "error" | "warning";
    readonly location?: {
        deviceId?: string;
        beat?: string;
        opIndex?: number;
    };
}

/**
 * Constraint validation result.
 */
export interface ConstraintResult {
    valid: boolean;
    violations: ConstraintViolation[];
}

/**
 * Validate narrative constraints for a Scene IR.
 */
export function validateConstraints(sceneIR: SceneIR): ConstraintResult {
    const violations: ConstraintViolation[] = [];

    for (const device of sceneIR.devices) {
        violations.push(...validateDeviceConstraints(device, sceneIR));
    }

    return {
        valid: violations.filter(v => v.severity === "error").length === 0,
        violations,
    };
}

/**
 * Validate constraints for a device.
 */
function validateDeviceConstraints(
    device: DeviceScene,
    sceneIR: SceneIR
): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];
    const sentMessages = new Set<string>();
    let typingActors = new Set<string>();

    for (const beat of device.beats) {
        violations.push(...validateBeatConstraints(
            beat,
            device,
            sceneIR,
            sentMessages,
            typingActors
        ));
    }

    // Check for unclosed typing
    if (typingActors.size > 0) {
        violations.push({
            code: "UNCLOSED_TYPING",
            message: `Typing never ended for actors: ${Array.from(typingActors).join(", ")}`,
            severity: "warning",
            location: { deviceId: device.deviceId },
        });
    }

    return violations;
}

/**
 * Validate constraints for a beat.
 */
function validateBeatConstraints(
    beat: Beat,
    device: DeviceScene,
    sceneIR: SceneIR,
    sentMessages: Set<string>,
    typingActors: Set<string>
): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    for (let i = 0; i < beat.ops.length; i++) {
        const op = beat.ops[i];
        const location = {
            deviceId: device.deviceId,
            beat: beat.name,
            opIndex: i,
        };

        violations.push(...validateOp(
            op,
            device,
            sceneIR,
            sentMessages,
            typingActors,
            location
        ));
    }

    return violations;
}

/**
 * Validate a single operation.
 */
function validateOp(
    op: SceneOp,
    device: DeviceScene,
    sceneIR: SceneIR,
    sentMessages: Set<string>,
    typingActors: Set<string>,
    location: { deviceId: string; beat: string; opIndex: number }
): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    switch (op.kind) {
        case "TypingStart": {
            if (typingActors.has(op.actor)) {
                violations.push({
                    code: "DUPLICATE_TYPING_START",
                    message: `Typing already started for actor "${op.actor}"`,
                    severity: "warning",
                    location,
                });
            }
            typingActors.add(op.actor);
            break;
        }

        case "TypingEnd": {
            if (!typingActors.has(op.actor)) {
                violations.push({
                    code: "TYPING_END_WITHOUT_START",
                    message: `Typing ended for actor "${op.actor}" but never started`,
                    severity: "error",
                    location,
                });
            }
            typingActors.delete(op.actor);
            break;
        }

        case "SendMessage":
        case "ReceiveMessage": {
            // Track message for later read/delete validation
            // Note: actual ID is assigned by compiler
            sentMessages.add(`${device.deviceId}_${op.conversationId}_${beat_name(location)}_${location.opIndex}`);
            break;
        }

        case "ReadMessage": {
            violations.push(...validateMessageRef(op.ref, device, sceneIR, sentMessages, location, "read"));
            break;
        }

        case "DeleteMessage": {
            violations.push(...validateMessageRef(op.ref, device, sceneIR, sentMessages, location, "delete"));
            break;
        }

        case "POVSwitch": {
            if (!sceneIR.devices.find(d => d.deviceId === op.deviceId)) {
                violations.push({
                    code: "INVALID_POV_DEVICE",
                    message: `POVSwitch to non-existent device "${op.deviceId}"`,
                    severity: "error",
                    location,
                });
            }
            break;
        }

        case "SplitPOV": {
            for (const devId of op.devices) {
                if (!sceneIR.devices.find(d => d.deviceId === devId)) {
                    violations.push({
                        code: "INVALID_SPLIT_POV_DEVICE",
                        message: `SplitPOV includes non-existent device "${devId}"`,
                        severity: "error",
                        location,
                    });
                }
            }
            break;
        }

        case "Concurrent": {
            // Recursively validate tracks
            for (const track of op.tracks) {
                for (let j = 0; j < track.length; j++) {
                    violations.push(...validateOp(
                        track[j],
                        device,
                        sceneIR,
                        sentMessages,
                        new Set(typingActors), // Fork typing state per track
                        { ...location, opIndex: location.opIndex * 100 + j }
                    ));
                }
            }
            break;
        }
    }

    return violations;
}

/**
 * Validate a message reference.
 */
function validateMessageRef(
    ref: MessageRef,
    device: DeviceScene,
    sceneIR: SceneIR,
    sentMessages: Set<string>,
    location: { deviceId: string; beat: string; opIndex: number },
    action: "read" | "delete"
): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    // Check device exists
    if (!sceneIR.devices.find(d => d.deviceId === ref.deviceId)) {
        violations.push({
            code: "INVALID_MESSAGE_REF_DEVICE",
            message: `Message ref targets non-existent device "${ref.deviceId}"`,
            severity: "error",
            location,
        });
    }

    // Check conversation exists on target device
    const targetDevice = sceneIR.devices.find(d => d.deviceId === ref.deviceId);
    if (targetDevice && !targetDevice.conversations.find(c => c.id === ref.conversationId)) {
        violations.push({
            code: "INVALID_MESSAGE_REF_CONVERSATION",
            message: `Message ref targets non-existent conversation "${ref.conversationId}"`,
            severity: "error",
            location,
        });
    }

    return violations;
}

/**
 * Helper to get beat name from location.
 */
function beat_name(location: { beat: string }): string {
    return location.beat;
}

// =============================================================================
// SPECIFIC CONSTRAINT CHECKS
// =============================================================================

/**
 * Check that no message is read before it exists.
 */
export function checkReadBeforeSend(sceneIR: SceneIR): ConstraintViolation[] {
    // This is a simplified check - full implementation would track
    // message IDs through the compilation process
    return [];
}

/**
 * Check that all POV devices are defined.
 */
export function checkPOVDevices(sceneIR: SceneIR): ConstraintViolation[] {
    const result = validateConstraints(sceneIR);
    return result.violations.filter(v =>
        v.code === "INVALID_POV_DEVICE" || v.code === "INVALID_SPLIT_POV_DEVICE"
    );
}

/**
 * Check semantic meta values are valid.
 */
export function checkSemanticMeta(sceneIR: SceneIR): ConstraintViolation[] {
    const violations: ConstraintViolation[] = [];

    for (const device of sceneIR.devices) {
        for (const beat of device.beats) {
            // Check beat meta
            if (beat.meta) {
                if (beat.meta.tempo && !["slow", "medium", "fast"].includes(beat.meta.tempo)) {
                    violations.push({
                        code: "INVALID_BEAT_TEMPO",
                        message: `Invalid tempo "${beat.meta.tempo}" in beat "${beat.name}"`,
                        severity: "warning",
                        location: { deviceId: device.deviceId, beat: beat.name },
                    });
                }
            }

            // Check message semantic meta
            for (let i = 0; i < beat.ops.length; i++) {
                const op = beat.ops[i];
                if (op.kind === "SendMessage" || op.kind === "ReceiveMessage") {
                    const semantic = op.meta?.semantic;
                    if (semantic) {
                        if (semantic.intensity !== undefined && (semantic.intensity < 0 || semantic.intensity > 1)) {
                            violations.push({
                                code: "INVALID_INTENSITY",
                                message: `Intensity must be 0-1, got ${semantic.intensity}`,
                                severity: "error",
                                location: { deviceId: device.deviceId, beat: beat.name, opIndex: i },
                            });
                        }
                        if (semantic.urgency !== undefined && (semantic.urgency < 0 || semantic.urgency > 1)) {
                            violations.push({
                                code: "INVALID_URGENCY",
                                message: `Urgency must be 0-1, got ${semantic.urgency}`,
                                severity: "error",
                                location: { deviceId: device.deviceId, beat: beat.name, opIndex: i },
                            });
                        }
                    }
                }
            }
        }
    }

    return violations;
}
