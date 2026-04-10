import { defineEpisode } from "../types/episode-definition.js";
import { episode } from "../code-first-episode.js";
import { TypewriterTrackBuilder } from "@tokovo/apps-typewriter";

let storyOrder = 0;
const nextStoryOrder = () => storyOrder++;

export default defineEpisode({
  meta: {
    id: "typewriter-story-v2",
    title: "Typewriter Story V2",
    description:
      "A new Typewriter story where a resignation letter starts as rage and ends as restraint.",
    category: "production",
    catalogType: "story",
    visibility: "public",
    sortOrder: 170,
    tags: ["story", "typewriter", "letter", "midnight"],
  },
  config: {
    format: "1080x1920",
    durationInFrames: 990,
    apps: ["app_typewriter"],
  },
  build: () =>
    episode("typewriter-story-v2", { fps: 30, duration: "33s", title: "Typewriter Story V2" })
      .background({ type: "solid", color: "#090b10" })
      .device("desk", "canvas", {
        app: "app_typewriter",
        installedApps: ["app_typewriter"],
        os: { time: new Date("2026-04-11T00:22:00"), battery: 85, network: "wifi" },
      })
      .track(
        "app_typewriter",
        () => new TypewriterTrackBuilder(30, "desk", nextStoryOrder),
        (tw) => {
          tw.at("0s").initLetter({
            to: "Dear team",
            from: "A.",
            date: "Apr 11, 2026",
            subject: "On leaving dramatically and choosing not to",
            reset: true,
            seed: 41,
            roomTone: false,
          });
          tw.span("1.0s", "20.0s").typeText(
            [
              "At 11:48 PM, I was sure this letter would be furious.",
              "",
              "By midnight, I realized I was only tired.",
              "",
              "Fury is noisy.",
              "Exhaustion is precise.",
              "",
              "So this is not a resignation.",
              "It is a boundary, written carefully enough to keep.",
            ].join("\n"),
            { cps: 28, jitter: { minFrames: -1, maxFrames: 2 }, mistakes: { rate: 0.02, max: 2 } },
          );
        },
      )
      .camera((cam) => {
        cam.at("0s").focus("paper", { scale: 1.03, duration: "0.35s" });
        cam.span("1.2s", "20.0s").trackCinematic("cursor", { scale: 1.32, smoothing: 0.22 });
      })
      .build(),
});
