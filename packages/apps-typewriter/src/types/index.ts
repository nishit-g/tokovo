import type { TrackEventBase } from "@tokovo/ir";
import type { TypewriterState } from "../runtime/state.js";
import { TYPEWRITER_APP_ID } from "../constants.js";

export type TypewriterTrackEventType =
  | "TYPEWRITER_INIT_LETTER"
  | "TYPEWRITER_KEY"
  | "TYPEWRITER_NEWLINE"
  | "TYPEWRITER_BACKSPACE"
  | "TYPEWRITER_SET_CURSOR"
  | "TYPEWRITER_SCROLL"
  | "TYPEWRITER_TYPE_TEXT";

export type TypewriterRuntimeEventType =
  | "TYPEWRITER_INIT_LETTER"
  | "TYPEWRITER_KEY"
  | "TYPEWRITER_NEWLINE"
  | "TYPEWRITER_BACKSPACE"
  | "TYPEWRITER_SET_CURSOR"
  | "TYPEWRITER_SCROLL";

export type TypewriterEventKind = TypewriterRuntimeEventType;

export type TypewriterTrackEvent = TrackEventBase & {
  kind: "APP";
  appId: typeof TYPEWRITER_APP_ID;
} & {
  type: TypewriterTrackEventType;
  payload: Record<string, unknown>;
};

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    app_typewriter: TypewriterTrackEvent;
  }
}

declare module "@tokovo/core" {
  interface AppStateMap {
    app_typewriter: TypewriterState;
  }

  interface AppEventKindRegistry {
    app_typewriter: TypewriterEventKind;
  }

  interface AppInitialStateRegistry {
    app_typewriter: TypewriterState;
  }
}

