/**
 * Attendance Heist Bros - Production
 *
 * Two bros overengineering a simple attendance problem into a national crisis.
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import {
  OSDirectorPlugin,
  KeyboardPlugin,
} from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "attendance-heist-bros",
    title: "Attendance Heist Bros 🎓",
    description:
      "Two bros turn a basic attendance shortage into a full criminal operation.",
    category: "production",
    tags: ["whatsapp", "comedy", "hindi", "bros", "college"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2160,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("attendance-heist-bros", {
      fps: 30,
      duration: "72s",
      title: "Attendance Heist Bros 🎓",
      description: "Pure bakchodi over 9 percent attendance shortage.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_kabir",
            name: "Kabir 🐍",
            avatar: "/placeholders/app-icon.svg",
          },
        ],
        os: {
          time: new Date("2025-01-14T07:12:00"),
          battery: 41,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })
      .track(
        "app_whatsapp",
        () => new WhatsAppTrackBuilder(30, "phone", "dm_kabir", getOrder),
        (wa) => {
          wa.switchTo("dm_kabir", "0s");

          wa.at("1s").receive("Kabir", "bhai uth");
          wa.at("1.7s").receive("Kabir", "emergency hai");
          wa.at("2.5s").receive("Kabir", "college level");

          wa.span("4.5s", "6s").typing("me");
          wa.at("6s").send("subah 7 baje kaunsi emergency hoti hai be");

          wa.span("7.5s", "10s").typing("them");
          wa.at("10s").receive("Kabir", "meri attendance 66 pe latak gayi");
          wa.at("11.2s").receive("Kabir", "75 nahi hui to internals me antim yatra hai");

          wa.span("13s", "14s").typing("me");
          wa.at("14s").send("to class ja na, freedom fighter");

          wa.span("15.5s", "18.5s").typing("them");
          wa.at("18.5s").receive("Kabir", "class jaana ab middle class solution hai");
          wa.at("19.5s").receive("Kabir", "ab operation chalega");

          wa.at("21s").receiveDocument("Kabir", {
            fileName: "Attendance_Recovery_Blueprint_v12.pdf",
            fileSize: "1.8 MB",
            fileType: "pdf",
          });

          wa.span("23s", "24.2s").typing("me");
          wa.at("24.2s").send("attendance ke liye pdf banayi tune?");

          wa.span("26s", "30s").typing("them");
          wa.at("30s").receive("Kabir", "plan A");
          wa.at("31s").receive("Kabir", "viral fever voice note");
          wa.at("32s").receive("Kabir", "plan B");
          wa.at("33s").receive("Kabir", "proxy syndicate pro max");

          wa.span("35s", "36.5s").typing("me");
          wa.at("36.5s").send("proxy syndicate bolke tune khud ko CBI watchlist me daal diya");

          wa.at("38s").receiveVoice("Kabir", 6);

          wa.span("45s", "47s").typing("me");
          wa.at("47s").send("ye cough kam aur scooty self-start zyada lag rahi hai");

          wa.at("49s").receiveSticker("Kabir", "/placeholders/media.svg");

          wa.span("50.5s", "54.5s").typing("them");
          wa.at("54.5s").receive("Kabir", "theek hai plan C");
          wa.at("55.5s").receive("Kabir", "medical store extraction mission");

          wa.at("57s").receiveLocation("Kabir", {
            latitude: 28.6129,
            longitude: 77.2295,
            locationName: "24x7 MediHub",
            locationAddress: "North Campus",
            mapThumbnailUrl: "/placeholders/map.svg",
          });

          wa.at("59s").receiveImage("Kabir", "/placeholders/media.svg", {
            caption: "fake thermometer bhi le lunga",
          });

          wa.span("61s", "63s").typing("me");
          wa.at("63s").send("tu bimaar kam, event company zyada lag raha hai");

          wa.span("65s", "68.5s").typing("them");
          wa.at("68.5s").receive("Kabir", "abort mission");
          wa.at("69.3s").receive("Kabir", "maam on leave nikli");
          wa.at("70.2s").receive("Kabir", "victory samosa?");

          wa.span("71s", "72s").typing("me");
          wa.at("72s").send("tu attendance nahi bacha raha, gta side mission chala raha hai");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("device", { scale: 1.01, duration: "0.25s" });
        cam
          .span("0.9s", "3.6s")
          .trackCinematic("lastMessage", {
            scale: 1.1,
            smoothing: 0.14,
            deadZonePx: 20,
            maxVelocityPxPerSec: 460,
            predictiveLookaheadFrames: 1,
          });
        cam
          .at("10s")
          .focus("lastMessage", { scale: 1.08, duration: "0.45s" });
        cam
          .at("21s")
          .focus("lastMessage", { scale: 1.13, duration: "0.5s" });
        cam
          .at("57s")
          .focus("lastMessage", { scale: 1.1, duration: "0.42s" });
        cam
          .at("68.5s")
          .focus("lastMessage", { scale: 1.15, duration: "0.5s" });
      })
      .audio((audio) => {
        audio.span("0s", "72s").bgm("/music/ambient-track.mp3", {
          volume: 0.14,
          fadeIn: "2s",
          fadeOut: "2s",
        });
      })
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2025-01-14T07:12:00"),
          startBattery: 41,
          batteryDrainRate: 0.5,
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
