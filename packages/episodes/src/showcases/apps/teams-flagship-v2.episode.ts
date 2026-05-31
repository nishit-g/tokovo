import { KeyboardPlugin, OSDirectorPlugin } from "@tokovo/compiler";
import { dmTarget, threadTarget } from "@tokovo/apps-teams";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "teams-flagship-v2",
    title: "Teams Flagship V2",
    description:
      "Fresh Teams flagship covering chat list, thread escalation, executive DM, and a short bridge call.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_teams",
    visibility: "public",
    sortOrder: 500,
    tags: ["teams", "flagship", "channels", "threads", "dm", "call"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1320,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-flagship-v2", {
      fps: 30,
      duration: "44s",
      title: "Teams Flagship V2",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        os: {
          time: new Date("2026-04-10T11:08:00"),
          battery: 79,
          network: "5G",
        },
      })
      .snapshot("app_teams", "phone", {
        users: [
          { id: "u_me", displayName: "Ari", role: "Incident lead" },
          { id: "u_ops", displayName: "Priya", role: "Launch ops" },
          { id: "u_sre", displayName: "Arjun", role: "SRE" },
          { id: "u_exec", displayName: "Rohan", role: "Chief of staff" },
        ],
        channels: [
          { id: "launch-core-v2", name: "launch-core", memberIds: ["u_me", "u_ops", "u_sre"], description: "Core go-live execution", threadIds: ["th_pricing_v2"], unreadCount: 1, mentionCount: 1 },
          { id: "exec-brief-v2", name: "exec-brief", memberIds: ["u_me", "u_exec"], description: "Executive updates", threadIds: [], unreadCount: 0, mentionCount: 0 },
        ],
        threads: [
          { id: "th_pricing_v2", channelId: "launch-core-v2", title: "Pricing mismatch", participantIds: ["u_me", "u_ops", "u_sre"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" },
        ],
        dms: [
          { id: "dm_exec_v2", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 1, mentionCount: 0 },
        ],
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .teams("phone", (teams) => {
        teams.openChatList("0s");
        teams.at("0.4s").setPresence("u_me", "available");
        teams.at("0.6s").setPresence("u_ops", "busy");
        teams.at("0.8s").setPresence("u_exec", "away");
        teams.openThread("launch-core-v2", "th_pricing_v2", "1.6s");
        teams.at("2.2s").receiveMessage({
          target: threadTarget("launch-core-v2", "th_pricing_v2"),
          senderId: "u_ops",
          text: "Pausing campaign. Pricing card is showing the annual number on mobile.",
          mentionedUserIds: ["u_me"],
        });
        teams.at("4.0s").receiveMessage({
          target: threadTarget("launch-core-v2", "th_pricing_v2"),
          senderId: "u_sre",
          text: "Edge cache issue. I can flush in two minutes if copy is final.",
        });
        teams.at("5.8s").sendMessage({
          target: threadTarget("launch-core-v2", "th_pricing_v2"),
          text: "Hold the campaign. Give me the corrected copy and exact exposure count.",
          typed: true,
        });
        teams.openDm("dm_exec_v2", "10.2s");
        teams.at("10.8s").receiveMessage({
          target: dmTarget("dm_exec_v2"),
          senderId: "u_exec",
          text: "Board asks in six minutes whether launch is still on.",
        });
        teams.at("12.2s").sendMessage({
          target: dmTarget("dm_exec_v2"),
          text: "Issue is contained. I need two minutes to confirm customer-facing wording.",
          typed: true,
        });
        teams.at("15.4s").startCall({
          callId: "teams_flagship_call_v2",
          participantIds: ["u_me", "u_ops", "u_sre"],
          scope: "thread",
          channelId: "launch-core-v2",
          threadId: "th_pricing_v2",
          mode: "audio",
          title: "Pricing rollback bridge",
        });
        teams.at("18.0s").updateCall({
          callId: "teams_flagship_call_v2",
          dominantSpeakerId: "u_sre",
        });
        teams.at("20.4s").endCall("teams_flagship_call_v2");
      })
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.02, duration: "0.35s" });
        cam.at("1.7s").focus("thread_view", { scale: 1.08, duration: "0.35s" });
        cam.span("2.2s", "6.2s").trackCinematic("message_list", { scale: 1.08, smoothing: 0.18 });
        cam.at("10.3s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("15.5s").focus("call_surface", { scale: 1.08, duration: "0.35s" });
      })
      .use(new KeyboardPlugin({ onlyForSentMessages: true, defaultCharDelay: 3 }))
      .use(new OSDirectorPlugin())
      .build(),
});
