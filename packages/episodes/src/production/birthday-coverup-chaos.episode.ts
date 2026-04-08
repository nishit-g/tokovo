/**
 * Birthday Cover-Up Chaos - Production
 *
 * A WhatsApp story that jumps between a disaster group chat planning a surprise
 * and the DM with the person who thinks everyone forgot.
 */

import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin, OSDirectorPlugin } from "@tokovo/compiler";

import { defineEpisode } from "../types/episode-definition.js";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "birthday-coverup-chaos",
    title: "Birthday Cover-Up Chaos 🎂",
    description:
      "A surprise-birthday plan collapses in the group while the DM gets more and more personal.",
    category: "production",
    tags: ["whatsapp", "group-chat", "dm", "comedy", "birthday"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2340,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("birthday-coverup-chaos", {
      fps: 30,
      duration: "78s",
      title: "Birthday Cover-Up Chaos 🎂",
      description:
        "One group is trying to save a surprise, while the DM is one text away from disaster.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_rhea",
            name: "Rhea",
            unreadCount: 1,
            isPinned: true,
            initialMessages: [
              {
                from: "Rhea",
                text: "kal pakka free rehna",
                timestamp: -7200,
              },
            ],
          },
          {
            id: "group_ops",
            name: "Operation Rhea",
            type: "group",
            unreadCount: 3,
            participants: ["me", "Sid", "Tara", "Neel"],
            description: "Sid, Tara, Neel",
            pinnedMessage: {
              from: "Sid",
              text: "No one wishes before the balcony cue.",
            },
            disappearingMessagesLabel:
              "Disappearing messages are on. New messages will vanish after 24 hours.",
            initialMessages: [
              {
                from: "Sid",
                text: "candles kisne uthayi",
                timestamp: -1800,
              },
              {
                from: "Tara",
                text: "speaker charge pe hai",
                timestamp: -1700,
              },
            ],
          },
          {
            id: "dm_mom",
            name: "Mom ❤️",
            unreadCount: 1,
            isLocked: true,
            isPinned: true,
            initialMessages: [
              {
                from: "Mom",
                text: "ghar aate waqt bread le aana",
                timestamp: -2400,
              },
            ],
          },
          {
            id: "group_flatmates",
            name: "Flat 4A",
            type: "group",
            unreadCount: 2,
            initialMessages: [
              {
                from: "Kush",
                text: "kisne geyser on chhoda",
                timestamp: -3000,
              },
            ],
          },
        ],
        os: {
          time: new Date("2025-02-22T19:38:00"),
          battery: 58,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "group_ops", getOrder),
        (wa) => {
          wa.openChatList("0s");

          wa.switchTo("group_ops", "2.4s");
          wa.at("3s").receive("Sid", "situation kharab hai");
          wa.at("3.9s").receive("Tara", "Rhea ko genuinely lag raha hai sab bhool gaye");
          wa.at("4.8s").receive("Neel", "cake tilt pe hai but morally stable hai");

          wa.span("5.8s", "7.2s").typing("me");
          wa.at("7.2s").send("koi bhi usko wish mat karo jab tak main bolu");

          wa.span("8.2s", "9.4s").typing("Tara");
          wa.at("9.4s").receive(
            "Tara",
            "too late उसने status dala 'another normal day :)'",
            { replyTo: { index: -1 } },
          );

          wa.openChatList("10.8s");
          wa.switchTo("dm_rhea", "12.2s");
          wa.at("12.8s").receive("Rhea", "nice");
          wa.at("13.5s").receive("Rhea", "even you forgot");

          wa.span("14.4s", "16.6s").typing("me");
          wa.at("16.6s").send("pagal hai kya, office me atka hua hu");

          wa.span("17.6s", "18.8s").typing("Rhea");
          wa.at("18.8s").receive("Rhea", "haan obviously");
          wa.at("19.6s").receive("Rhea", "12 ghante se atke hue ho");

          wa.openChatList("21.2s");
          wa.switchTo("group_ops", "22.8s");
          wa.at("23.4s").receiveImage("Neel", "/placeholders/media.svg", {
            caption: "cake update",
          });
          wa.at("24.6s").receive("Sid", "bakery ne likh diya happy retirement reha");
          wa.at("25.8s").receive("Tara", "florist condolence bouquet bhej gaya");

          wa.span("27s", "28.6s").typing("me");
          wa.at("28.6s").send("scrape the r. make it look intentional.");

          wa.span("29.6s", "30.8s").typing("Sid");
          wa.at("30.8s").receive("Sid", "bro bouquet pe deepest condolences bhi likha hai");

          wa.openChatList("32.4s");
          wa.switchTo("dm_rhea", "33.8s");
          wa.at("34.4s").receive("Rhea", "it's fine");
          wa.at("35.1s").receive("Rhea", "i booked dinner for one");
          wa.at("35.9s").receive("Rhea", "don't worry, i am used to this");

          wa.span("37s", "39.4s").typing("me");
          wa.at("39.4s").send("drama band kar aur 20 min de mujhe");

          wa.span("40.4s", "41.2s").typing("Rhea");
          wa.at("41.2s").receive("Rhea", "kyu", { replyTo: { index: -1 } });

          wa.openChatList("42.6s");
          wa.switchTo("group_ops", "44s");
          wa.at("44.6s").receive("Sid", "we are downstairs");
          wa.at("45.4s").receive("Neel", "watchman ne bola bouquet gaadi me chhupa do");
          wa.at("46.2s").receive("Tara", "cake abhi bhi rehab jaisa lag raha hai");

          wa.span("47.4s", "49.6s").typing("me");
          wa.at("49.6s").send("lights off rakho. bouquet hide karo. neel ko kuch mat touch karne do");

          wa.span("50.6s", "51.8s").typing("Sid");
          wa.at("51.8s").receive("Sid", "too late. usne ribbon kaat diya");

          wa.openChatList("53.4s");
          wa.switchTo("dm_rhea", "54.8s");
          wa.span("55.2s", "57.4s").typing("me");
          wa.at("57.4s").send("balcony pe aa 2 min");

          wa.span("58.2s", "59.2s").typing("Rhea");
          wa.at("59.2s").receive("Rhea", "why");

          wa.span("60s", "62.4s").typing("me");
          wa.at("62.4s").send("bas aa. aur mood mat lana");

          wa.span("63.2s", "64.4s").typing("Rhea");
          wa.at("64.4s").receive("Rhea", "this better be insane");

          wa.openChatList("65.8s");
          wa.switchTo("group_ops", "67.2s");
          wa.at("67.8s").receive("Sid", "positions ready");
          wa.at("68.6s").receive("Tara", "3... 2... 1...");

          wa.openChatList("69.8s");
          wa.switchTo("dm_rhea", "71s");
          wa.span("71.2s", "73.4s").typing("me");
          wa.at("73.4s").send("ab neeche dekh");

          wa.span("74.4s", "75.8s").typing("Rhea");
          wa.at("75.8s").receive("Rhea", "WHAT", { replyTo: { index: -1 } });
          wa.at("76.6s").receive("Rhea", "you idiots planned all this?");

          wa.span("77.1s", "78s").typing("me");
          wa.at("78s").send("haan. cake ko judge mat karna bas");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.3s" });
        cam.at("3s").focus("lastMessage", { scale: 1.08, duration: "0.4s" });
        cam.at("13.5s").focus("lastMessage", { scale: 1.1, duration: "0.45s" });
        cam.at("24.6s").focus("lastMessage", { scale: 1.12, duration: "0.45s" });
        cam.at("35.9s").focus("lastMessage", { scale: 1.11, duration: "0.45s" });
        cam.at("45.4s").focus("lastMessage", { scale: 1.09, duration: "0.4s" });
        cam.at("75.8s").focus("lastMessage", { scale: 1.14, duration: "0.5s" });
      })
      .audio((audio) => {
        audio.span("0s", "78s").bgm("/music/ambient-track.mp3", {
          volume: 0.14,
          fadeIn: "2s",
          fadeOut: "2s",
        });
      })
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2025-02-22T19:38:00"),
          startBattery: 58,
          batteryDrainRate: 0.45,
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
