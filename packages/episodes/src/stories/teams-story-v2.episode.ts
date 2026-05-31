import { KeyboardPlugin } from "@tokovo/compiler";
import { dmTarget, threadTarget } from "@tokovo/apps-teams";
import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "teams-story-v2",
    title: "Teams Story V2",
    description:
      "A new Teams story where a launch-incident thread slowly turns into a negotiation between engineering truth and executive language.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 140,
    tags: ["story", "teams", "incident", "thread", "executive"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1170,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-story-v2", { fps: 30, duration: "39s", title: "Teams Story V2" })
      .device("phone", "iphone16", {
        app: "app_teams",
        os: {
          time: new Date("2026-04-10T11:50:00"),
          battery: 76,
          network: "5G",
        },
      })
      .snapshot("app_teams", "phone", {
        users: [
          { id: "u_me", displayName: "Ari", role: "Incident lead" },
          { id: "u_ops", displayName: "Priya", role: "Ops" },
          { id: "u_exec", displayName: "Rohan", role: "Exec" },
        ],
        channels: [{ id: "launch_story_v2", name: "launch", memberIds: ["u_me", "u_ops"], description: "Go-live", threadIds: ["th_story_v2"], unreadCount: 1, mentionCount: 1 }],
        threads: [{ id: "th_story_v2", channelId: "launch_story_v2", title: "Homepage mismatch", participantIds: ["u_me", "u_ops"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" }],
        dms: [{ id: "dm_exec_story_v2", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 1, mentionCount: 0 }],
      })
      .teams("phone", (teams) => {
        teams.openThread("launch_story_v2", "th_story_v2", "1.0s");
        teams.at("2.0s").receiveMessage({
          target: threadTarget("launch_story_v2", "th_story_v2"),
          senderId: "u_ops",
          text: "We shipped the quiet layout, but the old hero is still cached on mobile Safari.",
        });
        teams.at("4.0s").sendMessage({
          target: threadTarget("launch_story_v2", "th_story_v2"),
          text: "Then the homepage is both right and wrong, which is exactly the kind of problem I hate.",
          typed: true,
        });
        teams.openDm("dm_exec_story_v2", "8.0s");
        teams.at("8.8s").receiveMessage({
          target: dmTarget("dm_exec_story_v2"),
          senderId: "u_exec",
          text: "Tell me the board version, not the engineering version.",
        });
        teams.at("10.4s").sendMessage({
          target: dmTarget("dm_exec_story_v2"),
          text: "Board version: the rollout is healthy, but mobile cache is lagging behind the intended design.",
          typed: true,
        });
      })
      .camera((cam) => {
        cam.at("1.1s").focus("thread_view", { scale: 1.08, duration: "0.35s" });
        cam.at("8.1s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
      })
      .use(new KeyboardPlugin({ onlyForSentMessages: true, defaultCharDelay: 3 }))
      .build(),
});
