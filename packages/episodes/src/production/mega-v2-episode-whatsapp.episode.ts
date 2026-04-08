/**
 * Mega V2 WhatsApp Showcase
 *
 * A dense WhatsApp-only episode that mixes a real comedy story with broad UI
 * coverage: chat list chrome, top-level screens, group chaos, verified
 * business DM, locked family chat, replies, media, docs, contact cards,
 * locations, voice/video, group info, and camera emphasis on the actual beats.
 */

import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin, OSDirectorPlugin } from "@tokovo/compiler";

import { defineEpisode } from "../types/episode-definition.js";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "mega-v2-episode-whatsapp",
    title: "Mega V2 WhatsApp: Rishta Damage Control",
    description:
      "A guy tries to look classy before meeting Naina's parents while every WhatsApp chat around him collapses in public.",
    category: "production",
    tags: [
      "whatsapp",
      "mega",
      "showcase",
      "comedy",
      "group-chat",
      "camera",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2880,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("mega-v2-episode-whatsapp", {
      fps: 30,
      duration: "96s",
      title: "Mega V2 WhatsApp: Rishta Damage Control",
      description:
        "Full WhatsApp chaos before the first parent meet goes spectacularly off-script.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_naina",
            name: "Naina ✨",
            unreadCount: 2,
            isPinned: true,
            hasStatus: true,
            initialMessages: [
              {
                from: "Naina",
                text: "7:30 sharp. papa notices lateness like income tax.",
                timestamp: -4200,
              },
            ],
          },
          {
            id: "group_rishta_ops",
            name: "Rishta Damage Control",
            type: "group",
            unreadCount: 14,
            hasStatus: true,
            participants: ["me", "Sid", "Tara", "Monty", "Aashi"],
            description: "Sid, Tara, Monty, Aashi",
            pinnedMessage: {
              from: "Tara",
              text: "Nobody says bro in front of uncle.",
            },
            disappearingMessagesLabel:
              "Disappearing messages are on. New messages will vanish after 24 hours.",
            initialMessages: [
              {
                from: "Sid",
                text: "borrowed blazer 10 baje tak wapas chahiye",
                timestamp: -3600,
              },
              {
                from: "Tara",
                text: "bakery is asking if 'future son-in-law' stays on cake",
                timestamp: -3480,
              },
            ],
          },
          {
            id: "dm_bakery",
            name: "SweetCrust Bakery",
            unreadCount: 1,
            businessLabel: "Business account",
            isVerifiedBusiness: true,
            isChannel: true,
            isFollowed: true,
            channelUnreadCount: 4,
            channelDescription: "Custom cakes, wedding saves, and dessert propaganda.",
            channelLatestSnippet: "Topper ready. Please stop editing the name every 3 minutes.",
            channelFollowersLabel: "412K followers",
            channelCategory: "Food & Events",
            initialMessages: [
              {
                from: "SweetCrust Bakery",
                text: "Order confirmed for 7:10 PM pickup.",
                timestamp: -3000,
              },
            ],
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            unreadCount: 1,
            isLocked: true,
            isPinned: true,
            hasStatus: true,
            initialMessages: [
              {
                from: "Mom",
                type: "call_missed",
                callType: "voice",
                timestamp: -2400,
              },
              {
                from: "Mom",
                text: "shirt pe perfume maar ke jaana, phenyl nahi",
                timestamp: -2280,
              },
            ],
          },
          {
            id: "group_society",
            name: "Block C Boys",
            type: "group",
            unreadCount: 4,
            isMuted: true,
            initialMessages: [
              {
                from: "Rohit",
                text: "lift phir atak gayi",
                timestamp: -5000,
              },
            ],
          },
          {
            id: "dm_hr",
            name: "Internship HR",
            unreadCount: 0,
            isChannel: true,
            isFollowed: false,
            channelUnreadCount: 1,
            channelDescription: "Corporate optimism, deadlines, and reimbursement despair.",
            channelLatestSnippet: "Reminder: confidence is not a reimbursable expense.",
            channelFollowersLabel: "37K followers",
            channelCategory: "Work",
            initialMessages: [
              {
                from: "HR",
                text: "Please fill reimbursement form by EOD.",
                timestamp: -9000,
              },
            ],
          },
        ],
        os: {
          time: new Date("2025-03-07T18:42:00"),
          battery: 64,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "group_rishta_ops", getOrder),
        (wa) => {
          wa.openStatus("0s");
          wa.openCalls("1.2s");
          wa.openCommunities("2.4s");
          wa.openSettings("3.6s");
          wa.openChatList("4.8s");

          wa.switchTo("group_rishta_ops", "6.2s");
          wa.at("6.8s").receive(
            "Sid",
            "catastrophe. bakery wrote congratulations neha aunty",
          );
          wa.at("7.6s").receive(
            "Tara",
            "and Monty booked family table under Damage Control Squad",
          );
          wa.at("8.4s").receive("Monty", "rich people should know confidence");

          wa.span("10s", "12s").typing("me");
          wa.at("12s").send(
            "listen carefully. koi bro, scene, ya jugaad word use nahi karega",
          );

          wa.span("12.6s", "13.6s").typing("Aashi");
          wa.at("13.6s").receive(
            "Aashi",
            "Monty already told uncle 'scene set hai'",
            { replyTo: { index: -1 } },
          );

          wa.at("14.6s").receiveImage("Sid", "/placeholders/media.svg", {
            caption: "meet the cake",
          });

          wa.span("15.4s", "16.8s").typing("me");
          wa.at("16.8s").send("why does it say Happy 25th Tax Audit", {
            replyTo: { index: -1 },
          });

          wa.openChatList("18s");

          wa.switchTo("dm_naina", "19.4s");
          wa.at("20s").receive(
            "Naina",
            "you left me on delivered and mom is iron-proofing your shirt",
          );
          wa.at("21s").receive("Naina", "good. papa hates chaos");

          wa.span("22s", "24s").typing("me");
          wa.at("24s").send("I am calm. mature. absolutely under control.");
          wa.at("24.8s").read();

          wa.openChatList("26s");

          wa.switchTo("dm_bakery", "27.4s");
          wa.at("28s").receive(
            "SweetCrust Bakery",
            "Hello sir, your custom topper 'Naina ji ke papa please trust me' is ready.",
          );
          wa.at("29.2s").receiveDocument("SweetCrust Bakery", {
            fileName: "Order_7184_Trust_Me_Uncle.pdf",
            fileSize: "1.4 MB",
            fileType: "pdf",
          });

          wa.span("30.2s", "32.2s").typing("me");
          wa.at("32.2s").send("delete topper delete family delete order");

          wa.at("33.2s").receiveLocation("SweetCrust Bakery", {
            latitude: 28.6139,
            longitude: 77.209,
            locationName: "SweetCrust Pickup Counter",
            locationAddress: "Rajouri Garden",
            mapThumbnailUrl: "/placeholders/map.svg",
          });

          wa.openCalls("34.8s");
          wa.openChatList("36.2s");

          wa.switchTo("dm_mom", "37.2s");
          wa.at("37.8s").receive("Mom", "where are you");
          wa.at("38.6s").receiveVoice("Mom", 5);

          wa.span("39.4s", "40.6s").typing("me");
          wa.at("40.6s").send("5 min");

          wa.openChatList("41.8s");

          wa.switchTo("group_rishta_ops", "43s");
          wa.at("43.6s").receive(
            "Tara",
            "Naina just posted status 'if tonight flops I'm becoming spiritual'",
          );
          wa.at("44.4s").receiveSticker("Sid", "/placeholders/media.svg");
          wa.at("45.2s").receiveDocument("Monty", {
            fileName: "Dinner_Conversation_Safe_Topics_v7.pdf",
            fileSize: "2.1 MB",
            fileType: "pdf",
          });

          wa.span("46s", "47.2s").typing("me");
          wa.at("47.2s").send("who made safe topic number 3 crypto");

          wa.at("48.2s").receiveContact("Aashi", {
            contactName: "Bunty Valet",
            contactPhone: "+91 98989 11223",
          });
          wa.at("49s").receiveLocation("Sid", {
            latitude: 28.6315,
            longitude: 77.2167,
            locationName: "Cafe Laltain",
            locationAddress: "Connaught Place",
            mapThumbnailUrl: "/placeholders/map.svg",
          });

          wa.span("49.8s", "51.4s").typing("me");
          wa.at("51.4s").send("make sure sign says Malhotra not Madhotra", {
            replyTo: { index: -1 },
          });

          wa.at("52.4s").receiveVoice("Monty", 6);

          wa.span("53s", "54.6s").typing("me");
          wa.at("54.6s").send("why is he whispering like witness protection");

          wa.openProfile("56s");
          wa.goBack("60s");
          wa.openChatList("61s");

          wa.switchTo("dm_naina", "62.2s");
          wa.at("62.8s").receive(
            "Naina",
            "why did bakery guy just call me bhabhi",
            { replyTo: { index: -1 } },
          );

          wa.span("63.8s", "65.4s").typing("me");
          wa.at("65.4s").send("long story. hilarious from distance.");

          wa.at("66.4s").receive("Naina", "my father is smiling. that is worse.");

          wa.openChatList("67.6s");

          wa.switchTo("dm_bakery", "68.8s");
          wa.at("69.4s").receiveImage("SweetCrust Bakery", "/placeholders/media.svg", {
            caption: "final cake sir",
          });
          wa.at("70.4s").receive(
            "SweetCrust Bakery",
            "Could not remove topper. edible gold glued.",
          );

          wa.span("71.2s", "72.6s").typing("me");
          wa.at("72.6s").send("bring plain knife. we perform surgery.");

          wa.openChatList("73.8s");

          wa.switchTo("group_rishta_ops", "75s");
          wa.at("75.6s").receive("Sid", "update: uncle has arrived 23 mins early");
          wa.at("76.4s").receive(
            "Tara",
            "Monty called uncle 'legend sir'",
            { replyTo: { index: -1 } },
          );

          wa.span("77.2s", "78.6s").typing("me");
          wa.at("78.6s").send("at this point marry Mom off, save my slot");

          wa.at("79.6s").receiveVideo("Aashi", "/placeholders/media.svg", {
            duration: 7,
            caption: "live from disaster zone",
          });
          wa.at("80.4s").react({ index: -1 }, "😂");

          wa.openChatList("81.8s");

          wa.switchTo("dm_naina", "83s");
          wa.at("83.6s").receive("Naina", "small update");
          wa.at("84.4s").receive(
            "Naina",
            "mom and dad love your mother. they think SHE trained you",
          );

          wa.span("85.2s", "86.8s").typing("me");
          wa.at("86.8s").send("correct. i am franchise model.");

          wa.at("87.8s").receive(
            "Naina",
            "also cake says Trust Me Uncle",
            { replyTo: { index: -1 } },
          );

          wa.span("88.6s", "89.8s").typing("me");
          wa.at("89.8s").send("then honesty won.");

          wa.openChatList("90.8s");

          wa.switchTo("group_rishta_ops", "91.8s");
          wa.at("92.2s").receive("Sid", "bro");

          wa.span("92.4s", "93s").typing("me");
          wa.at("93s").send("YOU SAID BRO??");

          wa.at("93.8s").receive("Monty", "uncle replied 'same bro'");

          wa.openChatList("94.6s");
          wa.switchTo("dm_naina", "95.2s");
          wa.at("95.6s").receive("Naina", "congrats");
          wa.at("96s").receive("Naina", "papa added you to family group himself");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1, duration: "0.35s" });
        cam.at("1.2s").animate({ scale: 1.03, duration: "0.28s", easing: "easeOut" });
        cam.at("2.4s").animate({ scale: 1.01, duration: "0.28s", easing: "easeOut" });
        cam.at("4.8s").focus("device", { scale: 1.02, duration: "0.35s" });

        cam.span("6.7s", "16.9s").trackCinematic("lastMessage", {
          scale: 1.12,
          smoothing: 0.18,
          deadZonePx: 18,
          maxVelocityPxPerSec: 430,
          predictiveLookaheadFrames: 1,
        });

        cam.at("20s").focus("lastMessage", { scale: 1.1, duration: "0.42s" });
        cam.span("22s", "24.1s").trackCinematic("inputArea", {
          scale: 1.06,
          smoothing: 0.18,
        });

        cam.at("28s").focus("lastMessage", { scale: 1.11, duration: "0.45s" });
        cam.at("33.2s").focus("lastMessage", { scale: 1.09, duration: "0.42s" });

        cam.span("43.5s", "54.8s").trackCinematic("lastMessage", {
          scale: 1.13,
          smoothing: 0.16,
          deadZonePx: 20,
          maxVelocityPxPerSec: 420,
        });

        cam.at("56s").focus("profile", { scale: 1.08, duration: "0.45s" });
        cam.at("60s").focus("device", { scale: 1.02, duration: "0.35s" });

        cam.at("62.8s").focus("lastMessage", { scale: 1.13, duration: "0.48s" });
        cam.at("69.4s").focus("lastMessage", { scale: 1.12, duration: "0.45s" });
        cam.at("75.6s").focus("lastMessage", { scale: 1.1, duration: "0.4s" });
        cam.at("79.6s").focus("lastMessage", { scale: 1.12, duration: "0.42s" });
        cam.at("95.6s").focus("lastMessage", { scale: 1.15, duration: "0.5s" });
      })
      .audio((audio) => {
        audio.span("0s", "96s").bgm("/music/ambient-track.mp3", {
          volume: 0.14,
          fadeIn: "2s",
          fadeOut: "2s",
        });
      })
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2025-03-07T18:42:00"),
          startBattery: 64,
          batteryDrainRate: 0.42,
          updateInterval: "15s",
        }),
      )
      .use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )
      .build(),
});
