/**
 * DSL Events Module
 * 
 * Centralized event factories for all event types.
 * Use these instead of duplicating helpers in showcases.
 * 
 * @example
 * ```ts
 * import { dsl, generateTyping } from "@tokovo/dsl";
 * 
 * const events = [
 *     dsl.keyboard.show(30, "phone"),
 *     ...generateTyping(50, "phone", "Hello!"),
 *     dsl.messages.send(140, "dm_friend", "Hello!"),
 *     dsl.keyboard.hide(200, "phone"),
 *     dsl.os.setBattery(300, 75),
 *     dsl.touch.tap(350, 500, 600),
 * ];
 * ```
 */

// Individual event factory modules
export { keyboard } from "./keyboard";
export { messages } from "./messages";
export { camera, ZoomOptions, PanOptions, ShakeOptions } from "./camera";
export { audio as audioEvents, PlayOptions, FadeOptions } from "./audio";
export { os } from "./os";
export { touch } from "./touch";
export { call, CallEvent, IncomingCallOptions } from "./call";
export { navigation } from "./navigation";
export { notification, ScheduleNotificationOptions } from "./notification";

// Typing simulation
export {
    generateTyping,
    getTypingEndFrame,
    TYPING_SPEEDS,
    type TypingSpeed,
    type TypingOptions,
} from "./typing";

// Import for bundled object
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
 * Bundled DSL object with all event factories
 * 
 * @example
 * ```ts
 * import { dsl } from "@tokovo/dsl";
 * 
 * const events = [
 *     dsl.keyboard.show(30, "phone"),
 *     dsl.messages.send(100, "dm", "Hi!"),
 *     dsl.camera.zoom(150, 1.2, 30),
 *     dsl.audio.play(200, "notification"),
 *     dsl.os.setNetwork(250, "5G"),
 *     dsl.touch.tap(300, 540, 960),
 *     dsl.call.incoming(0, "alice", "Alice"),
 * ];
 * ```
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
