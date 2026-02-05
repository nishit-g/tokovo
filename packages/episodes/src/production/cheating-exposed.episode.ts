import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { AudioDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";



export default defineEpisode({
  meta: {
    id: "cheating-exposed",
    title: "My Best Friend Exposed My Boyfriend 💔",
    description: "A dramatic story of betrayal, evidence, and confrontation.",
    category: "production",
    tags: ["whatsapp", "drama", "relationship", "viral"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 4200,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("cheating-exposed", {
      fps: 30,
      duration: "140s",
      title: "My Best Friend Exposed My Boyfriend 💔",
      description: "A dramatic story of betrayal, evidence, and confrontation.",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          { id: "dm_sarah", name: "Sarah 💕", avatar: "/avatars/sarah.png" },
          { id: "dm_jake", name: "Jake ❤️", avatar: "/avatars/jake.png" },
        ],
        os: {
          time: new Date("2024-12-18T09:15:00"),
          battery: 78,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/cozy-bedroom.png" })

      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_jake", getOrder),
        (wa) => {
          wa.at("1s").receive("Jake", "good morning beautiful 😘");
          wa.span("3s", "4s").typing("me");
          wa.at("4s").send("morning babe! miss you");
          wa.span("5.5s", "7s").typing("them");
          wa.at("7s").receive("Jake", "miss you too, can't wait for tonight");
          wa.span("8.5s", "9.5s").typing("me");
          wa.at("9.5s").send("me too 🥰");
        },
      )

      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder),
        (wa) => {
          wa.at("12s").receive("Sarah", "hey");
          wa.at("13s").receive("Sarah", "are you free rn?");
          wa.span("14.5s", "15.5s").typing("me");
          wa.at("15.5s").send("yeah what's up");
          wa.span("16.5s", "18.5s").typing("them");
          wa.at("18.5s").receive("Sarah", "I need to show you something");
          wa.span("20s", "21s").typing("me");
          wa.at("21s").send("okay? you're scaring me");

          wa.span("23s", "25s").typing("them");
          wa.at("25s").receive("Sarah", "I don't know how to say this");
          wa.span("27s", "28s").typing("me");
          wa.at("28s").send("just tell me");
          wa.span("29.5s", "30.5s").typing("them");
          wa.at("30.5s").receive(
            "Sarah",
            "promise you won't hate me for telling you",
          );
          wa.span("32s", "33s").typing("me");
          wa.at("33s").send("I promise, what is it??");

          wa.span("35s", "36s").typing("them");
          wa.at("36s").receive("Sarah", "I saw Jake last night");
          wa.span("38s", "39s").typing("me");
          wa.at("39s").send("okay? he said he was at home");
          wa.span("41s", "43s").typing("them");
          wa.at("43s").receive("Sarah", "he wasn't alone");
          wa.span("46s", "47s").typing("me");
          wa.at("47s").send("what do you mean");
          wa.span("49s", "50.5s").typing("them");
          wa.at("50.5s").receive("Sarah", "I took photos");
          wa.at("52s").receive("Sarah", "I'm so sorry");

          wa.at("55s").receiveImage("Sarah", "/placeholders/media.svg");
          wa.at("60s").receiveImage("Sarah", "/placeholders/media.svg");
          wa.span("64s", "65s").typing("me");
          wa.at("65s").send("is that...");
          wa.at("66.5s").send("that's his car");
          wa.span("68s", "69s").typing("them");
          wa.at("69s").receive("Sarah", "I know");
          wa.at("70.5s").receive("Sarah", "I recognized it immediately");

          wa.span("73s", "74s").typing("me");
          wa.at("74s").send("there has to be an explanation");
          wa.span("76s", "78s").typing("them");
          wa.at("78s").receive("Sarah", "babe...");
          wa.at("79.5s").receive("Sarah", "they were kissing");
          wa.span("82s", "83s").typing("me");
          wa.at("83s").send("WHO IS SHE");
          wa.span("84.5s", "86.5s").typing("them");
          wa.at("86.5s").receive("Sarah", "I don't know her");
          wa.at("88s").receive("Sarah", "but I got a closer photo");
          wa.at("90s").receiveImage("Sarah", "/placeholders/media.svg");

          wa.span("96s", "97s").typing("me");
          wa.at("97s").send("I'm going to be sick");
          wa.span("99s", "100s").typing("them");
          wa.at("100s").receive("Sarah", "I'm so sorry");
          wa.at("101.5s").receive("Sarah", "what are you going to do?");
          wa.span("103s", "104s").typing("me");
          wa.at("104s").send("I'm calling him right now");
        },
      )

      .track(
        "app_whatsapp",
        (getOrder) => new WhatsAppTrackBuilder(30, "phone", "dm_jake", getOrder),
        (wa) => {
          wa.at("107s").send("Jake we need to talk");
          wa.span("109s", "110.5s").typing("them");
          wa.at("110.5s").receive("Jake", "hey! what's up babe");
          wa.span("112s", "113s").typing("me");
          wa.at("113s").send("where were you last night");
          wa.span("115s", "116s").typing("them");
          wa.at("116s").receive("Jake", "I told you, I was home");
          wa.at("117.5s").receive("Jake", "why?");

          wa.span("119s", "120s").typing("me");
          wa.at("120s").send("really?");
          wa.at("121s").send("then explain this");
          wa.at("122s").sendImage("/placeholders/media.svg");
          wa.at("126s").sendImage("/placeholders/media.svg");

          wa.span("130s", "133s").typing("them");
          wa.span("135s", "137s").typing("them");
          wa.at("137s").receive("Jake", "I can explain");
          wa.span("139s", "140s").typing("me");
          wa.at("140s").send("DON'T");
          wa.at("141s").send("I don't want to hear it");
          wa.span("143s", "145s").typing("them");
          wa.at("145s").receive("Jake", "babe please");
          wa.at("146.5s").receive("Jake", "it's not what it looks like");

          wa.span("148s", "149s").typing("me");
          wa.at("149s").send("IT'S EXACTLY WHAT IT LOOKS LIKE");
          wa.at("150.5s").send("we're done");
          wa.span("152s", "153.5s").typing("them");
          wa.at("153.5s").receive("Jake", "no please don't do this");
          wa.at("155s").receive("Jake", "I love you");
          wa.span("157s", "158s").typing("me");
          wa.at("158s").send("you should have thought about that before");
          wa.at("159.5s").send("lose my number");

          wa.span("162s", "164s").typing("them");
          wa.at("164s").receive("Jake", "please let me explain");
          wa.span("166s", "167.5s").typing("them");
          wa.at("167.5s").receive("Jake", "I made a mistake");
          wa.at("169s").receive("Jake", "it meant nothing");
          wa.at("171s").receive("Jake", "answer me");
          wa.at("174s").receive("Jake", "please");

          wa.span("178s", "179s").typing("me");
          wa.at("179s").send("goodbye Jake");
          wa.at("181s").send("don't contact me again");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });
        cam
          .at("43s")
          .animate({ scale: 1.15, duration: "0.8s", easing: "cinematic" });
        cam.at("55s").shake({
          intensityX: 6,
          intensityY: 4,
          frequency: 20,
          decay: 0.85,
          duration: "0.4s",
        });
        cam.at("60s").shake({
          intensityX: 8,
          intensityY: 6,
          frequency: 25,
          decay: 0.85,
          duration: "0.5s",
        });
        cam
          .at("79s")
          .animate({ scale: 1.25, duration: "0.6s", easing: "cinematic" });
        cam.at("90s").shake({
          intensityX: 10,
          intensityY: 8,
          frequency: 30,
          decay: 0.8,
          duration: "0.6s",
        });
        cam
          .at("137s")
          .animate({ scale: 1.2, duration: "0.5s", easing: "easeOut" });
        cam.at("149s").shake({
          intensityX: 12,
          intensityY: 10,
          frequency: 35,
          decay: 0.85,
          duration: "0.5s",
        });
        cam
          .at("175s")
          .animate({ scale: 1.05, duration: "2s", easing: "easeOut" });
      })

      .use(new AudioDirectorPlugin({ mood: "tension", volume: 0.12 }))
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2024-12-18T09:15:00"),
          startBattery: 85,
          batteryDrainRate: 0.5,
          updateInterval: "30s",
        }),
      ).use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )


      .build(),
});
