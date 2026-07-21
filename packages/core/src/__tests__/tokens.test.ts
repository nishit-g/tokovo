import { describe, expect, it } from "vitest";
import {
  iOSTokens,
  androidTokens,
  getTokens,
  getTypography,
  sharedStyles,
} from "../tokens.js";

describe("tokens", () => {
  it("returns platform tokens", () => {
    expect(getTokens("ios")).toBe(iOSTokens);
    expect(getTokens("android")).toBe(androidTokens);
  });

  it("maps semantic typography", () => {
    const iosBody = getTypography("ios", "body");
    const androidBody = getTypography("android", "body");
    expect(iosBody.fontSize).toBe(iOSTokens.typography.body.fontSize);
    expect(androidBody.fontSize).toBe(androidTokens.typography.bodyLarge.fontSize);
  });

  it("exposes platform-neutral shared styles", () => {
    expect(sharedStyles.flexCenter.display).toBe("flex");
  });
});
