import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "@tokovo/creator";
import { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";
import type { TypewriterThemeConfig } from "@tokovo/apps-typewriter";

let order = 0;
const getOrder = () => order++;

const THEME = {
  preset: "classic",
  overrides: {
    layout: { maxRows: 12, maxCols: 44, wrap: "word", bellColsFromRight: 5 },
    paper: { rotationDeg: -0.42, vignetteOpacity: 0.16, grainOpacity: 0.08, fiberOpacity: 0.07 },
    desk: { vignetteOpacity: 0.62, highlightOpacity: 0.09 },
    audio: { volVar: 0.1, roomVol: 0.14 },
  },
} as const satisfies TypewriterThemeConfig;

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
        () => new TypewriterTrackBuilder(30, "desk", getOrder, { theme: THEME }),
        (tw) => {
          tw.at("0.0s").initLetter({
            to: "To whom it may concern",
            from: "Me",
            date: "Feb 7, 2026",
            subject: "Proof that analog still hits",
            reset: true,
            seed: 42,
            // Room tone is opt-in (see typewriterLowering). Keep canary clean.
            roomTone: false,
            theme: THEME,
          });

          // We type fast early so the first ~10s (smoke replay window) exercises page feed + cursor anchors.
          tw.span("1.0s", "9.0s").typeText(
            [
              "Dear reader,",
              "",
              "This letter was typed on a machine that doesn't autocorrect.",
              "No spellcheck. No safety rails. Just ink and intent.",
              "",
              "Line by line, the paper advances.",
              "The bell dings near the margin.",
              "The carriage snaps back.",
              "",
              "If you're reading this: the canvas pipeline works.",
              "Anchors, camera, audio: deterministic.",
              "",
              "Sincerely,",
              "Tokovo",
            ].join("\n"),
            {
              cps: 30,
              jitter: { minFrames: -1, maxFrames: 2 },
              mistakes: { rate: 0.02, max: 2 },
              pauses: { afterPunctFrames: 1, afterNewlineFrames: 2, afterSpaceFrames: 0 },
            },
          );

          // Small “mistake” moment
          tw.at("24.5s").key("!");
          tw.at("24.6s").backspace();
          tw.at("24.7s").key(".");
        },
      )
      .camera((cam) => {
        cam.at("0.0s").focus("paper", { scale: 1.02, duration: "0.4s" });
        cam.span("1.8s", "10.0s").trackCinematic("cursor", {
          scale: 1.35,
          smoothing: 0.22,
        });
        cam.at("10.5s").focus("signature", { scale: 1.12, duration: "0.35s" });
        cam.at("26.0s").focus("typewriter", { scale: 1.05, duration: "0.35s" });
      })
      .build(),
});
