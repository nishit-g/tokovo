import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp/src/dsl/track-builder";
import { drama_example } from "@tokovo/voice";
import { KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "voice-demo",
    title: "Voice Demo - Drama Narration",
    description:
      "Demo episode showing voice narration with gaps between segments",
    category: "production",
    tags: ["voice", "demo", "narration", "whatsapp"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 600,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("voice-demo", {
      fps: 30,
      duration: "20s",
      title: "Voice Demo - Drama Narration",
      description:
        "Demo episode showing voice narration with gaps between segments",
    })
      .voice(drama_example, (v) => {
        v.at("0s").play("seg_0");
        v.at("5s").play("seg_1");
        v.at("12s").play("seg_2");
        v.at("16s").play("seg_3");
      })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          { id: "dm_sarah", name: "Sarah", avatar: "/avatars/sarah.png" },
        ],
        os: {
          time: new Date("2024-12-18T21:30:00"),
          battery: 64,
          network: "5G",
        },
      })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_sarah", getOrder);
        },
        (wa) => {
          wa.span("4s", "5s").typing("them");
          wa.at("5s").receive(
            "Sarah",
            "Oh my god, I can't believe this is happening!",
          );

          wa.span("6s", "7s").typing("me");
          wa.at("7s").send("Wait, what's going on? 😰");

          wa.span("8s", "9s").typing("them");
          wa.at("9s").receive("Sarah", "I'll explain later...");

          wa.span("12.5s", "13.5s").typing("them");
          wa.at("13.5s").receive("Sarah", "But wait... there's more.");

          wa.span("14.5s", "15.5s").typing("me");
          wa.at("15.5s").send("More?! What do you mean?");

          wa.span("16.5s", "17.5s").typing("them");
          wa.at("17.5s").receive(
            "Sarah",
            "I never should have opened that message...",
          );

          wa.span("18.5s", "19.5s").typing("me");
          wa.at("19.5s").send("What message?!");
        },
      )

      .os((os) => {
        os.at("0s").time(new Date("2024-12-18T21:30:00"));

        os.at("5s").notification({
          appId: "app_whatsapp",
          title: "Sarah",
          body: "Oh my god, I can't believe this is...",
          icon: "/avatars/sarah.png",
        });

        os.at("9s").notification({
          appId: "app_instagram",
          title: "Instagram",
          body: "mike_jones liked your photo",
          icon: "/avatars/instagram.png",
        });

        os.at("13.5s").notification({
          appId: "app_whatsapp",
          title: "Sarah",
          body: "But wait... there's more.",
          icon: "/avatars/sarah.png",
        });

        os.at("17.5s").notification({
          appId: "app_whatsapp",
          title: "Sarah",
          body: "I never should have opened that...",
          icon: "/avatars/sarah.png",
        });
      })

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });

        cam.at("0s").animate({
          scale: 1.03,
          duration: "2s",
          easing: "easeOut",
        });

        cam.at("5s").animate({
          scale: 1.08,
          duration: "0.5s",
          easing: "easeOut",
        });

        cam.at("12s").animate({
          scale: 1.12,
          duration: "0.8s",
          easing: "cinematic",
        });

        cam.at("16s").shake({
          intensityX: 6,
          intensityY: 5,
          frequency: 22,
          decay: 0.8,
          duration: "0.6s",
        });

        cam.at("18s").animate({
          scale: 1.2,
          duration: "1.5s",
          easing: "easeIn",
        });
      }).use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )


      .build(),
});
