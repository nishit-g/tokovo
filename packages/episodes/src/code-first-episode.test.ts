import { describe, expect, it } from "vitest";
import { episode } from "./code-first-episode.js";

function buildCanonicalAppTracks() {
  return episode("canonical-app-tracks", { fps: 24, duration: "3s" })
    .instagram("phone", (instagram) => {
      instagram.at("1s").navigate("home");
    })
    .linkedin("phone", (linkedin) => {
      linkedin.at("1s").navigate("feed");
    })
    .typewriter("desk", (typewriter) => {
      typewriter.at("1s").key("T");
    })
    .build();
}

describe("canonical code-first app tracks", () => {
  it("hides app factories and inherits the episode fps", () => {
    const ir = buildCanonicalAppTracks();

    expect(ir.events.map((event) => event.appId)).toEqual([
      "app_instagram",
      "app_linkedin",
      "app_typewriter",
    ]);
    expect(ir.events.map((event) => event.at)).toEqual([24, 24, 24]);
  });

  it("allocates declaration order per episode build", () => {
    expect(buildCanonicalAppTracks()).toEqual(buildCanonicalAppTracks());
  });
});
