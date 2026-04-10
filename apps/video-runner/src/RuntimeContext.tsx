import React from "react";
import { getSharedVideoRunnerRuntime } from "./runtime";
import { RuntimeContext } from "./RuntimeSharedContext";

export function VideoRunnerRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtime = getSharedVideoRunnerRuntime();
  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  );
}
