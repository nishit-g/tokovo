import { createTrace } from "@tokovo/ir";
import { Tracer } from "../tracer";

interface NavigateAppEvent {
  at: number;
  kind: "APP";
  appId: string;
  type: "NAVIGATE_APP";
  _trace: ReturnType<typeof createTrace>;
  screen?: string;
  conversationId?: string;
  transition?: "push" | "pop" | "present";
  animationDuration?: number;
}

interface NavigateScreenEvent {
  at: number;
  kind: "APP";
  appId: string;
  type: "NAVIGATE_SCREEN";
  _trace: ReturnType<typeof createTrace>;
  screen: string;
  transition?: "push" | "pop" | "present" | "dismiss";
  animationDuration?: number;
}

export const navigation = {
  navigateApp: (
    at: number,
    targetAppId: string,
    options?: {
      screen?: string;
      conversationId?: string;
      transition?: "push" | "pop" | "present";
      duration?: number;
    },
  ): NavigateAppEvent => ({
    at,
    kind: "APP",
    appId: targetAppId,
    type: "NAVIGATE_APP",
    _trace: createTrace(Tracer.capture()),
    screen: options?.screen,
    conversationId: options?.conversationId,
    transition: options?.transition,
    animationDuration: options?.duration,
  }),

  navigateScreen: <ID extends keyof import("@tokovo/core").AppScreens>(
    at: number,
    appId: ID,
    screen: import("@tokovo/core").AppScreens[ID],
    options?: {
      transition?: "push" | "pop" | "present" | "dismiss";
      duration?: number;
    },
  ): NavigateScreenEvent => ({
    at,
    kind: "APP",
    appId: appId as string,
    type: "NAVIGATE_SCREEN",
    _trace: createTrace(Tracer.capture()),
    screen: screen as string,
    transition: options?.transition,
    animationDuration: options?.duration,
  }),
};
