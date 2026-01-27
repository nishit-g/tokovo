import React from "react";
import type { DemoState } from "../runtime/state";
import { getDemoTheme } from "../config/theme";
import { demoSpacing } from "../components/tokens";

interface NoteEditorProps {
  appState: DemoState | undefined;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ appState }) => {
  const theme = getDemoTheme("light");
  const activeNoteId = appState?.activeNoteId;
  const note = appState?.notes.find((n) => n.id === activeNoteId);

  const [title, setTitle] = React.useState(note?.title ?? "");
  const [content, setContent] = React.useState(note?.content ?? "");

  return (
    <div
      style={{
        backgroundColor: theme.colors.noteEditorBackground,
        color: theme.colors.text,
        padding: {{ camelCase name }}Spacing.editorPadding,
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
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
          Save
        </button>
        <button
          style={{
            ...theme.typography.body,
            padding: "8px 16px",
            backgroundColor: "#ddd",
            color: "#333",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          style={{
            ...theme.typography.title,
            width: "100%",
            padding: 12,
            border: `1px solid ${theme.colors.noteCardBorder}`,
            borderRadius: 4,
            backgroundColor: theme.colors.noteCardBackground,
            color: theme.colors.text,
          }}
        />
      </div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          rows={15}
          style={{
            ...theme.typography.body,
            width: "100%",
            padding: 12,
            border: `1px solid ${theme.colors.noteCardBorder}`,
            borderRadius: 4,
            backgroundColor: theme.colors.noteCardBackground,
            color: theme.colors.text,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>
    </div>
  );
};
