import { createLayoutCinematicSubjectProvider } from "@tokovo/core";

export const TeamsCinematicSubjects = createLayoutCinematicSubjectProvider({
  ownerId: "app_teams",
  semanticSubjectIds: [
    "teams_call_controls",
    "teams_call_grid",
    "teams_call_header",
    "teams_call_surface",
    "teams_composer",
    "teams_content",
    "teams_filters",
    "teams_header",
    "teams_message_list",
    "teams_surface",
    "teams_tabbar",
    "teams_thread",
    "teams_typing_indicator",
  ],
});
