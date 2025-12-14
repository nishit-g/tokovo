/**
 * Validation Module Barrel Export
 *
 * @module @tokovo/compiler/validation
 */

export { type ValidationMode, validateScene, getRequiredCapability, getCapabilityHint } from "./scene-validator";
export type { SceneIRForValidation, DeviceIRForValidation, BeatIRForValidation, OpIRForValidation } from "./scene-validator";

export { validateTimeline, validateDeterministicTiming } from "./timeline-validator";
export type { TimelineIRForValidation, TimelineOpForValidation } from "./timeline-validator";

export { mapToCanonicalContent, validateMessages } from "./content-validator";
export type { MessageInput } from "./content-validator";

export { validateCustomEvent, checkCustomUsageThreshold, validateAllCustomEvents } from "./custom-validator";
export type { CustomUsageResult } from "./custom-validator";
