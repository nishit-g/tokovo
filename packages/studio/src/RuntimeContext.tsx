import React, { createContext, useContext, useMemo } from "react";
import type { StudioRuntime } from "./runtime";
import { createStudioRuntime } from "./runtime";

const RuntimeContext = createContext<StudioRuntime | null>(null);

export function StudioRuntimeProvider({ children }: { children: React.ReactNode }) {
  const runtime = useMemo(() => createStudioRuntime(), []);
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
}

export function useStudioRuntime(): StudioRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error("useStudioRuntime must be used within StudioRuntimeProvider");
  }
  return runtime;
}

