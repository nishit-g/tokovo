import { createLayoutCinematicSubjectProvider } from "@tokovo/core";

export const XCinematicSubjects = createLayoutCinematicSubjectProvider({
  ownerId: "app_x",
  semanticSubjectIds: [
    "compose_editor",
    "compose_fab",
    "dm_message_latest",
    "dm_thread",
    "metrics_row",
    "nav_bar",
    "notifications_list",
    "profile_header",
    "reply_composer",
    "thread_header",
    "timeline_feed",
    "timeline_header",
    "timeline_primary_actions",
    "timeline_primary_content",
    "timeline_primary_media",
    "tweet_card",
    "tweet_detail_body",
    "tweet_detail_header",
    "tweet_detail_media",
  ],
});
