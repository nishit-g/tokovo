import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { TeamsTrackBuilder } from "@tokovo/apps-teams";
import {
  AudioDirectorPlugin,
  KeyboardPlugin,
  OSDirectorPlugin,
} from "@tokovo/compiler";

type TeamsTrackBuilderInstance = InstanceType<typeof TeamsTrackBuilder>;

const dmTarget = (dmId: string) => ({ kind: "dm" as const, dmId });
const threadTarget = (channelId: string, threadId: string) => ({
  kind: "thread" as const,
  channelId,
  threadId,
});

const users = [
  { id: "u_me", displayName: "Nishit", role: "Incident commander" },
  { id: "u_ops", displayName: "Priya", role: "Launch operations" },
  { id: "u_sre", displayName: "Arjun", role: "SRE lead" },
  { id: "u_legal", displayName: "Neha", role: "Legal" },
  { id: "u_exec", displayName: "Rohan", role: "Chief of staff" },
  { id: "u_sales", displayName: "Mira", role: "Sales" },
];

export default defineEpisode({
  meta: {
    id: "teams-exec-escalation",
    title: "Teams Executive Escalation",
    description:
      "A production-grade Teams flow with a sharper escalation script across chat, channels, thread work, and executive DM follow-up.",
    category: "production",
    tags: ["teams", "enterprise", "incident", "dm", "channels", "scripted"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1680,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-exec-escalation", {
      fps: 30,
      duration: "56s",
      title: "Teams Executive Escalation",
      description: "High-pressure launch escalation with a stronger enterprise script.",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        os: {
          time: new Date("2026-04-10T10:42:00"),
          battery: 81,
          network: "5G",
        },
      })
      .snapshot("app_teams", "phone", {
        users,
        channels: [
          {
            id: "launch-ops",
            name: "launch-ops",
            memberIds: ["u_me", "u_ops", "u_sre", "u_legal", "u_sales"],
            description: "Go-live execution and customer blockers",
            threadIds: [],
            unreadCount: 0,
            mentionCount: 0,
          },
          {
            id: "exec-briefing",
            name: "exec-briefing",
            memberIds: ["u_me", "u_exec", "u_ops"],
            description: "Executive updates only",
            threadIds: [],
            unreadCount: 0,
            mentionCount: 0,
          },
        ],
        threads: [
          {
            id: "th_pricing_mismatch",
            channelId: "launch-ops",
            title: "Pricing mismatch on enterprise checkout",
            participantIds: ["u_me", "u_ops", "u_sre", "u_legal", "u_sales"],
            messageIds: [],
            unreadCount: 0,
            mentionCount: 0,
            replyCount: 0,
            typingUserIds: [],
            state: "open",
          },
          {
            id: "th_board_update",
            channelId: "exec-briefing",
            title: "Board update at 11:00",
            participantIds: ["u_me", "u_exec", "u_ops"],
            messageIds: [],
            unreadCount: 0,
            mentionCount: 0,
            replyCount: 0,
            typingUserIds: [],
            state: "open",
          },
        ],
        dms: [
          { id: "dm_exec", participantIds: ["u_me", "u_exec"], messageIds: [], unreadCount: 0, mentionCount: 0 },
          { id: "dm_legal", participantIds: ["u_me", "u_legal"], messageIds: [], unreadCount: 0, mentionCount: 0 },
        ],
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .track(
        "app_teams",
        (getOrder) => new TeamsTrackBuilder(30, "phone", getOrder),
        (teams: TeamsTrackBuilderInstance) => {
          teams.openChatList("0s");
          teams.at("0.4s").setPresence("u_me", "available");
          teams.at("0.6s").setPresence("u_ops", "busy");
          teams.at("0.8s").setPresence("u_sre", "available");
          teams.at("1.0s").setPresence("u_exec", "away");

          teams.openThread("launch-ops", "th_pricing_mismatch", "1.6s");
          teams.at("2.1s").receiveMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            senderId: "u_ops",
            text: "Pausing launch. Enterprise checkout is showing the pre-discount annual price.",
            mentionedUserIds: ["u_me"],
          });
          teams.at("3.8s").receiveMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            senderId: "u_sales",
            text: "Three strategic accounts saw it. One of them screenshotted the invoice screen.",
          });
          teams.at("5.0s").receiveMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            senderId: "u_sre",
            text: "Issue isolated to cached pricing JSON. I can flush edge nodes, but legal needs to bless the corrected wording first.",
          });
          teams.at("6.2s").pushNotification(
            "teams_exec_escalation_mention",
            "Launch ops",
            "@you mentioned in #launch-ops",
            180,
            { channelId: "launch-ops", threadId: "th_pricing_mismatch" },
            "mention",
          );
          teams.at("7.0s").setDraft(
            threadTarget("launch-ops", "th_pricing_mismatch"),
            "Hold public rollout. Give me exact customer count and corrected invoice text.",
          );
          teams.at("8.0s").sendMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            text: "Hold public rollout. Give me exact customer count and corrected invoice text.",
            typed: true,
          });

          teams.openDm("dm_legal", "11s");
          teams.at("11.4s").receiveMessage({
            target: dmTarget("dm_legal"),
            senderId: "u_legal",
            text: "I can clear the fix in 4 minutes if finance confirms the revised annual copy is final.",
          });
          teams.at("12.6s").sendMessage({
            target: dmTarget("dm_legal"),
            text: "Approved path is cache flush + updated copy. I need your explicit yes/no for customer-visible wording.",
            typed: true,
          });

          teams.openDm("dm_exec", "16s");
          teams.at("16.4s").receiveMessage({
            target: dmTarget("dm_exec"),
            senderId: "u_exec",
            text: "CEO is walking into the board update in 7 minutes. Are we still saying launch by noon?",
          });
          teams.at("17.6s").sendMessage({
            target: dmTarget("dm_exec"),
            text: "Not yet. Pricing discrepancy is contained, but I am holding until corrected invoices are legally cleared.",
            typed: true,
          });
          teams.at("19.2s").receiveMessage({
            target: dmTarget("dm_exec"),
            senderId: "u_exec",
            text: "Understood. Give me a board-safe sentence, not an engineer sentence.",
          });
          teams.at("20.3s").setDraft(
            dmTarget("dm_exec"),
            "We found an invoice display issue before broad exposure and are validating the corrected customer copy now.",
          );

          teams.openThread("exec-briefing", "th_board_update", "23s");
          teams.at("23.5s").sendMessage({
            target: threadTarget("exec-briefing", "th_board_update"),
            text: "Board line: We caught a pricing display issue before broad exposure and are validating the corrected customer copy now.",
            typed: true,
          });
          teams.at("25.0s").receiveMessage({
            target: threadTarget("exec-briefing", "th_board_update"),
            senderId: "u_exec",
            text: "Good. Add a timing range and who owns customer outreach.",
          });

          teams.at("27s").startCall({
            callId: "call_exec_bridge",
            participantIds: ["u_me", "u_ops", "u_sre", "u_legal"],
            scope: "thread",
            channelId: "launch-ops",
            threadId: "th_pricing_mismatch",
            mode: "audio",
            title: "Pricing rollback bridge",
          });
          teams.at("29s").updateCall({
            callId: "call_exec_bridge",
            dominantSpeakerId: "u_legal",
          });
          teams.at("31.5s").endCall("call_exec_bridge");

          teams.openThread("launch-ops", "th_pricing_mismatch", "33s");
          teams.at("33.4s").receiveMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            senderId: "u_legal",
            text: "Copy approved. Customer-facing wording is clear and defensible.",
          });
          teams.at("34.6s").receiveMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            senderId: "u_sre",
            text: "Edge flush complete. Corrected price is live across all sampled regions.",
          });
          teams.at("36.0s").sendMessage({
            target: threadTarget("launch-ops", "th_pricing_mismatch"),
            text: "Resume controlled rollout. Sales owns affected-account outreach; I will post the board update now.",
            typed: true,
          });

          teams.openDm("dm_exec", "40s");
          teams.at("40.5s").sendMessage({
            target: dmTarget("dm_exec"),
            text: "Board-safe update: issue contained, customer copy cleared, rollout resuming in controlled phases now.",
            typed: true,
          });
          teams.at("42.2s").receiveMessage({
            target: dmTarget("dm_exec"),
            senderId: "u_exec",
            text: "That is exactly the sentence I needed.",
          });

          teams.openChatList("47s");
        },
      )
      .use(new AudioDirectorPlugin({ mood: "tense", volume: 0.08 }))
      .use(new OSDirectorPlugin())
      .use(new KeyboardPlugin({ onlyForSentMessages: true, defaultCharDelay: 3 }))
      .build(),
});
