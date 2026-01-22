/**
 * DSL Events Module
 */

export { messages } from "./messages";
export { camera, ZoomOptions, PanOptions, ShakeOptions } from "./camera";
export { audio as audioEvents, PlayOptions, FadeOptions } from "./audio";
export { os } from "./os";
export { touch } from "./touch";
export { call, CallEvent, IncomingCallOptions } from "./call";
export { navigation } from "./navigation";
export { notification, ScheduleNotificationOptions } from "./notification";

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
