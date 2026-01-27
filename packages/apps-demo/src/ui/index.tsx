import React from "react";
import type { PluginViewProps } from "@tokovo/core";
import type { DemoState } from "../runtime/state";
import { NotesList } from "./NotesList";
import { NoteDetail } from "./NoteDetail";
import { NoteEditor } from "./NoteEditor";

// Main view component with screen routing
export const DemoView: React.FC<PluginViewProps> = ({ world, platform }) => {
  // Access plugin state from world.appState
  const appState = world.appState?.["app_demo"] as DemoState | undefined;
  const currentScreen = appState?.currentScreen || "list";

  switch (currentScreen) {
    case "list":
      return <NotesList appState={appState} />;
    case "detail":
      return <NoteDetail appState={appState} />;
    case "editor":
      return <NoteEditor appState={appState} />;
    default:
      return <NotesList appState={appState} />;
  }
};
