import { createLayoutCinematicSubjectProvider } from "@tokovo/core";

export const LinkedInCinematicSubjects = createLayoutCinematicSubjectProvider({
  ownerId: "app_linkedin",
  semanticSubjectIds: [
    "li_comment_composer",
    "li_compose_sheet",
    "li_dm_composer",
    "li_dm_focus_message",
    "li_dm_header",
    "li_dm_thread",
    "li_feed",
    "li_header",
    "li_messages_list",
    "li_nav_bar",
    "li_notifications_list",
    "li_post_detail",
    "li_post_focus",
    "li_profile_header",
  ],
});
