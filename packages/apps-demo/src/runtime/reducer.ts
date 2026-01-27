import type { WorldState, PluginReducer, RuntimeEvent } from "@tokovo/core";
import type { DemoState, Note } from "./state";
import { createDemoInitialState } from "./state";

// Helper to access plugin state from WorldState
function getAppState(draft: WorldState): DemoState {
  if (!draft.appState) {
    draft.appState = {};
  }
  if (!draft.appState["app_demo"]) {
    draft.appState["app_demo"] = createDemoInitialState();
  }
  return draft.appState["app_demo"] as DemoState;
}

// Reducer - receives WorldState and event, mutates draft via Immer
export const demoReducer: PluginReducer<"app_demo"> = (
  draft: WorldState,
  event: RuntimeEvent & { kind: "APP"; appId: "app_demo" }
) => {
  const appState = getAppState(draft);

  switch (event.type) {
    case "ADD_NOTE":
      appState.notes.push(event.payload as Note);
      break;
    case "UPDATE_NOTE": {
      const payload = event.payload as { noteId: string; title?: string; content?: string; updatedAt: number };
      const noteToUpdate = appState.notes.find((n) => n.id === payload.noteId);
      if (noteToUpdate) {
        if (payload.title) noteToUpdate.title = payload.title;
        if (payload.content) noteToUpdate.content = payload.content;
        noteToUpdate.updatedAt = payload.updatedAt;
      }
      break;
    }
    case "DELETE_NOTE": {
      const payload = event.payload as { noteId: string };
      appState.notes = appState.notes.filter((n) => n.id !== payload.noteId);
      break;
    }
    case "SET_ACTIVE_NOTE": {
      const payload = event.payload as { noteId: string };
      appState.activeNoteId = payload.noteId;
      break;
    }
    case "SET_SCREEN": {
      const payload = event.payload as { screen: "list" | "detail" | "editor" };
      appState.currentScreen = payload.screen;
      break;
    }
  }
};
