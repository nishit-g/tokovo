/**
 * Helpers Module
 */

export { messages } from "./messages";
export { camera } from "./camera";

export type { ZoomOptions, PanOptions, ShakeOptions } from "./camera";

export { audio as audioEvents } from "./audio";

export type { PlayOptions, FadeOptions } from "./audio";

export { os } from "./os";
export { touch } from "./touch";
export { navigation } from "./navigation";
export { notification } from "./notification";

export type { ScheduleNotificationOptions } from "./notification";

export { call } from "./call";

export type { CallEvent, IncomingCallOptions } from "./call";

import { messages } from "./messages";
import { camera } from "./camera";
import { audio as audioEvents } from "./audio";
import { os } from "./os";
import { touch } from "./touch";
import { call } from "./call";
import { navigation } from "./navigation";
import { notification } from "./notification";

export const dsl = {
  messages,
  camera,
  audio: audioEvents,
  touch,
  call,
  navigation,
  os,
  notification,
};
