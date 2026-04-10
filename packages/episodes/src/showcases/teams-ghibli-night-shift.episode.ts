import { defineEpisode } from "../types/episode-definition.js";
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
  { id: "u_me", displayName: "Nishit", role: "Night shift director" },
  { id: "u_aki", displayName: "Aki", role: "Animation lead" },
  { id: "u_ren", displayName: "Ren", role: "Compositing" },
  { id: "u_mina", displayName: "Mina", role: "Producer" },
  { id: "u_haru", displayName: "Haru", role: "Music" },
];

export default defineEpisode({
  meta: {
    id: "teams-ghibli-night-shift",
    title: "Teams Ghibli Night Shift",
    description:
      "A soft, cinematic Teams showcase using the Ghibli theme while still feeling like a real production collaboration app.",
    category: "showcase",
    tags: ["teams", "ghibli", "theme", "showcase", "channels", "threads"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1620,
    apps: ["app_teams"],
  },
  build: () =>
    episode("teams-ghibli-night-shift", {
      fps: 30,
      duration: "54s",
      title: "Teams Ghibli Night Shift",
      description: "Studio Ghibli-inspired Teams collaboration with a stronger scripted beat flow.",
    })
      .device("phone", "iphone16", {
        app: "app_teams",
        theme: "teams-ghibli",
        os: {
          time: new Date("2026-04-10T23:12:00"),
          battery: 68,
          network: "4G",
        },
      })
      .snapshot("app_teams", "phone", {
        users,
        channels: [
          {
            id: "moonlit-cut",
            name: "moonlit-cut",
            memberIds: ["u_me", "u_aki", "u_ren", "u_mina"],
            description: "Final picture lock for the festival reel",
            threadIds: [],
            unreadCount: 0,
            mentionCount: 0,
          },
          {
            id: "score-room",
            name: "score-room",
            memberIds: ["u_me", "u_haru", "u_mina"],
            description: "Music and timing notes",
            threadIds: [],
            unreadCount: 0,
            mentionCount: 0,
          },
        ],
        threads: [
          {
            id: "th_bridge_scene",
            channelId: "moonlit-cut",
            title: "Lantern bridge sequence",
            participantIds: ["u_me", "u_aki", "u_ren", "u_mina"],
            messageIds: [],
            unreadCount: 0,
            mentionCount: 0,
            replyCount: 0,
            typingUserIds: [],
            state: "open",
          },
          {
            id: "th_dawn_export",
            channelId: "score-room",
            title: "Festival dawn export",
            participantIds: ["u_me", "u_haru", "u_mina"],
            messageIds: [],
            unreadCount: 0,
            mentionCount: 0,
            replyCount: 0,
            typingUserIds: [],
            state: "open",
          },
        ],
        dms: [{ id: "dm_mina", participantIds: ["u_me", "u_mina"], messageIds: [], unreadCount: 0, mentionCount: 0 }],
      })
      .view("app_teams", "phone", { screen: "chat_list" })
      .track(
        "app_teams",
        (getOrder) => new TeamsTrackBuilder(30, "phone", getOrder),
        (teams: TeamsTrackBuilderInstance) => {
          teams.openChatList("0s");
          teams.at("0.5s").setPresence("u_aki", "available");
          teams.at("0.7s").setPresence("u_ren", "away");
          teams.at("0.9s").setPresence("u_mina", "busy");

          teams.openThread("moonlit-cut", "th_bridge_scene", "1.5s");
          teams.at("2.0s").receiveMessage({
            target: threadTarget("moonlit-cut", "th_bridge_scene"),
            senderId: "u_aki",
            text: "Lantern pass is drifting two frames behind the bridge reflection.",
            mentionedUserIds: ["u_me"],
          });
          teams.at("3.7s").receiveMessage({
            target: threadTarget("moonlit-cut", "th_bridge_scene"),
            senderId: "u_ren",
            text: "I can fix it if we keep the mist layer soft. If we sharpen it, the scene loses the dream.",
          });
          teams.at("5.1s").setDraft(
            threadTarget("moonlit-cut", "th_bridge_scene"),
            "Keep the mist. Shift the lantern timing instead of forcing the glow.",
          );
          teams.at("6.0s").sendMessage({
            target: threadTarget("moonlit-cut", "th_bridge_scene"),
            text: "Keep the mist. Shift the lantern timing instead of forcing the glow.",
            typed: true,
          });
          teams.at("7.3s").pushNotification(
            "teams_ghibli_ping",
            "Moonlit cut",
            "@you mentioned in #moonlit-cut",
            180,
            { channelId: "moonlit-cut", threadId: "th_bridge_scene" },
            "mention",
          );

          teams.openDm("dm_mina", "10s");
          teams.at("10.5s").receiveMessage({
            target: dmTarget("dm_mina"),
            senderId: "u_mina",
            text: "Festival courier leaves at dawn. Tell me if this is magic late or disaster late.",
          });
          teams.at("11.8s").sendMessage({
            target: dmTarget("dm_mina"),
            text: "Magic late. Picture is holding; we are protecting the scene instead of flattening it.",
            typed: true,
          });
          teams.at("13.4s").receiveMessage({
            target: dmTarget("dm_mina"),
            senderId: "u_mina",
            text: "Good. I can defend artful delay. I cannot defend panic.",
          });

          teams.openThread("score-room", "th_dawn_export", "16s");
          teams.at("16.5s").receiveMessage({
            target: threadTarget("score-room", "th_dawn_export"),
            senderId: "u_haru",
            text: "If the bridge scene breathes longer, I want one extra cello swell before the cut to dawn.",
          });
          teams.at("18.0s").sendMessage({
            target: threadTarget("score-room", "th_dawn_export"),
            text: "Take the extra swell. We will earn it by slowing the lantern reveal.",
            typed: true,
          });

          teams.at("20.5s").startCall({
            callId: "call_moonlit_review",
            participantIds: ["u_me", "u_aki", "u_ren"],
            scope: "thread",
            channelId: "moonlit-cut",
            threadId: "th_bridge_scene",
            mode: "video",
            title: "Moonlit scene review",
          });
          teams.at("22.0s").updateCall({
            callId: "call_moonlit_review",
            dominantSpeakerId: "u_aki",
          });
          teams.at("25.0s").endCall("call_moonlit_review");

          teams.openThread("moonlit-cut", "th_bridge_scene", "27s");
          teams.at("27.4s").receiveMessage({
            target: threadTarget("moonlit-cut", "th_bridge_scene"),
            senderId: "u_aki",
            text: "Review done. Lanterns arrive on beat now, and the bridge still feels like it is listening.",
          });
          teams.at("29.0s").receiveMessage({
            target: threadTarget("moonlit-cut", "th_bridge_scene"),
            senderId: "u_ren",
            text: "Exporting the new pass. It looks quieter, which means it finally feels alive.",
          });
          teams.at("31.0s").sendMessage({
            target: threadTarget("moonlit-cut", "th_bridge_scene"),
            text: "Lock this version. Then post one still frame for Mina so she stops imagining catastrophe.",
            typed: true,
          });

          teams.openDm("dm_mina", "35s");
          teams.at("35.5s").sendMessage({
            target: dmTarget("dm_mina"),
            text: "Scene is locked. Dawn export is back on rhythm, and the film still has its breath.",
            typed: true,
          });
          teams.at("37.2s").receiveMessage({
            target: dmTarget("dm_mina"),
            senderId: "u_mina",
            text: "Perfect. That is the kind of sentence tired artists can walk toward.",
          });

          teams.openChatList("42s");
        },
      )
      .use(new AudioDirectorPlugin({ mood: "soft", volume: 0.08 }))
      .use(new OSDirectorPlugin())
      .use(new KeyboardPlugin({ onlyForSentMessages: true, defaultCharDelay: 3 }))
      .build(),
});
