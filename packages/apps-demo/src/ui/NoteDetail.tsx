import React from "react";
import type { DemoState } from "../runtime/state";
import { getDemoTheme } from "../config/theme";
import { demoSpacing } from "../components/tokens";

interface NoteDetailProps {
  appState: DemoState | undefined;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ appState }) => {
  const theme = getDemoTheme("light");
  const activeNoteId = appState?.activeNoteId;
  const note = appState?.notes.find((n) => n.id === activeNoteId);

  if (!note) {
    return (
      <div
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          padding: {{ camelCase name }}Spacing.noteCardPadding,
          minHeight: "100vh",
        }}
      >
        <p style={{ ...theme.typography.body }}>Note not found</p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        padding: {{ camelCase name }}Spacing.noteCardPadding,
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <button
          style={{
            ...theme.typography.body,
            padding: "8px 16px",
            backgroundColor: theme.colors.primary,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </div>
      <h1 style={{ ...theme.typography.title, marginBottom: 12 }}>
        {note.title}
      </h1>
      <p style={{ ...theme.typography.caption, color: theme.colors.text, marginBottom: 24 }}>
        Last updated: {new Date(note.updatedAt).toLocaleString()}
      </p>
      <div
        style={{
          ...theme.typography.body,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
        }}
      >
        {note.content}
      </div>
    </div>
  );
};
