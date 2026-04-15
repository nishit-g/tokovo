import { createContext, useContext } from "react";

import type { VideoRunnerRuntime } from "./runtime";

export const RuntimeContext = createContext<VideoRunnerRuntime | null>(null);

export function useVideoRunnerRuntime(): VideoRunnerRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error(
      "useVideoRunnerRuntime must be used within a VideoRunnerRuntimeProvider",
    );
  }
  return runtime;
}
