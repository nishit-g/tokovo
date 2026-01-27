// State types for Demo Notes plugin

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface DemoState {
  notes: Note[];
  currentScreen: "list" | "detail" | "editor";
  activeNoteId: string | null;
}

// Initial state function
export function createDemoInitialState(): DemoState {
  return {
    notes: [],
    currentScreen: "list",
    activeNoteId: null,
  };
}
