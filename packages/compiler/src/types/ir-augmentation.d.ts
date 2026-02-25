import "@tokovo/ir";

declare module "@tokovo/ir" {
  interface AppTrackEventRegistry {
    __compiler_internal_app__: {
      at: number;
      kind: "APP";
      appId: string;
      type: string;
      payload?: Record<string, unknown>;
      duration?: number;
      deviceId?: string;
      _declarationOrder?: number;
      [key: string]: unknown;
    };
  }
}
