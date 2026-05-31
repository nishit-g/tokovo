import deviceRealismExhaustive from "./device-realism-exhaustive.episode.js";
import notificationCenterExhaustive from "./notification-center-exhaustive.episode.js";
import notificationSystemExhaustive from "./notification-system-exhaustive.episode.js";
import cameraAnchorExhaustive from "./camera-anchor-exhaustive.episode.js";
import keyboardInputExhaustive from "./keyboard-input-exhaustive.episode.js";
import multiDeviceExhaustive from "./multi-device-exhaustive.episode.js";
import screenRecordingExhaustive from "./screen-recording-exhaustive.episode.js";
import callScreenExhaustive from "./call-screen-exhaustive.episode.js";

export const fixedSystemShowcaseEpisodes = [
  deviceRealismExhaustive,
  screenRecordingExhaustive,
  callScreenExhaustive,
  notificationCenterExhaustive,
  notificationSystemExhaustive,
  cameraAnchorExhaustive,
  keyboardInputExhaustive,
  multiDeviceExhaustive,
];

export default fixedSystemShowcaseEpisodes;
