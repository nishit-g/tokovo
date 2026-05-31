import { KeyboardPlugin } from "@tokovo/compiler";
import { dmTarget, threadTarget } from "@tokovo/apps-teams";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "teams-theme-storybook-v2",
    title: "Teams Theme Storybook V2",
    description:
      "A new Storybook-toned Teams showcase proving theme, channels, threads, and DMs without losing team structure.",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_teams",
    themeId: "teams-storybook",
    visibility: "public",
    sortOrder: 520,
    tags: ["teams", "theme", "storybook", "channels", "threads"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-theme-storybook-v2", {
      fps: 30,
      duration: "40s",
      title: "Teams Theme Storybook V2",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        theme: "teams-storybook",
        os: {
          time: new Date("2026-04-10T23:10:00"),
          battery: 64,
          network: "4G",
        },
      })
      .snapshot("app_teams", "phone", {
        users: [
          { id: "u_me", displayName: "Mina", role: "Night shift director" },
          { id: "u_aki", displayName: "Aki", role: "Animation lead" },
          { id: "u_ren", displayName: "Ren", role: "Compositing" },
        ],
        channels: [
          { id: "moonlit-cut-v2", name: "moonlit-cut", memberIds: ["u_me", "u_aki", "u_ren"], description: "Festival reel polish", threadIds: ["th_color_grade_v2"], unreadCount: 1, mentionCount: 0 },
        ],
        threads: [
          { id: "th_color_grade_v2", channelId: "moonlit-cut-v2", title: "Color grade", participantIds: ["u_me", "u_aki", "u_ren"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" },
        ],
        dms: [
          { id: "dm_aki_v2", participantIds: ["u_me", "u_aki"], messageIds: [], unreadCount: 0, mentionCount: 0 },
        ],
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .teams("phone", (teams) => {
        teams.openChatList("0s");
        teams.openThread("moonlit-cut-v2", "th_color_grade_v2", "1.4s");
        teams.at("2.2s").receiveMessage({
          target: threadTarget("moonlit-cut-v2", "th_color_grade_v2"),
          senderId: "u_aki",
          text: "If we cool the sky any further, it loses its hush.",
        });
        teams.at("4.0s").sendMessage({
          target: threadTarget("moonlit-cut-v2", "th_color_grade_v2"),
          text: "Then leave the sky. Only soften the highlights on the hill path.",
          typed: true,
        });
        teams.openDm("dm_aki_v2", "8.2s");
        teams.at("8.8s").receiveMessage({
          target: dmTarget("dm_aki_v2"),
          senderId: "u_aki",
          text: "You say 'softer' like a threat and a blessing at the same time.",
        });
        teams.at("10.4s").sendMessage({
          target: dmTarget("dm_aki_v2"),
          text: "That is the correct reading.",
          typed: true,
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.01, duration: "0.35s" });
        cam.at("1.5s").focus("thread_view", { scale: 1.08, duration: "0.35s" });
        cam.at("8.3s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
      })
      .use(new KeyboardPlugin({ onlyForSentMessages: true, defaultCharDelay: 3 }))
      .build(),
});
