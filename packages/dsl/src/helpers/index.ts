export { messages } from "./messages";
export { os } from "./os";
export { navigation } from "./navigation";
export { notification } from "./notification";
export { call } from "./call";
export { camera } from "./camera";
export { audio } from "./audio";

export type { ScheduleNotificationOptions } from "./notification";
export type { CallEvent, IncomingCallOptions } from "./call";
export type { ZoomOptions, PanOptions, ShakeOptions } from "./camera";
export type { PlayOptions, FadeOptions } from "./audio";

import { messages } from "./messages";
import { os } from "./os";
import { call } from "./call";
import { navigation } from "./navigation";
import { notification } from "./notification";
import { camera } from "./camera";
import { audio } from "./audio";

export const dsl = {
  messages,
  call,
  navigation,
  os,
  notification,
  camera,
  audio,
};
