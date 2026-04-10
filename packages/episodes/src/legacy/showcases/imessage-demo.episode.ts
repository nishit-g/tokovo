import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { IMessageTrackBuilder } from "@tokovo/apps-imessage";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "imessage-demo",
    title: "iMessage Demo",
    description: "Showcases iMessage features: screen effects, link previews, audio messages, contacts, calendar, tapbacks, and more",
    category: "showcase",
    tags: ["imessage", "screen-effects", "link-preview", "audio", "contact", "calendar", "tapback", "unsend"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_imessage"],
  },
  build: () =>
    episode("imessage-demo", {
      fps: 30,
      duration: "30s",
      title: "iMessage Demo",
    })
      .device("phone", "iphone16", {
        app: "app_imessage",
        os: {
          time: new Date("2024-12-18T14:30:00"),
          battery: 92,
          network: "5G",
        },
      })
      .track(
        "app_imessage",
        () => new IMessageTrackBuilder(30, "phone", "group_chat", getOrder),
        (im: IMessageTrackBuilder) => {
          // Create conversations
          im.at("0s").createConversation({
            id: "group_chat",
            title: "Weekend Plan 🎉",
            transport: "imessage",
            isGroup: true,
            participants: [
              { id: "me", name: "Me", isMe: true },
              { id: "alex", name: "Alex" },
              { id: "jordan", name: "Jordan" },
            ],
          });

          im.at("0.3s").createConversation({
            id: "friend_chat",
            title: "Sam",
            transport: "imessage",
            participants: [
              { id: "me", name: "Me", isMe: true },
              { id: "sam", name: "Sam" },
            ],
          });

          // === Scene 1: Group chat with basic messages and tapbacks ===
          im.at("0.5s").openConversation("group_chat");
          im.at("1s").receive("Alex", "Brunch Saturday? 🥞", { messageId: "m1" });

          // Send with screen effect (balloons)
          im.at("2s").sendWithEffect({
            text: "Let's do it! 🎈",
            screenEffect: "balloons",
            messageId: "m2",
          });
          im.at("2.3s").setMessageStatus("m2", "delivered");

          // Receive reply
          im.at("3.5s").receive("Jordan", "I found a great spot!", { messageId: "m3" });

          // === Scene 2: Link preview ===
          im.at("4.5s").sendLink({
            url: "https://yelp.com/biz/morning-glory-cafe",
            preview: {
              title: "Morning Glory Café",
              description: "Best brunch in the city. 4.8⭐ · $$ · American",
              thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
              domain: "yelp.com",
            },
            messageId: "m4",
          });
          im.at("4.8s").setMessageStatus("m4", "delivered");

          // Tapback on link
          im.at("5.5s").tapback({ messageId: "m4", type: "heart" });
          im.at("6s").tapback({ messageId: "m4", type: "thumbsUp" });

          // === Scene 3: Audio message ===
          im.at("7s").receive("Alex", "Check out this voice note!", { messageId: "m5" });
          im.at("7.5s").sendAudio({
            url: "/audio/voice-memo.m4a",
            duration: 12,
            waveform: [0.3, 0.5, 0.8, 0.6, 0.9, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3, 0.6, 0.7, 0.5, 0.4],
            messageId: "m6",
          });
          im.at("8s").setMessageStatus("m6", "read");

          // === Scene 4: Contact card ===
          im.at("9s").receive("Jordan", "Here's the café owner's contact:", { messageId: "m7" });
          im.at("9.5s").sendContact({
            name: "Maria Chen",
            phone: "+1 (555) 123-4567",
            email: "maria@morningglory.com",
            messageId: "m8",
          });

          // === Scene 5: Calendar invite ===
          im.at("11s").sendCalendar({
            title: "Brunch at Morning Glory",
            startDate: "2024-12-21T11:00:00",
            endDate: "2024-12-21T13:00:00",
            location: "Morning Glory Café, 123 Main St",
            messageId: "m9",
          });
          im.at("11.5s").setMessageStatus("m9", "delivered");
          im.at("12s").tapback({ messageId: "m9", type: "exclamation" });

          // === Scene 6: Fireworks celebration ===
          im.at("13s").receive("Alex", "Can't wait! This is going to be amazing! 🎆", { messageId: "m10" });
          im.at("13.5s").screenEffect("fireworks");

          // === Scene 7: Switch to other conversation ===
          im.at("16s").setScreen("list");
          im.at("16.5s").openConversation("friend_chat");
          im.at("17s").receive("Sam", "Did you book the restaurant?", { messageId: "s1" });

          // Send and then unsend
          im.at("18s").send("Yes! Saturday at 11am", { messageId: "s2" });
          im.at("18.3s").setMessageStatus("s2", "delivered");

          // Typing indicator
          im.at("19s").typing("Sam", true);
          im.at("20.5s").typing("Sam", false);
          im.at("21s").receive("Sam", "Perfect! See you there 🙌", { messageId: "s3" });

          // Send with love effect
          im.at("22s").sendWithEffect({
            text: "❤️",
            screenEffect: "love",
            bubbleEffect: "loud",
            messageId: "s4",
          });

          // === Scene 8: Back to group, search demo ===
          im.at("25s").setScreen("list");
          im.at("25.5s").openConversation("group_chat");
          im.at("26s").search("brunch");
          im.at("27s").clearSearch();

          // Mark as read
          im.at("28s").read();
        },
      )
      .build(),
});
