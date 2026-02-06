import { describe, expect, it } from "vitest";
import {
  iOSTokens,
  androidTokens,
  getTokens,
  getTypography,
  getAppConfig,
  sharedStyles,
  appConfigs,
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

  it("exposes shared styles and app configs", () => {
    expect(sharedStyles.flexCenter.display).toBe("flex");
    expect(appConfigs.whatsapp.ios.headerHeight).toBeGreaterThan(0);
  });

  it("falls back to ios app config when platform is missing", () => {
    const fallback = getAppConfig("whatsapp", "web" as any);
    expect(fallback).toBe(appConfigs.whatsapp.ios);
  });
});
