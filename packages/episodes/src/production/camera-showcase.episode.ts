import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/dsl";
import { WhatsAppTrackBuilder } from "@tokovo/apps-whatsapp";
import { KeyboardPlugin } from "@tokovo/compiler";

let orderCounter = 0;
const getOrder = () => orderCounter++;

export default defineEpisode({
  meta: {
    id: "camera-showcase",
    title: "Camera System Showcase",
    description:
      "Demo of all camera effects: spring physics, shake, punch-zoom, dutch-tilt, flash",
    category: "production",
    tags: ["camera", "demo", "showcase", "effects"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1200,
    apps: ["app_whatsapp"],
  },
  build: () =>
    episode("camera-showcase", {
      fps: 30,
      duration: "40s",
      title: "Camera System Showcase",
      description: "Demo of all camera effects",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        conversations: [
          {
            id: "dm_camera",
            name: "Camera Demo 🎬",
            avatar: "/avatars/demo-avatar.jpg",
          },
        ],
        os: {
          time: new Date("2024-12-20T14:00:00"),
          battery: 85,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })

      .track(
        "app_whatsapp",
        () => {
          return new WhatsAppTrackBuilder(30, "phone", "dm_camera", getOrder);
        },
        (wa) => {
          wa.switchTo("dm_camera", "0s");
          wa.at("1s").receive("Demo", "Welcome to the Camera Showcase! 🎥");
          wa.at("3s").receive("Demo", "Let's see spring physics zoom...");
          wa.at("6s").receive("Demo", "Notice the bouncy, natural motion!");
          wa.at("9s").receive("Demo", "Now watch the focus with spring...");
          wa.at("12s").receive("Demo", "Smooth and organic! ✨");
          wa.at("15s").receive("Demo", "Time for some SHAKE! 💥");
          wa.at("17s").receive("Demo", "Perlin noise + trauma decay!");
          wa.at("20s").receive("Demo", "PUNCH ZOOM for impact! 👊");
          wa.at("23s").receive("Demo", "Dutch tilt for tension...");
          wa.at("26s").receive("Demo", "Something unsettling... 😰");
          wa.at("29s").receive("Demo", "FLASH! ⚡");
          wa.at("31s").receive("Demo", "Camera reset with spring...");
          wa.at("34s").receive("Demo", "Back to normal, smoothly!");
          wa.at("37s").receive("Demo", "That's all the camera effects! 🎬");
        },
      )

      .camera((cam) => {
        cam.at("0s").set({ scale: 1 });

        cam.at("3s").animate({
          scale: 1.3,
          duration: "1s",
          easing: "easeOut",
        });

        cam.at("6s").reset({ duration: "0.8s", spring: "bouncy" });

        cam.at("9s").focus("lastMessage", {
          scale: 1.2,
          duration: "1s",
          easing: "easeOut",
        });

        cam.at("12s").focus("device", {
          scale: 1.04,
          duration: "0.6s",
          easing: "easeOut",
        });

        cam.at("15s").shake({
          intensityX: 8,
          intensityY: 6,
          frequency: 15,
          decay: 0.85,
          duration: "1.5s",
        });

        cam.at("20s").punchZoom({
          intensity: 0.2,
          direction: "in",
          duration: "0.5s",
          spring: "punch",
        });

        cam.at("23s").dutchTilt({
          angle: 8,
          duration: "1s",
          spring: "dramatic",
        });

        cam.at("26s").dutchTilt({
          angle: -5,
          duration: "0.8s",
          spring: "cinematic",
        });

        cam.at("29s").flash({
          color: "white",
          intensity: 1,
          duration: "0.2s",
        });

        cam.at("31s").reset({
          duration: "1.5s",
          spring: "cinematic",
        });

        cam.at("37s").animate({
          scale: 1.05,
          duration: "1s",
          easing: "easeOut",
        });
      })

      .audio((audio) => {
        audio
          .span("0s", "40s")
          .bgm("ambient_soft", { volume: 0.1, fadeIn: "2s", fadeOut: "2s" });
      })

      .mark("intro", "1s")
      .mark("spring_zoom", "3s")
      .mark("spring_focus", "9s")
      .mark("shake_demo", "15s")
      .mark("punch_zoom", "20s")
      .mark("dutch_tilt", "23s")
      .mark("flash", "29s")
      .mark("reset", "31s")
      .mark("finale", "37s")

      .section("intro", "0s", "3s")
      .section("spring_physics", "3s", "15s")
      .section("shake", "15s", "20s")
      .section("impact_effects", "20s", "31s")
      .section("outro", "31s", "40s").use(
        new KeyboardPlugin({
          onlyForSentMessages: true,
          defaultCharDelay: 3,
          excludeShortMessages: 3,
        }),
      )


      .build(),
});
