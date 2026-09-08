import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { WorldState } from "@tokovo/core";
import { StoryOverlay } from "../overlays/StoryOverlay.js";

vi.mock("remotion", () => ({
  Img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props),
  AnimatedImage: (props: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement("img", props),
  staticFile: (src: string) => src,
}));

describe("performer continuity", () => {
  it("holds opaque poses at their boundaries and moves a ducking performer out of frame", () => {
    const render = (t: number, performerMotion: "hold" | "duck" = "hold") => renderToStaticMarkup(
      <StoryOverlay width={1080} height={1920} t={t} world={{ capabilityState: {
        overlay: { items: [{
          id: "pose", variant: "performer", lane: "actor", startFrame: 30, endFrame: 60,
          mediaSrc: "/actor.png", xPct: 0.8, yPct: 0.4, widthPct: 0.7, performerMotion,
        }] },
      } } as unknown as WorldState} />,
    );
    expect(render(29)).toBe("");
    for (const frame of [30, 31, 59]) {
      expect(render(frame)).toContain("opacity:1");
      expect(render(frame)).toContain("width:756px");
      expect(render(frame)).toContain("translateY(0px)");
    }
    expect(render(45, "duck")).toContain("translateY(480px)");
    expect(render(60)).toBe("");
  });
});
