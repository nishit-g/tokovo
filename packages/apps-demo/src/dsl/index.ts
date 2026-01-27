import type { DslExtension } from "@tokovo/core";

// Method Chaining Design: DSL methods return Api type for fluent syntax
// Example: b.use("app_demo").createNote({...}).viewNote("1").editNote("1", {...})

interface DemoDslApi {
  createNote: (data: { title: string; content: string }) => DemoDslApi;
  viewNote: (noteId: string) => DemoDslApi;
  editNote: (noteId: string, data: { title?: string; content?: string }) => DemoDslApi;
  deleteNote: (noteId: string) => DemoDslApi;
}

// Builder interface for recording operations
interface DemoBuilder {
  ops: { kind: string; [key: string]: unknown }[];
  wait: (duration: number) => void;
}

// Utility for generating unique note IDs
function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const demoDsl: DslExtension<DemoDslApi> = {
  createApi: (builderUnknown) => {
    const builder = builderUnknown as DemoBuilder;

    const api: DemoDslApi = {
      createNote: (data) => {
        builder.ops.push({
          kind: "CreateNote",
          ...data,
          id: generateNoteId(),
        });
        return api;
      },
      viewNote: (noteId) => {
        builder.ops.push({ kind: "ViewNote", noteId });
        return api;
      },
      editNote: (noteId, data) => {
        builder.ops.push({ kind: "EditNote", noteId, ...data });
        return api;
      },
      deleteNote: (noteId) => {
        builder.ops.push({ kind: "DeleteNote", noteId });
        return api;
      },
    };

    return api;
  },
};
