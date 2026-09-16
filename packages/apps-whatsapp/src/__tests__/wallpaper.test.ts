import { expect, it } from "vitest";
import { wallpaperLayerSizing } from "../components/MessageList.js";

it("sizes both glow layers independently so doodles never inherit full-screen sizing", () => {
  expect(wallpaperLayerSizing(120)).toEqual({
    backgroundRepeat: "no-repeat, no-repeat, repeat",
    backgroundSize: "100% 100%, 100% 100%, 120px 120px",
  });
  expect(wallpaperLayerSizing().backgroundSize.endsWith("180px 180px")).toBe(true);
});
