

export interface NavigateAppEvent {
  at: number;
  kind: "APP";
  appId: string;
  type: "NAVIGATE_APP";
  screen?: string;
  conversationId?: string;
  transition?: "push" | "pop" | "present";
  animationDuration?: number;
}

export interface NavigateScreenEvent {
  at: number;
  kind: "APP";
  appId: string;
  type: "NAVIGATE_SCREEN";
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
    screen: screen as string,
    transition: options?.transition,
    animationDuration: options?.duration,
  }),
};
