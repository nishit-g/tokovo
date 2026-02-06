import React, { createContext, useContext, useMemo } from "react";
import type { VideoRunnerRuntime } from "./runtime";
import { createVideoRunnerRuntime } from "./runtime";

const RuntimeContext = createContext<VideoRunnerRuntime | null>(null);

export function VideoRunnerRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtime = useMemo(() => createVideoRunnerRuntime(), []);
  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  );
}

export function useVideoRunnerRuntime(): VideoRunnerRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error(
      "useVideoRunnerRuntime must be used within VideoRunnerRuntimeProvider",
    );
  }
  return runtime;
}

