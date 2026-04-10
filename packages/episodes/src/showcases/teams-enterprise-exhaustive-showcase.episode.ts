import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { TeamsTrackBuilder } from "@tokovo/apps-teams";

const dmTarget = (dmId: string) => ({ kind: "dm" as const, dmId });
const threadTarget = (channelId: string, threadId: string) => ({
  kind: "thread" as const,
  channelId,
  threadId,
});

type TeamsTrackBuilderInstance = InstanceType<typeof TeamsTrackBuilder>;

const users = [
  { id: "u_me", displayName: "Nishit", role: "Incident commander" },
  { id: "u_pm", displayName: "Priya", role: "Product lead" },
  { id: "u_sre", displayName: "Arjun", role: "SRE" },
  { id: "u_design", displayName: "Rhea", role: "Design" },
  { id: "u_backend", displayName: "Maya", role: "Backend" },
  { id: "u_exec", displayName: "Rohan (Exec)", role: "Executive" },
  { id: "u_ci", displayName: "CI Bot", role: "Automation" },
  { id: "u_comms", displayName: "Ananya", role: "Comms" },
];

const channels = [
  {
    id: "launch-war-room",
    name: "launch-war-room",
    memberIds: ["u_me", "u_pm", "u_sre", "u_backend", "u_exec"],
    description: "Critical launch coordination",
  },
  {
    id: "eng-alerts",
    name: "eng-alerts",
    memberIds: ["u_me", "u_sre", "u_backend", "u_ci"],
    description: "Engineering alerts and blockers",
  },
  {
    id: "customer-comms",
    name: "customer-comms",
    memberIds: ["u_me", "u_comms", "u_pm"],
    description: "Customer messaging and status updates",
  },
  {
    id: "postmortems",
    name: "postmortems",
    memberIds: ["u_me", "u_sre", "u_backend", "u_pm"],
    description: "Incident follow-ups and RCAs",
  },
];

const threads = [
  {
    id: "th_release_blocker",
    channelId: "launch-war-room",
    title: "Release blocker",
    participantIds: ["u_me", "u_pm", "u_sre", "u_backend", "u_exec"],
  },
  {
    id: "th_db_timeout",
    channelId: "launch-war-room",
    title: "DB timeout spikes",
    participantIds: ["u_sre", "u_backend", "u_me"],
  },
  {
    id: "th_ci_failures",
    channelId: "eng-alerts",
    title: "CI failures",
    participantIds: ["u_ci", "u_me", "u_backend"],
  },
  {
    id: "th_status_page",
    channelId: "customer-comms",
    title: "Status page updates",
    participantIds: ["u_me", "u_comms", "u_pm"],
  },
  {
    id: "th_inc_2026_02_24",
    channelId: "postmortems",
    title: "Incident 2026-02-24 RCA",
    participantIds: ["u_me", "u_sre", "u_backend", "u_pm"],
  },
];

const dms = [
  { id: "dm_exec", participantIds: ["u_me", "u_exec"] },
  { id: "dm_sre", participantIds: ["u_me", "u_sre"] },
  { id: "dm_design", participantIds: ["u_me", "u_design"] },
];

export default defineEpisode({
  meta: {
    id: "teams-enterprise-exhaustive-showcase",
    title: "Teams Enterprise Exhaustive Showcase",
    description:
      "End-to-end Teams enterprise flow: channel ops, threads, mentions, presence, notifications, DM escalation, and call lifecycle.",
    category: "showcase",
    tags: [
      "teams",
      "enterprise",
      "dm",
      "channels",
      "threads",
      "mentions",
      "presence",
      "calls",
      "notifications",
      "deterministic",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2700,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-enterprise-exhaustive-showcase", {
      fps: 30,
      duration: "90s",
      title: "Teams Enterprise Exhaustive Showcase",
      description: "Large deterministic Teams stress run for visual + runtime validation.",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        os: {
          time: new Date("2026-02-24T09:15:00"),
          battery: 84,
          network: "5G",
        },
      })
      .snapshot("app_teams", "phone", {
        users,
        channels: channels.map((channel) => ({
          ...channel,
          threadIds: [],
          unreadCount: 0,
          mentionCount: 0,
        })),
        threads: threads.map((thread) => ({
          ...thread,
          messageIds: [],
          unreadCount: 0,
          mentionCount: 0,
          replyCount: 0,
          typingUserIds: [],
          state: "open" as const,
        })),
        dms: dms.map((dm) => ({
          ...dm,
          messageIds: [],
          unreadCount: 0,
          mentionCount: 0,
        })),
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .track(
        "app_teams",
        (getOrder) => new TeamsTrackBuilder(30, "phone", getOrder),
        (teams: TeamsTrackBuilderInstance) => {
          teams.openChatList("0s");

          teams.at("0.5s").setPresence("u_me", "available");
          teams.at("0.7s").setPresence("u_pm", "busy");
          teams.at("0.9s").setPresence("u_sre", "available");
          teams.at("1.1s").setPresence("u_design", "away");

          teams.openThread("launch-war-room", "th_release_blocker", "1.5s");
          teams.at("2.0s").receiveMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            senderId: "u_pm",
            text: "War room open. We ship only after green checks on API + payments + notifications.",
            mentionedUserIds: ["u_me"],
          });
          teams.at("3.8s").startTyping(threadTarget("launch-war-room", "th_release_blocker"), "u_me");
          teams.at("4.0s").receiveMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            senderId: "u_sre",
            text: "API p95 is elevated. Starting rollback canary on cluster-b.",
          });
          teams.at("4.5s").setDraft(
            threadTarget("launch-war-room", "th_release_blocker"),
            "I am on incident timeline + customer blast draft.",
          );
          teams.at("5.0s").sendMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            text: "I am on incident timeline + customer blast draft.",
            typed: true,
          });
          teams.at("5.1s").endTyping(threadTarget("launch-war-room", "th_release_blocker"), "u_me");
          teams.at("6.3s").pushNotification(
            "n_launch_1",
            "War room mention",
            "@you mentioned in #launch-war-room",
            180,
            { channelId: "launch-war-room", threadId: "th_release_blocker" },
            "mention",
          );

          teams.openThread("launch-war-room", "th_db_timeout", "7.5s");
          teams.at("8.0s").receiveMessage({
            target: threadTarget("launch-war-room", "th_db_timeout"),
            senderId: "u_sre",
            text: "DB timeout spikes isolated to write-heavy endpoints.",
          });
          teams.at("8.7s").startTyping(threadTarget("launch-war-room", "th_db_timeout"), "u_backend");
          teams.at("9.5s").receiveMessage({
            target: threadTarget("launch-war-room", "th_db_timeout"),
            senderId: "u_backend",
            text: "Applying query plan pin + index hint now.",
          });
          teams.at("9.6s").endTyping(threadTarget("launch-war-room", "th_db_timeout"), "u_backend");

          teams.openDm("dm_exec", "12.0s");
          teams.at("12.5s").receiveMessage({
            target: dmTarget("dm_exec"),
            senderId: "u_exec",
            text: "Need customer impact estimate in 10 minutes.",
          });
          teams.at("13.2s").startTyping(dmTarget("dm_exec"), "u_me");
          teams.at("14.0s").sendMessage({
            target: dmTarget("dm_exec"),
            text: "Initial estimate: 8-12% API degradation, no data loss observed.",
            typed: true,
          });
          teams.at("14.1s").endTyping(dmTarget("dm_exec"), "u_me");
          teams.at("15.0s").receiveMessage({
            target: dmTarget("dm_exec"),
            senderId: "u_exec",
            text: "Proceed with controlled rollback and send 30-min updates.",
          });

          teams.openThread("launch-war-room", "th_release_blocker", "16.5s");
          teams.at("17.0s").sendMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            text: "Exec approved controlled rollback. 30-min comms cadence starts now.",
            typed: true,
          });
          teams.at("18.5s").pushNotification(
            "n_launch_2",
            "Rollback approved",
            "Update thread pinned for the war room.",
            180,
            { channelId: "launch-war-room", threadId: "th_release_blocker" },
            "system",
          );

          teams.at("19.0s").startCall({
            callId: "call_war_room_01",
            participantIds: ["u_me", "u_pm", "u_sre", "u_backend"],
            scope: "thread",
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            mode: "audio",
            title: "Rollback coordination",
          });
          teams.at("20.0s").setPresence("u_me", "busy");
          teams.at("20.2s").setPresence("u_sre", "busy");
          teams.at("21.0s").updateCall({
            callId: "call_war_room_01",
            dominantSpeakerId: "u_sre",
          });
          teams.at("23.0s").endCall("call_war_room_01");

          teams.openThread("eng-alerts", "th_ci_failures", "24.0s");
          teams.at("24.5s").receiveMessage({
            target: threadTarget("eng-alerts", "th_ci_failures"),
            senderId: "u_ci",
            text: "Pipeline red: packages/compiler regression test failed.",
            mentionedUserIds: ["u_me"],
          });
          teams.at("25.3s").sendMessage({
            target: threadTarget("eng-alerts", "th_ci_failures"),
            text: "Treat as blocker for hotfix merge; attach logs and bisect commit.",
            typed: true,
          });
          teams.at("26.2s").pushNotification(
            "n_ci_1",
            "CI blocker",
            "Blocking issue posted in #eng-alerts",
            150,
            { channelId: "eng-alerts", threadId: "th_ci_failures" },
            "message",
          );

          teams.openDm("dm_sre", "27.5s");
          teams.at("28.0s").receiveMessage({
            target: dmTarget("dm_sre"),
            senderId: "u_sre",
            text: "Canary looks healthy for 6 minutes. Error rate down 70%.",
          });
          teams.at("29.0s").sendMessage({
            target: dmTarget("dm_sre"),
            text: "Great. Hold 10 min soak then notify war room for phased traffic restore.",
            typed: true,
          });

          teams.openThread("launch-war-room", "th_release_blocker", "31.0s");
          teams.at("31.5s").receiveMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            senderId: "u_sre",
            text: "Canary stable. Starting phased restore: 25% -> 50% -> 100%.",
          });
          teams.at("33.0s").receiveMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            senderId: "u_pm",
            text: "Customer comms draft published in status channel.",
          });
          teams.at("34.0s").pushNotification(
            "n_launch_3",
            "Traffic restore",
            "Traffic restore in progress.",
            150,
            { channelId: "launch-war-room", threadId: "th_release_blocker" },
            "system",
          );

          teams.openThread("customer-comms", "th_status_page", "35.0s");
          teams.at("35.3s").receiveMessage({
            target: threadTarget("customer-comms", "th_status_page"),
            senderId: "u_comms",
            text: "Status page updated: elevated latency under mitigation.",
          });
          teams.at("36.8s").sendMessage({
            target: threadTarget("customer-comms", "th_status_page"),
            text: "Include next update at T+30 with rollback outcome.",
          });

          teams.openDm("dm_exec", "38.5s");
          teams.at("39.0s").sendMessage({
            target: dmTarget("dm_exec"),
            text: "Canary healthy, phased restore underway. Next executive update in 15 min.",
            typed: true,
          });

          teams.openThread("launch-war-room", "th_release_blocker", "41.0s");
          teams.at("41.3s").startCall({
            callId: "call_war_room_02",
            participantIds: ["u_me", "u_pm", "u_sre", "u_backend", "u_exec"],
            scope: "thread",
            channelId: "launch-war-room",
            threadId: "th_release_blocker",
            mode: "video",
            title: "Executive update sync",
          });
          teams.at("42.0s").setPresence("u_exec", "busy");
          teams.at("43.0s").updateCall({
            callId: "call_war_room_02",
            dominantSpeakerId: "u_exec",
          });
          teams.at("45.5s").endCall("call_war_room_02");

          teams.at("46.2s").receiveMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            senderId: "u_backend",
            text: "All clusters green. Latency back to baseline.",
          });
          teams.at("47.0s").sendMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            text: "Declaring incident mitigated. Preparing RCA timeline and follow-ups.",
            typed: true,
          });

          teams.openThread("postmortems", "th_inc_2026_02_24", "49.0s");
          teams.at("49.5s").sendMessage({
            target: threadTarget("postmortems", "th_inc_2026_02_24"),
            text: "RCA thread started. Contribute facts only, no assumptions.",
            typed: true,
          });
          teams.at("50.8s").receiveMessage({
            target: threadTarget("postmortems", "th_inc_2026_02_24"),
            senderId: "u_sre",
            text: "Primary trigger: config drift in traffic policy rollout.",
          });
          teams.at("52.0s").receiveMessage({
            target: threadTarget("postmortems", "th_inc_2026_02_24"),
            senderId: "u_backend",
            text: "Contributing factor: missing query plan guard in staging parity test.",
          });
          teams.at("53.0s").pushNotification(
            "n_pm_1",
            "Postmortem",
            "Postmortem thread started.",
            180,
            { channelId: "postmortems", threadId: "th_inc_2026_02_24" },
            "system",
          );

          teams.openDm("dm_design", "54.5s");
          teams.at("55.0s").receiveMessage({
            target: dmTarget("dm_design"),
            senderId: "u_design",
            text: "Do we delay the launch banner experiment?",
          });
          teams.at("56.0s").sendMessage({
            target: dmTarget("dm_design"),
            text: "Yes, defer by 24h. We keep blast radius low after incident.",
            typed: true,
          });

          teams.openThread("launch-war-room", "th_release_blocker", "58.0s");
          teams.at("58.2s").receiveMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            senderId: "u_pm",
            text: "Final status: stable for 20m, customer impact resolved.",
          });
          teams.at("59.0s").sendMessage({
            target: threadTarget("launch-war-room", "th_release_blocker"),
            text: "Closing war room. Follow-up in #postmortems and #eng-alerts.",
            typed: true,
          });

          teams.at("60.0s").setPresence("u_me", "available");
          teams.at("60.2s").setPresence("u_pm", "available");
          teams.at("60.4s").setPresence("u_sre", "away");
          teams.at("60.6s").setPresence("u_exec", "available");

          teams.openThread("eng-alerts", "th_ci_failures", "62.0s");
          teams.at("62.5s").receiveMessage({
            target: threadTarget("eng-alerts", "th_ci_failures"),
            senderId: "u_ci",
            text: "Pipeline green after fix. All required checks passed.",
          });
          teams.at("63.5s").pushNotification(
            "n_ci_2",
            "CI recovered",
            "Release gates are green again.",
            180,
            { channelId: "eng-alerts", threadId: "th_ci_failures" },
            "message",
          );

          teams.openDm("dm_exec", "65.0s");
          teams.at("65.3s").sendMessage({
            target: dmTarget("dm_exec"),
            text: "Incident resolved. Sending full summary + action items before EOD.",
            typed: true,
          });
          teams.at("66.5s").receiveMessage({
            target: dmTarget("dm_exec"),
            senderId: "u_exec",
            text: "Good containment. Prioritize prevention over velocity this week.",
          });

          teams.openChatList("68.0s");
          teams.openThread("postmortems", "th_inc_2026_02_24", "70.0s");
          teams.at("70.5s").sendMessage({
            target: threadTarget("postmortems", "th_inc_2026_02_24"),
            text: "Action items assigned with owners + deadlines. Tracking starts now.",
            typed: true,
          });
          teams.at("72.0s").pushNotification(
            "n_rca_1",
            "RCA ready",
            "Action items assigned across the postmortem thread.",
            150,
            { channelId: "postmortems", threadId: "th_inc_2026_02_24" },
            "system",
          );

          teams.openChatList("74.0s");
          teams.openDm("dm_sre", "76.0s");
          teams.at("76.5s").sendMessage({
            target: dmTarget("dm_sre"),
            text: "Thanks for sharp execution today. Log learnings while fresh.",
            typed: true,
          });
          teams.at("78.0s").receiveMessage({
            target: dmTarget("dm_sre"),
            senderId: "u_sre",
            text: "Will do. Drafting guardrail proposal now.",
          });

          teams.openChatList("80.0s");
          teams.at("82.0s").pushNotification(
            "n_wrap",
            "Validation complete",
            "Showcase complete: enterprise workflow validated.",
            180,
            undefined,
            "system",
          );
          teams.openChatList("88.0s");
        },
      )
      .build(),
});
