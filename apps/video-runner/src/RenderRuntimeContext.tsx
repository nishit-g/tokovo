import React from "react";

import { getSharedRenderRuntime } from "./render-runtime";
import { RuntimeContext } from "./RuntimeSharedContext";

export function RenderRuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtime = getSharedRenderRuntime();
  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  );
}
