import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/creator";
import { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";

let order = 0;
const getOrder = () => order++;

export default defineEpisode({
  meta: {
    id: "typewriter-letter",
    title: "Typewriter Letter (Canvas Baseline)",
    description: "Full-canvas desk + mechanical typewriter + paper baseline.",
    category: "production",
    tags: ["canvas", "typewriter", "letter", "v2"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 900,
    apps: ["app_typewriter"],
  },
  build: () =>
    episode("typewriter-letter", { fps: 30, duration: "30s" })
      .background({ type: "solid", color: "#07080a" })
      .device("desk", "canvas", {
        app: "app_typewriter",
        installedApps: ["app_typewriter"],
        os: { time: new Date("2026-02-07T09:15:00"), battery: 82, network: "wifi" },
      })
      .track(
        "app_typewriter",
        () => new TypewriterTrackBuilder(30, "desk", getOrder),
        (tw) => {
          tw.at("0.0s").initLetter({
            to: "To whom it may concern",
            from: "Me",
            date: "Feb 7, 2026",
            subject: "Proof that analog still hits",
            reset: true,
          });

          tw.span("1.0s", "24.0s").typeText(
            [
              "Dear reader,",
              "",
              "This letter was typed on a machine that doesn't autocorrect,",
              "doesn't judge, and definitely doesn't ask for permissions.",
              "",
              "If you're reading this, the canvas device pipeline works.",
              "Paper, cursor, anchors, camera, audio: all deterministic.",
              "",
              "Sincerely,",
              "Tokovo",
            ].join("\n"),
            { cps: 16 },
          );

          // Small “mistake” moment
          tw.at("24.5s").key("!");
          tw.at("24.6s").backspace();
          tw.at("24.7s").key(".");
        },
      )
      .camera((cam) => {
        cam.at("0.0s").focus("paper", { scale: 1.02, duration: "0.4s" });
        cam.span("2.0s", "24.0s").trackCinematic("cursor", {
          scale: 1.35,
          smoothing: 0.22,
        });
        cam.at("26.0s").focus("typewriter", { scale: 1.05, duration: "0.35s" });
      })
      .build(),
});

