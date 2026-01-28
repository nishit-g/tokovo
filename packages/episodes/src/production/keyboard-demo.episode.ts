import { defineEpisode } from "../types/episode-definition";
import { episode } from "@tokovo/dsl";
import { KeyboardTrackBuilder } from "@tokovo/device-keyboard";

let orderCounter = 0;
const getOrder = () => orderCounter++;

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

      .track(
        "device_keyboard",
        () => new KeyboardTrackBuilder(30, "phone", getOrder),
        (keyboard) => {
          keyboard.show("1s", { returnKeyType: "send" });

          keyboard.type("Hello world!", "2s", { speed: "natural" });

          keyboard.pressReturn("5s");

          keyboard.clear("5.5s");

          keyboard.type("This is a typing demo", "6s", { speed: "fast" });

          keyboard.suggest(["Amazing!", "Great!", "Cool!"], "9s");
          keyboard.tapSuggestion(0, "10s");

          keyboard.hide("13s");
        },
      )

      .camera((cam) => {
        // cam.at("0s").set({ scale: 1 });
        // cam.at("1s").animate({ scale: 1.1, y: 200, duration: "0.5s" });
        // cam.at("13s").animate({ scale: 1, y: 0, duration: "0.5s" });
      })

      .build(),
});
