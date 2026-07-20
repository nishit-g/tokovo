import { KeyboardPlugin } from "@tokovo/compiler";
import { defineEpisode } from "../types/episode-definition.js";
import { actor, cast, episode } from "../code-first-episode.js";

const people = cast({
  me: actor("me", { name: "Me" }),
  mom: actor("mom", { name: "Mom", identities: { whatsapp: { name: "Mom" } } }),
  dad: actor("dad", { name: "Dad", identities: { whatsapp: { name: "Dad" } } }),
  riya: actor("riya", {
    name: "Riya",
    avatar: "/avatars/avatar-ava.jpg",
    identities: { whatsapp: { name: "Riya" } },
  }),
});

export default defineEpisode({
  meta: {
    id: "whatsapp-story-v2",
    title: "WhatsApp Story V2",
    description:
      "A new WhatsApp story where a surprise dinner plan collapses across the family group and the secret DM at the same time.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 100,
    tags: ["story", "whatsapp", "family", "dm", "comedy"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1230,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("whatsapp-story-v2", {
      fps: 30,
      duration: "41s",
      title: "WhatsApp Story V2",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        installedApps: ["app_whatsapp"],
        os: {
          time: new Date("2026-04-10T19:20:00Z"),
          battery: 62,
          network: "5G",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          {
            id: "dm_riya_story_v2",
            name: "Riya",
            avatar: "/avatars/avatar-ava.jpg",
            unreadCount: 1,
            isPinned: true,
          },
          {
            id: "group_family_story_v2",
            name: "Family Dinner",
            type: "group",
            unreadCount: 5,
            members: [
              { id: "me", name: "You" },
              { id: "mom", name: "Mom" },
              { id: "dad", name: "Dad" },
              { id: "riya", name: "Riya" },
            ],
          },
        ],
      })
      .scene("family setup", { at: "0s", duration: "9s" }, (scene) => {
        scene.conversation(
          {
            app: "whatsapp",
            deviceId: "phone",
            conversationId: "group_family_story_v2",
            currentActor: people.me,
          },
          (chat) => {
            chat.at("1.2s").open();
            chat
              .at("2.2s")
              .receive(
                people.mom,
                "Everyone wear normal clothes. Your chachi is bringing someone.",
              );
            chat
              .at("4s")
              .receive(people.dad, "And nobody mention surprise cake yet.");
            chat
              .at("6s")
              .send("Why does this sound like a hostage exchange?", {
                typed: true,
                charDelay: 2,
              });
          },
        );
      })
      .scene("private reveal", { at: "9s", duration: "10.2s" }, (scene) => {
        scene.whatsapp("phone", "dm_riya_story_v2", (whatsapp) =>
          whatsapp.openChatList("0s"),
        );
        scene.conversation(
          {
            app: "whatsapp",
            deviceId: "phone",
            conversationId: "dm_riya_story_v2",
            currentActor: people.me,
          },
          (chat) => {
            chat.at("1.4s").open();
            const reveal = chat
              .at("2.2s")
              .receive(people.riya, "That 'someone' is for you, genius.");
            chat
              .at("4s")
              .reply("Delete this message from the universe.", reveal, {
                typed: true,
                charDelay: 2,
              });
            chat
              .at("6.4s")
              .receive(
                people.riya,
                "Too late. Mom asked me which shirt makes you look employable.",
              );
            scene.focus(reveal, { scale: 1.1, duration: "0.35s" });
          },
        );
      })
      .scene("group payoff", { at: "19.2s", duration: "7s" }, (scene) => {
        scene.whatsapp("phone", "group_family_story_v2", (whatsapp) =>
          whatsapp.openChatList("0s"),
        );
        scene.conversation(
          {
            app: "whatsapp",
            deviceId: "phone",
            conversationId: "group_family_story_v2",
            currentActor: people.me,
          },
          (chat) => {
            chat.at("1.2s").open();
            chat
              .at("2s")
              .receive(
                people.mom,
                "Who sent cake emoji in the private chat by mistake?",
              );
            chat
              .at("3.8s")
              .send("Not me. I am a man of silence and mystery.", {
                typed: true,
                charDelay: 2,
              });
            chat
              .at("6.8s")
              .receive(people.riya, "You literally sent it to the group.");
          },
        );
      })
      .director("Cinematic")
      .use(new KeyboardPlugin())
      .build(),
});
