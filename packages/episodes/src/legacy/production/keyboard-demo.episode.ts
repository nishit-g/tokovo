import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "@tokovo/dsl";

export default defineEpisode({
  meta: {
    id: "keyboard-demo",
    title: "Keyboard Typing Demo ⌨️",
    description: "Demonstrates the device keyboard with typing animations",
    category: "production",
    tags: ["keyboard", "typing", "device", "animation"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 450,
    apps: [],
  },
  build: () =>
    episode("keyboard-demo", {
      fps: 30,
      duration: "15s",
      title: "Keyboard Demo",
    })
      .device("phone", "iphone16", {
        app: "app_whatsapp",
        os: {
          time: new Date("2024-12-18T14:30:00"),
          battery: 85,
          network: "5G",
        },
      })
      .background({ type: "image", src: "/backgrounds/dark-studio.png" })
      .deviceTrack("phone", (d) => {
        d.at("1s").keyboardShow({ returnKeyType: "send" });
        d.at("2s").keyboardType("Hello world!", { speed: "natural" });
        d.at("5s").keyboardKeyPress("return");
        d.at("5.5s").keyboardClear();
        d.at("6s").keyboardType("This is a typing demo", { speed: "fast" });
        d.at("9s").keyboardSetSuggestions(["Amazing!", "Great!", "Cool!"]);
        d.at("10s").keyboardTapSuggestion(0);
        d.at("13s").keyboardHide();
      })

      .camera((_cam) => {
        // cam.at("0s").set({ scale: 1 });
        // cam.at("1s").animate({ scale: 1.1, y: 200, duration: "0.5s" });
        // cam.at("13s").animate({ scale: 1, y: 0, duration: "0.5s" });
      })

      .build(),
});
