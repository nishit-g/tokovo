import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { TeamsTrackBuilder } from "@tokovo/apps-teams";
import { AudioDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";

type TeamsTrackBuilderInstance = InstanceType<typeof TeamsTrackBuilder>;

const dmTarget = (dmId: string) => ({ kind: "dm" as const, dmId });
const threadTarget = (channelId: string, threadId: string) => ({
  kind: "thread" as const,
  channelId,
  threadId,
});

const users = [
  { id: "u_me", displayName: "You", role: "Incident lead" },
  { id: "lead", displayName: "Priya", role: "Launch lead" },
  { id: "sre", displayName: "Arjun", role: "SRE" },
  { id: "pm", displayName: "Maya", role: "Product" },
  { id: "finance", displayName: "Finance", role: "Executive ops" },
];

export default defineEpisode({
  meta: {
    id: "teams-war-room",
    title: "Teams War Room: Launch Day",
    description: "A channel + thread + call flow inside Microsoft Teams during a launch incident.",
    category: "production",
    tags: ["teams", "workplace", "channel", "call"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-war-room", {
      fps: 30,
      duration: "40s",
      title: "Teams War Room: Launch Day",
      description: "A deterministic Teams collaboration flow under pressure.",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
      })
      .snapshot("app_teams", "phone", {
        users,
        channels: [
          {
            id: "launch",
            name: "launch",
            memberIds: ["u_me", "lead", "sre", "pm"],
            description: "Launch coordination",
            threadIds: [],
            unreadCount: 0,
            mentionCount: 0,
          },
        ],
        threads: [
          {
            id: "thread_incident",
            channelId: "launch",
            title: "Release blocker",
            participantIds: ["u_me", "lead", "sre", "pm"],
            messageIds: [],
            unreadCount: 0,
            mentionCount: 0,
            replyCount: 0,
            typingUserIds: [],
            state: "open",
          },
        ],
        dms: [
          {
            id: "dm_finance",
            participantIds: ["u_me", "finance"],
            messageIds: [],
            unreadCount: 0,
            mentionCount: 0,
          },
        ],
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .track(
        "app_teams",
        (getOrder) => new TeamsTrackBuilder(30, "phone", getOrder),
        (teams: TeamsTrackBuilderInstance) => {
          teams.openChatList("0s");
          teams.openThread("launch", "thread_incident", "1s");

          teams.at("2s").receiveMessage({
            target: threadTarget("launch", "thread_incident"),
            senderId: "lead",
            text: "Incident bridge open. Status updates every 2 minutes.",
            mentionedUserIds: ["u_me"],
          });

          teams.at("5s").receiveMessage({
            target: threadTarget("launch", "thread_incident"),
            senderId: "sre",
            text: "Rollback initiated, waiting on health checks.",
          });

          teams.at("7.2s").setDraft(
            threadTarget("launch", "thread_incident"),
            "Impact copy ready. Waiting for latest health read.",
          );
          teams.at("8s").setPresence("lead", "busy");
          teams.at("9s").pushNotification(
            "n1",
            "Launch war room",
            "@you mentioned in #launch",
            150,
            { channelId: "launch", threadId: "thread_incident" },
            "mention",
          );

          teams.at("11s").receiveMessage({
            target: dmTarget("dm_finance"),
            senderId: "finance",
            text: "Need customer impact estimate in 5 mins.",
          });

          teams.at("12s").startTyping(dmTarget("dm_finance"), "u_me");
          teams.at("13.5s").endTyping(dmTarget("dm_finance"), "u_me");
          teams.at("14s").startCall({
            callId: "call_war_room",
            participantIds: ["lead", "sre", "pm", "u_me"],
            scope: "thread",
            channelId: "launch",
            threadId: "thread_incident",
            mode: "audio",
            title: "Launch incident bridge",
          });

          teams.at("20s").endCall("call_war_room");
          teams.openDm("dm_finance", "22s");

          teams.at("24s").sendMessage({
            target: dmTarget("dm_finance"),
            text: "Impact is contained. Draft report in 10 minutes.",
            typed: true,
          });

          teams.openChatList("30s");
        },
      )
      .use(new AudioDirectorPlugin({ mood: "focus", volume: 0.1 }))
      .use(new OSDirectorPlugin())
      .use(new KeyboardPlugin())
      .build(),
});
