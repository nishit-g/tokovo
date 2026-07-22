import { createLayoutCinematicSubjectProvider } from "@tokovo/core";

export const InstagramCinematicSubjects = createLayoutCinematicSubjectProvider({
  ownerId: "app_instagram",
  semanticSubjectIds: [
    "bottom_nav",
    "composer_caption_input",
    "composer_media",
    "dm_message_latest",
    "dm_thread",
    "feed_list",
    "feed_post_focus",
    "home_header",
    "inbox_header",
    "profile_grid",
    "profile_header",
    "reply_composer",
    "stories_tray",
    "story_progress",
    "story_reply_bar",
    "story_viewer",
    "thread_header",
  ],
});
