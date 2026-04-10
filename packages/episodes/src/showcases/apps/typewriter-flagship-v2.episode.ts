import { defineEpisode } from "../../types/episode-definition.js";
import { episode } from "../../code-first-episode.js";
import { TypewriterTrackBuilder, type TypewriterThemeConfig } from "@tokovo/apps-typewriter";

let flagshipOrder = 0;
const nextFlagshipOrder = () => flagshipOrder++;

const TYPEWRITER_FLAGSHIP_THEME = {
  preset: "classic",
  overrides: {
    layout: { maxRows: 13, maxCols: 44, wrap: "word", bellColsFromRight: 5 },
    paper: { rotationDeg: -0.3, vignetteOpacity: 0.14, grainOpacity: 0.08, fiberOpacity: 0.08 },
    desk: { vignetteOpacity: 0.56, highlightOpacity: 0.08 },
  },
} as const satisfies TypewriterThemeConfig;

export default defineEpisode({
  meta: {
    id: "typewriter-flagship-v2",
    title: "Typewriter Flagship V2",
    description:
      "Fresh Typewriter flagship proving the canvas surface, mechanical typing rhythm, and cursor-aware camera tracking.",
    category: "showcase",
    catalogType: "app_showcase_flagship",
    appId: "app_typewriter",
    visibility: "public",
    sortOrder: 800,
    tags: ["typewriter", "flagship", "canvas", "typing", "camera"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 990,
    apps: ["app_typewriter"],
  },
  build: () =>
    episode("typewriter-flagship-v2", { fps: 30, duration: "33s", title: "Typewriter Flagship V2" })
      .background({ type: "solid", color: "#090b10" })
      .device("desk", "canvas", {
        app: "app_typewriter",
        installedApps: ["app_typewriter"],
        os: { time: new Date("2026-04-10T23:50:00"), battery: 91, network: "wifi" },
      })
      .track(
        "app_typewriter",
        () => new TypewriterTrackBuilder(30, "desk", nextFlagshipOrder, { theme: TYPEWRITER_FLAGSHIP_THEME }),
        (tw) => {
          tw.at("0s").initLetter({
            to: "To the team",
            from: "Ira",
            date: "Apr 10, 2026",
            subject: "Why we still build tactile tools",
            reset: true,
            seed: 17,
            roomTone: false,
            theme: TYPEWRITER_FLAGSHIP_THEME,
          });
          tw.span("1.0s", "20.0s").typeText(
            [
              "The point of a tactile surface is not nostalgia.",
              "",
              "It is pace.",
              "It makes every sentence pay rent.",
              "",
              "When the keys hit, the idea has to mean enough",
              "to deserve the noise it makes.",
              "",
              "That is still good product discipline.",
            ].join("\n"),
            { cps: 28, jitter: { minFrames: -1, maxFrames: 2 }, mistakes: { rate: 0.02, max: 2 }, pauses: { afterPunctFrames: 1, afterNewlineFrames: 2, afterSpaceFrames: 0 } },
          );
          tw.at("23.0s").key("—");
          tw.at("23.2s").backspace();
          tw.at("23.4s").key(".");
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("paper", { scale: 1.03, duration: "0.4s" });
        cam.span("1.4s", "19.8s").trackCinematic("cursor", { scale: 1.32, smoothing: 0.22 });
        cam.at("24.0s").focus("signature", { scale: 1.08, duration: "0.35s" });
      })
      .build(),
});
