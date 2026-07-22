import { createLayoutCinematicSubjectProvider } from "@tokovo/core";

export const SnapchatCinematicSubjects = createLayoutCinematicSubjectProvider({
  ownerId: "app_snapchat",
  semanticSubjectIds: [
    "snapchat_chat_list",
    "snapchat_composer",
    "snapchat_header",
    "snapchat_input",
    "snapchat_last_message",
    "snapchat_snap_content",
    "snapchat_snap_viewer",
    "snapchat_thread",
  ],
});
