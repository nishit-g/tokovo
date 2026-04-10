import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { drama_example } from "@tokovo/voice";
import { CameraDirectorPlugin, OSDirectorPlugin, KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "integration-test",
    title: "Integration Test - Full Feature Showcase",
    description:
      "Comprehensive test episode exercising all major features: voice, WhatsApp, OS notifications, camera effects, and audio bus integration",
    category: "production",
    tags: [
      "test",
      "integration",
      "voice",
      "camera",
      "notifications",
      "ducking",
    ],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1350,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("integration-test", {
      fps: 30,
      duration: "45s",
      title: "Integration Test - Full Feature Showcase",
      description:
        "Comprehensive test episode exercising all major features including voice-to-audio bus ducking",
    })
      .voice(drama_example, (v) => {
        v.at("2s").play("seg_0");
        v.at("10s").play("seg_1");
        v.at("22s").play("seg_2");
        v.at("35s").play("seg_3");
      })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2025-01-29T14:30:00"),
          battery: 85,
          network: "wifi",
        },
      })
      .snapshot("app_whatsapp", "phone", {
        conversations: [
          { id: "dm_alice", name: "Alice", avatar: "/avatars/alice.png" },
          { id: "dm_bob", name: "Bob", avatar: "/avatars/bob.png" },
        ],
      })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_alice", getOrder);
        },
        (wa) => {
          wa.switchTo("dm_alice", "0s");
          wa.at("1s").receive(
            "Alice",
            "Hey! Are you coming to the party tonight? 🎉",
          );

          wa.span("3s", "4s").typing("me");
          wa.at("4s").send("Yes! I'll be there around 8pm");

          wa.at("6s").receive(
            "Alice",
            "Perfect! Charlie is bringing the cake 🎂",
          );

          wa.span("7.5s", "8.5s").typing("them");
          wa.at("8.5s").receive("Alice", "Can you bring some drinks?");

          wa.span("11s", "12s").typing("me");
          wa.at("12s").send("Of course! What should I get?");

          wa.at("14s").receive("Alice", "Some sodas and juice would be great!");

          wa.span("15.5s", "16.5s").typing("them");
          wa.at("16.5s").receive("Alice", "Also, Bob is coming too!");

          wa.span("18s", "19s").typing("me");
          wa.at("19s").send("Awesome! Haven't seen Bob in ages 😊");

          wa.at("21s").receive("Alice", "I know right? It'll be fun!");

          wa.span("24s", "25s").typing("them");
          wa.at("25s").receive("Alice", "The theme is 80s retro btw");

          wa.span("26.5s", "27.5s").typing("me");
          wa.at("27.5s").send("Oh nice! I have the perfect outfit 🕺");

          wa.at("29s").receive("Alice", "Can't wait to see it!");

          wa.span("31s", "32s").typing("them");
          wa.at("32s").receive("Alice", "Party starts at 7pm sharp");

          wa.span("33.5s", "34.5s").typing("me");
          wa.at("34.5s").send("Got it! See you soon! 🙌");

          wa.at("37s").receive("Alice", "See you! Don't be late! 😄");

          wa.span("39s", "40s").typing("them");
          wa.at("40s").receive("Alice", "This is going to be epic!");

          wa.span("42s", "43s").typing("me");
          wa.at("43s").send("100%! 🎊🎉");
        },
      )

      .os((os) => {
        os.at("0s").time(new Date("2025-01-29T14:30:00"));
        os.at("0s").battery(85);
        os.at("0s").network("wifi");

        os.at("1s").notification({
          appId: "app_whatsapp",
          title: "Alice",
          body: "Hey! Are you coming to the party...",
          icon: "/avatars/alice.png",
        });

        os.at("6s").notification({
          appId: "app_whatsapp",
          title: "Alice",
          body: "Perfect! Charlie is bringing the cake 🎂",
          icon: "/avatars/alice.png",
        });

        os.at("14s").notification({
          appId: "app_instagram",
          title: "Instagram",
          body: "party_vibes liked your story",
          icon: "/avatars/instagram.png",
        });

        os.at("15s").time(new Date("2025-01-29T14:31:00"));

        os.at("16.5s").notification({
          appId: "app_whatsapp",
          title: "Alice",
          body: "Also, Bob is coming too!",
          icon: "/avatars/alice.png",
        });

        os.at("20s").battery(84);

        os.at("25s").notification({
          appId: "app_whatsapp",
          title: "Alice",
          body: "The theme is 80s retro btw",
          icon: "/avatars/alice.png",
        });

        os.at("30s").time(new Date("2025-01-29T14:32:00"));
        os.at("30s").network("5G");

        os.at("32s").notification({
          appId: "app_whatsapp",
          title: "Alice",
          body: "Party starts at 7pm sharp",
          icon: "/avatars/alice.png",
        });

        os.at("37s").notification({
          appId: "app_spotify",
          title: "Spotify",
          body: "Your 80s playlist is ready!",
          icon: "/avatars/spotify.png",
        });

        os.at("40s").notification({
          appId: "app_whatsapp",
          title: "Alice",
          body: "This is going to be epic!",
          icon: "/avatars/alice.png",
        });

        os.at("44s").battery(83);
      })

      .use(new CameraDirectorPlugin())
      .use(
        new OSDirectorPlugin({
          startTime: new Date("2024-12-17T14:30:00"),
          startBattery: 67,
          batteryDrainRate: 1,
          updateInterval: "10s",
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
