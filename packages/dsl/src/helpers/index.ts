export { messages } from "./messages";
export { os } from "./os";
export { touch } from "./touch";
export { navigation } from "./navigation";
export { notification } from "./notification";
export { call } from "./call";

export type { ScheduleNotificationOptions } from "./notification";
export type { CallEvent, IncomingCallOptions } from "./call";

import { messages } from "./messages";
import { os } from "./os";
import { touch } from "./touch";
import { call } from "./call";
import { navigation } from "./navigation";
import { notification } from "./notification";

export const dsl = {
  messages,
  touch,
  call,
  navigation,
  os,
  notification,
};
