import { KeyboardPlugin, OSDirectorPlugin } from "@tokovo/compiler";
import { dmTarget, threadTarget } from "@tokovo/apps-teams";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

export default defineEpisode({
  meta: {
    id: "teams-exhaustive-v2",
    title: "Teams Exhaustive V2",
    description:
      "Dense Teams proof with channels, threads, DMs, mentions, notifications, draft handling, and call lifecycle.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_teams",
    visibility: "public",
    sortOrder: 510,
    tags: ["teams", "exhaustive", "threads", "mentions", "notifications", "calls"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1710,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-exhaustive-v2", {
      fps: 30,
      duration: "57s",
      title: "Teams Exhaustive V2",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        os: {
          time: new Date("2026-04-10T13:20:00"),
          battery: 74,
          network: "5G",
        },
      })
      .snapshot("app_teams", "phone", {
        users: [
          { id: "u_me", displayName: "Ari", role: "Incident commander" },
          { id: "u_ops", displayName: "Priya", role: "Launch ops" },
          { id: "u_sre", displayName: "Arjun", role: "SRE" },
          { id: "u_legal", displayName: "Neha", role: "Legal" },
          { id: "u_exec", displayName: "Rohan", role: "Exec" },
          { id: "u_sales", displayName: "Mira", role: "Sales" },
        ],
        channels: [
          { id: "launch-v2", name: "launch", memberIds: ["u_me", "u_ops", "u_sre", "u_legal", "u_sales"], description: "Go-live command center", threadIds: ["th_launch_v2", "th_customer_v2"], unreadCount: 1, mentionCount: 1 },
          { id: "exec-v2", name: "exec", memberIds: ["u_me", "u_exec"], description: "Board-safe updates", threadIds: [], unreadCount: 0, mentionCount: 0 },
        ],
        threads: [
          { id: "th_launch_v2", channelId: "launch-v2", title: "Pricing mismatch", participantIds: ["u_me", "u_ops", "u_sre", "u_legal"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" },
          { id: "th_customer_v2", channelId: "launch-v2", title: "Affected customers", participantIds: ["u_me", "u_sales", "u_ops"], messageIds: [], unreadCount: 0, mentionCount: 0, replyCount: 0, typingUserIds: [], state: "open" },
        ],
        dms: [
          { id: "dm_exec_ex_v2", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 1, mentionCount: 0 },
          { id: "dm_legal_ex_v2", participantIds: ["u_me", "u_legal"], messageIds: [], unreadCount: 0, mentionCount: 0 },
        ],
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .teams("phone", (teams) => {
        teams.openChatList("0s");
        teams.at("0.5s").setPresence("u_me", "available");
        teams.at("0.7s").setPresence("u_ops", "busy");
        teams.at("0.9s").setPresence("u_sre", "available");
        teams.at("1.1s").setPresence("u_exec", "away");
        teams.openThread("launch-v2", "th_launch_v2", "1.8s");
        teams.at("2.4s").receiveMessage({
          target: threadTarget("launch-v2", "th_launch_v2"),
          senderId: "u_ops",
          text: "Top-tier accounts saw the wrong annual price before the guardrail kicked in.",
          mentionedUserIds: ["u_me"],
        });
        teams.at("4.0s").receiveMessage({
          target: threadTarget("launch-v2", "th_launch_v2"),
          senderId: "u_sre",
          text: "I can flush edge nodes once legal signs off the correction line.",
        });
        teams.at("5.8s").pushNotification(
          "teams_ex_v2_nt_1",
          "Launch",
          "@you mentioned in #launch",
          180,
          { channelId: "launch-v2", threadId: "th_launch_v2" },
          "mention",
        );
        teams.at("6.6s").setDraft(
          threadTarget("launch-v2", "th_launch_v2"),
          "Hold public rollout. I need legal wording and customer count before resume.",
        );
        teams.at("7.8s").sendMessage({
          target: threadTarget("launch-v2", "th_launch_v2"),
          text: "Hold public rollout. I need legal wording and customer count before resume.",
          typed: true,
        });
        teams.openDm("dm_legal_ex_v2", "12.0s");
        teams.at("12.6s").receiveMessage({
          target: dmTarget("dm_legal_ex_v2"),
          senderId: "u_legal",
          text: "I can clear the copy in four minutes if finance confirms the final sentence.",
        });
        teams.at("14.0s").sendMessage({
          target: dmTarget("dm_legal_ex_v2"),
          text: "Use 'display issue contained before broad exposure'. Avoid 'pricing bug' in customer text.",
          typed: true,
        });
        teams.openThread("launch-v2", "th_customer_v2", "18.4s");
        teams.at("19.0s").receiveMessage({
          target: threadTarget("launch-v2", "th_customer_v2"),
          senderId: "u_sales",
          text: "Three affected accounts, all team annual plans.",
        });
        teams.at("20.8s").sendMessage({
          target: threadTarget("launch-v2", "th_customer_v2"),
          text: "Good. Draft outreach now but do not send until legal marks copy green.",
          typed: true,
        });
        teams.openDm("dm_exec_ex_v2", "25.2s");
        teams.at("25.8s").receiveMessage({
          target: dmTarget("dm_exec_ex_v2"),
          senderId: "u_exec",
          text: "Board asks in six. I need the clean sentence, not the real sentence.",
        });
        teams.at("27.2s").setDraft(
          dmTarget("dm_exec_ex_v2"),
          "We caught a pricing display issue before broad exposure and are validating the corrected customer wording now.",
        );
        teams.at("28.6s").sendMessage({
          target: dmTarget("dm_exec_ex_v2"),
          text: "We caught a pricing display issue before broad exposure and are validating the corrected customer wording now.",
          typed: true,
        });
        teams.at("32.4s").startCall({
          callId: "teams_ex_call_v2",
          participantIds: ["u_me", "u_ops", "u_sre", "u_legal"],
          scope: "thread",
          channelId: "launch-v2",
          threadId: "th_launch_v2",
          mode: "audio",
          title: "Rollback bridge",
        });
        teams.at("35.0s").updateCall({ callId: "teams_ex_call_v2", dominantSpeakerId: "u_legal" });
        teams.at("37.8s").endCall("teams_ex_call_v2");
        teams.openThread("launch-v2", "th_launch_v2", "40.0s");
        teams.at("40.6s").receiveMessage({
          target: threadTarget("launch-v2", "th_launch_v2"),
          senderId: "u_legal",
          text: "Customer wording is approved. Sales can send now.",
        });
        teams.at("42.2s").sendMessage({
          target: threadTarget("launch-v2", "th_launch_v2"),
          text: "Resume controlled rollout. Sales owns outreach. Posting exec update now.",
          typed: true,
        });
      })
      .camera((cam) => {
        cam.at("0s").focus("chat_list", { scale: 1.02, duration: "0.35s" });
        cam.at("1.9s").focus("thread_view", { scale: 1.08, duration: "0.35s" });
        cam.at("5.9s").focus("notification_banner", { scale: 1.08, duration: "0.35s" });
        cam.at("12.1s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("18.5s").focus("thread_view", { scale: 1.08, duration: "0.35s" });
        cam.at("25.3s").focus("dm_thread", { scale: 1.08, duration: "0.35s" });
        cam.at("32.5s").focus("call_surface", { scale: 1.08, duration: "0.35s" });
        cam.at("40.1s").focus("thread_view", { scale: 1.08, duration: "0.35s" });
      })
      .use(new KeyboardPlugin({ onlyForSentMessages: true, defaultCharDelay: 3 }))
      .use(new OSDirectorPlugin())
      .build(),
});
