import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { TypewriterTrackBuilder, type TypewriterThemeConfig } from "@tokovo/apps-typewriter";

let exhaustiveOrder = 0;
const nextExhaustiveOrder = () => exhaustiveOrder++;

const TYPEWRITER_EXHAUSTIVE_THEME = {
  preset: "classic",
  overrides: {
    layout: { maxRows: 12, maxCols: 42, wrap: "word", bellColsFromRight: 4 },
    paper: { rotationDeg: -0.42, vignetteOpacity: 0.18, grainOpacity: 0.1, fiberOpacity: 0.08 },
    desk: { vignetteOpacity: 0.62, highlightOpacity: 0.09 },
  },
} as const satisfies TypewriterThemeConfig;

export default defineEpisode({
  meta: {
    id: "typewriter-exhaustive-v2",
    title: "Typewriter Exhaustive V2",
    description:
      "Dense Typewriter proof with long-form typing, page flow, cursor tracking, mistakes, backspaces, and signature close.",
    category: "showcase",
    catalogType: "app_showcase_exhaustive",
    appId: "app_typewriter",
    visibility: "public",
    sortOrder: 810,
    tags: ["typewriter", "exhaustive", "pageflow", "cursor", "audio"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 1380,
    apps: ["app_typewriter"],
  },
  build: () =>
    episode("typewriter-exhaustive-v2", { fps: 30, duration: "46s", title: "Typewriter Exhaustive V2" })
      .background({ type: "solid", color: "#07080a" })
      .device("desk", "canvas", {
        app: "app_typewriter",
        installedApps: ["app_typewriter"],
        os: { time: new Date("2026-04-11T00:10:00"), battery: 88, network: "wifi" },
      })
      .track(
        "app_typewriter",
        () => new TypewriterTrackBuilder(30, "desk", nextExhaustiveOrder, { theme: TYPEWRITER_EXHAUSTIVE_THEME }),
        (tw) => {
          tw.at("0s").initLetter({
            to: "To the archive",
            from: "Aarav",
            date: "Apr 11, 2026",
            subject: "Evidence of a deliberate interface",
            reset: true,
            seed: 27,
            roomTone: false,
            theme: TYPEWRITER_EXHAUSTIVE_THEME,
          });
          tw.span("1.0s", "33.0s").typeText(
            [
              "Every precise interface should have an equivalent in sound.",
              "",
              "Not music.",
              "Consequence.",
              "",
              "The bell warns you before the margin.",
              "The carriage tells you the line is over.",
              "The paper itself teaches pacing by refusing to hurry.",
              "",
              "That is what we keep forgetting when we over-animate:",
              "speed is not the same thing as confidence.",
              "",
              "Good rhythm makes even a plain sentence feel intentional.",
              "",
              "And intentional work ages better than loud work.",
            ].join("\n"),
            { cps: 30, jitter: { minFrames: -1, maxFrames: 2 }, mistakes: { rate: 0.025, max: 3 }, pauses: { afterPunctFrames: 1, afterNewlineFrames: 2, afterSpaceFrames: 0 } },
          );
          tw.at("35.0s").key("!");
          tw.at("35.2s").backspace();
          tw.at("35.4s").key(".");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("paper", { scale: 1.02, duration: "0.35s" });
        cam.span("1.6s", "33.2s").trackCinematic("cursor", { scale: 1.35, smoothing: 0.22 });
        cam.at("36.0s").focus("typewriter", { scale: 1.06, duration: "0.35s" });
      })
      .build(),
});
