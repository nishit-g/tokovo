/**
 * Bakchodi Bros Episode V2 - Production
 *
 * Two Indian friends doing bakchodi at midnight.
 * Now showcasing ALL new WhatsApp features!
 *
 * @see docs-v2/EPISODE-ARCH.md
 */

import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import {
  CameraDirectorPlugin,
  AudioDirectorPlugin,
  OSDirectorPlugin,
  KeyboardPlugin,
} from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "bakchodi-bros",
    title: "Bakchodi Bros 🤪",
    description:
      "Two best friends. One stupid plan. Pure chaos. (Feature Showcase Edition)",
    category: "production",
    tags: ["whatsapp", "comedy", "hindi", "showcase"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 2700,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("bakchodi-bros", {
      fps: 30,
      duration: "90s",
      title: "Bakchodi Bros 🤪",
      description: "Two best friends. One stupid plan. Pure chaos.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_rahul",
            name: "Rahul 🤪",
            avatar: "/avatars/avatar-rahul.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-17T23:30:00"),
          battery: 23,
          network: "4G",
        },
      })
      .background({ type: "image", src: "/backgrounds/night-window.png" })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_rahul", getOrder);
        },
        (wa) => {
          wa.at("1s").receive("Rahul", "bhai");
          wa.at("1.5s").receive("Rahul", "bhai");
          wa.at("2s").receive("Rahul", "BHAI");
          wa.at("2.5s").receive("Rahul", "BHAI UTHJA!!");

          wa.span("4s", "5s").typing("me");
          wa.at("5s").send("kya hai bc? 11:30 baj rahe hain");

          wa.span("6s", "8s").typing("them");
          wa.at("8s").receive("Rahul", "bhai sun meri baat");
          wa.at("9s").receive("Rahul", "mere paas ek plan hai 👀");

          wa.span("11s", "12s").typing("me");
          wa.at("12s").send(
            "tera last plan... mujhe police station le gaya tha",
          );

          wa.span("14s", "16s").typing("them");
          wa.at("16s").receive("Rahul", "bhai wo galat report thi");
          wa.at("17s").receive("Rahul", "aur uncle ne sorry bol diya tha");

          wa.span("19s", "20s").typing("me");
          wa.at("20s").send("uncle ne mujhe tamatar phenka tha 🍅");

          wa.at("22s").receiveSticker("Rahul", "/placeholders/media.svg");

          wa.span("24s", "27s").typing("them");
          wa.at("27s").receive("Rahul", "chod na wo sab");
          wa.at("28s").receive("Rahul", "sun");
          wa.at("29s").receive("Rahul", "aaj maggi party karein 🍜");

          wa.span("31s", "32s").typing("me");
          wa.at("32s").send("...bas itna?");
          wa.at("33s").send("iske liye 50 baar bhai bhai kiya?");

          wa.span("35s", "38s").typing("them");
          wa.at("38s").receive("Rahul", "are nahi nahi");
          wa.at("39s").receive("Rahul", "maggi party");
          wa.at("40s").receive("Rahul", "CLUB mein 🏝️");

          wa.span("42s", "43s").typing("me");
          wa.at("43s").send("club mein maggi? 🤨");

          wa.at("45s").receiveLocation("Rahul", {
            latitude: 19.1136,
            longitude: 72.8697,
            locationName: "Maggi Point Club",
            locationAddress: "Bandra West, Mumbai",
            mapThumbnailUrl: "/placeholders/map.svg",
          });

          wa.span("47s", "49s").typing("them");
          wa.at("49s").receive("Rahul", "dekh ye menu hai");

          wa.at("50s").receiveDocument("Rahul", {
            fileName: "Maggi_Menu_VIP.pdf",
            fileSize: "2.3 MB",
            fileType: "pdf",
          });

          wa.at("52s").receive("Rahul", "500 rupay ki exotic maggi 👀");

          wa.span("54s", "55s").typing("me");
          wa.at("55s").send("500 KI MAGGI???");
          wa.at("56s").send("BHAI TU PAGAL HAI KYA");

          wa.at("58s").receiveVoice("Rahul", 5);

          wa.span("62s", "64s").typing("them");
          wa.at("64s").receive("Rahul", "bhai trust me");
          wa.at("65s").receive("Rahul", "pehle khana phir judge karna");

          wa.at("67s").receiveContact("Rahul", {
            contactName: "Maggi Club Reservation",
            contactPhone: "+91 98765 43210",
          });

          wa.at("69s").receive("Rahul", "ye number call kar booking ke liye");
          wa.at("70s").receive("Rahul", "15 min mein neeche aa 🚗");

          wa.at("72s").forward(5, { forwardedFrom: "Priya" });

          wa.span("74s", "75s").typing("me");
          wa.at("75s").send("chal aa raha hun... pagal 🤦‍♂️");
          wa.at("77s").editMessage(
            20,
            "chal aa raha hun... excited actually! 🤪",
          );

          wa.at("79s").react(
            { conversationId: "dm_rahul", messageIndex: 19 },
            "🔥",
          );

          wa.at("81s").receive("Rahul", "LET'S GOOOO 🚀");

          wa.at("83s").receiveGif("Rahul", "/placeholders/media.svg");

          wa.at("85s").receiveImage("Rahul", "/placeholders/media.svg", {
            caption: "Entry ka photo 📸",
          });

          wa.span("87s", "88s").typing("me");
          wa.at("88s").send("5 min mein 👇");
          wa.at("89s").sendImage("/placeholders/media.svg");
        },
      )
      .use(new CameraDirectorPlugin())
      .use(new AudioDirectorPlugin({ mood: "chill", volume: 0.15 }))
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2024-12-17T23:30:00"),
          startBattery: 23,
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
