/**
 * Helpers Module
 *
 * Event factory functions and simulation utilities.
 * Use these for low-level event creation.
 *
 * @example
 * ```typescript
 * import { keyboard, generateTyping } from "@tokovo/dsl/helpers";
 *
 * const events = [
 *     keyboard.show(30, "phone"),
 *     ...generateTyping(50, "phone", "Hello!"),
 *     keyboard.hide(200, "phone"),
 * ];
 * ```
 */

// Keyboard events
export { keyboard } from "./keyboard";

// Typing simulation
export {
    generateTyping,
    getTypingEndFrame,
    TYPING_SPEEDS,
} from "./typing";

export type {
    TypingSpeed,
    TypingOptions,
} from "./typing";

// Message events
export { messages } from "./messages";

// Camera events
export { camera } from "./camera";

export type {
    ZoomOptions,
    PanOptions,
    ShakeOptions,
} from "./camera";

// Audio events
export { audio as audioEvents } from "./audio";

export type {
    PlayOptions,
    FadeOptions,
} from "./audio";

// OS events
export { os } from "./os";

// Touch events
export { touch } from "./touch";

// Navigation events
export { navigation } from "./navigation";

// Notification events
export { notification } from "./notification";

export type {
    ScheduleNotificationOptions,
} from "./notification";

// Call events
export { call } from "./call";

export type {
    CallEvent,
    IncomingCallOptions,
} from "./call";

// Bundled DSL object for convenience
import { keyboard } from "./keyboard";
import { messages } from "./messages";
import { camera } from "./camera";
import { audio as audioEvents } from "./audio";
import { os } from "./os";
import { touch } from "./touch";
import { call } from "./call";
import { navigation } from "./navigation";
import { notification } from "./notification";

/**
 * Bundled DSL object with all event factories.
 */
export const dsl = {
    keyboard,
    messages,
    camera,
    audio: audioEvents,
    touch,
    call,
    navigation,
    os,
    notification,
};
