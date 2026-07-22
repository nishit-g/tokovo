import { createLayoutCinematicSubjectProvider } from "@tokovo/core";

export const IMessageCinematicSubjects = createLayoutCinematicSubjectProvider({
  ownerId: "app_imessage",
  semanticSubjectIds: [
    "imessage_chat_header",
    "imessage_composer",
    "imessage_input",
    "imessage_last_message",
    "imessage_list",
    "imessage_list_header",
    "imessage_media",
    "imessage_thread",
  ],
});
