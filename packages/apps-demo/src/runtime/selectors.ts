import type { WorldState } from "@tokovo/core";
import type { DemoState, Note } from "./state";

// Selectors for accessing plugin state

export function getDemoState(world: WorldState): DemoState | undefined {
  return world.appState?.["app_demo"] as DemoState | undefined;
}

export function getNotes(world: WorldState): Note[] {
  return getDemoState(world)?.notes ?? [];
}

export function getActiveNote(world: WorldState): Note | null {
  const state = getDemoState(world);
  if (!state?.activeNoteId) return null;
  return state.notes.find((n) => n.id === state.activeNoteId) ?? null;
}

export function getCurrentScreen(world: WorldState): "list" | "detail" | "editor" {
  return getDemoState(world)?.currentScreen ?? "list";
}
