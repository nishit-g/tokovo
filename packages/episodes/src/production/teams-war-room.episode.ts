import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { TeamsTrackBuilder } from "@tokovo/apps-teams";
import { AudioDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";

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
      .track(
        "app_teams",
        (getOrder) => new TeamsTrackBuilder(30, "phone", getOrder),
        (teams: TeamsTrackBuilder) => {
          teams.openChatList("0s");
          teams.switchChannel("launch", "1s", "thread_incident");

          teams.at("2s").channelPost({
            channelId: "launch",
            threadId: "thread_incident",
            senderId: "lead",
            senderName: "Priya",
            text: "Incident bridge open. Status updates every 2 minutes.",
            typed: true,
          });

          teams.at("5s").channelReply({
            channelId: "launch",
            threadId: "thread_incident",
            senderId: "sre",
            senderName: "Arjun",
            text: "Rollback initiated, waiting on health checks.",
          });

          teams.at("8s").setPresence("lead", "busy");
          teams.at("9s").notify("n1", "@you mentioned in #launch", 150);

          teams.at("11s").dmReceive({
            dmId: "dm_finance",
            fromId: "finance",
            fromName: "Finance",
            text: "Need customer impact estimate in 5 mins.",
          });

          teams.at("14s").startCall({
            callId: "call_war_room",
            participantIds: ["lead", "sre", "pm"],
            scope: "channel",
            channelId: "launch",
          });

          teams.at("20s").endCall("call_war_room");
          teams.switchDm("dm_finance", "22s");

          teams.at("24s").dmSend({
            dmId: "dm_finance",
            senderId: "me",
            senderName: "You",
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
