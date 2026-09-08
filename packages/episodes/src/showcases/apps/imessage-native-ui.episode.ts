import type { IMessageMessage } from "@tokovo/apps-imessage";
import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";

const message = (
  id: string,
  senderId: string,
  text: string,
  extra: Partial<IMessageMessage> = {},
): IMessageMessage => ({
  id,
  conversationId: "text",
  senderId,
  senderName: senderId === "me" ? "You" : senderId,
  fromMe: senderId === "me",
  kind: "text",
  text,
  timestamp: 0,
  tapbacks: [],
  ...extra,
});
const participants = [
  { id: "me", name: "You", isMe: true },
  { id: "Ava", name: "Ava" },
];

export default defineEpisode({
  meta: {
    id: "imessage-native-ui",
    title: "iMessage Native UI",
    category: "showcase",
    catalogType: "app_showcase_theme",
    appId: "app_imessage",
    visibility: "public",
    sortOrder: 720,
    description:
      "Native UI regression reel: single messages, grouped runs, replies, tapbacks, edits, unsend, media, SMS, light and dark appearance.",
    tags: ["imessage", "native", "visual-proof"],
  },
  config: { format: "1080x1920", durationInFrames: 720, apps: ["app_imessage"] },
  build: () =>
    episode("imessage-native-ui", { fps: 30, duration: "24s", title: "iMessage Native UI" })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: { time: new Date("2026-04-10T09:41:00Z"), battery: 92, network: "wifi" },
      })
      .imessage("phone", "single", (im) => {
        im.at("0s").createConversation({
          id: "single",
          title: "Ava",
          participants,
          messages: [message("single-1", "Ava", "Coffee?", { conversationId: "single" })],
        });
        im.at("0s").createConversation({
          id: "text",
          title: "Ava",
          participants,
          messages: [
            message("t1", "Ava", "Are we still on for tonight?"),
            message("t2", "Ava", "I found a place by the water."),
            message("t3", "me", "Yes!", { tapbacks: [{ type: "heart", fromMe: false }] }),
            message("t4", "me", "Table for three.\n7:30, by the window.", { isEdited: true }),
            message("t5", "Ava", "The one with the tiny balcony?", {
              replyTo: { messageId: "t2" },
            }),
            message("t6", "me", "Exactly. I'll send you the address when I get there.", {
              status: "read",
            }),
            message("t7", "me", "", { isUnsent: true }),
          ],
        });
        im.at("0s").createConversation({
          id: "group",
          title: "Weekend plans",
          isGroup: true,
          participants: [...participants, { id: "Milo", name: "Milo" }],
          messages: [
            message("g1", "Ava", "I've booked the table.", { conversationId: "group" }),
            message("g2", "Milo", "Amazing. I'm bringing dessert.", { conversationId: "group" }),
            message("g3", "Milo", "No experiments this time.", {
              conversationId: "group",
              tapbacks: [{ type: "haha", fromMe: true }],
            }),
            message("g4", "me", "That sounds suspiciously specific.", {
              conversationId: "group",
              status: "delivered",
            }),
          ],
        });
        im.at("0s").createConversation({
          id: "media",
          title: "Ava",
          participants,
          messages: [
            message("m1", "Ava", "Here's the plan.", {
              conversationId: "media",
              attachments: [{ kind: "image", url: "/media/launch-board.svg" }],
            }),
            message("m2", "me", "", {
              conversationId: "media",
              kind: "voice",
              attachments: [
                {
                  kind: "voice",
                  duration: 12,
                  waveform: [0.3, 0.6, 0.2, 0.9, 0.7, 0.4, 0.8, 0.2, 0.5, 0.8, 0.4, 0.3],
                },
              ],
              status: "delivered",
            }),
            message("m3", "Ava", "", {
              conversationId: "media",
              kind: "link",
              attachments: [
                {
                  kind: "link",
                  preview: {
                    url: "https://example.com/weekend",
                    title: "A little weekend escape",
                    description: "The plan, the place, and everything we need.",
                  },
                },
              ],
            }),
          ],
        });
        im.at("0s").createConversation({
          id: "sms",
          title: "Delivery",
          participants: [
            { id: "me", name: "You", isMe: true },
            { id: "Delivery", name: "Delivery" },
          ],
          transport: "sms",
          messages: [
            message("s1", "Delivery", "Your delivery is outside.", { conversationId: "sms" }),
            message("s2", "me", "Thanks. I'll be right down.", {
              conversationId: "sms",
              status: "sent",
            }),
          ],
        });
        im.at("0s").openConversation("single");
        im.at("2s").openConversation("text");
        im.at("6s").openConversation("group");
        im.at("9s").openConversation("media");
        im.at("12s").openConversation("sms");
        im.at("12s").setDraft("Leave it by the door, please.");
        im.at("15s").openConversation("text");
        im.at("15s").setThemeMode("dark");
        im.at("18s").setScreen("list");
        im.at("20s").setThemeMode("light");
        im.at("21s").openConversation("media");
        im.at("21s").setScreen("info");
        im.at("22.5s").setScreen("media");
      })
      .build(),
});
