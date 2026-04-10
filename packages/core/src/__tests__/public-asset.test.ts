import { describe, expect, it } from "vitest";

import {
  getPublicAssetBaseUrl,
  isPublicAssetPath,
  isR2AssetLocator,
  resolveMappedAssetUrl,
  resolvePublicAssetUrl,
  resolveStaticAssetSrc,
} from "../utils/public-asset.js";

describe("public asset helpers", () => {
  it("detects public asset paths", () => {
    expect(isPublicAssetPath("/avatars/alex.png")).toBe(true);
    expect(isPublicAssetPath("sounds/app/message.wav")).toBe(true);
    expect(isPublicAssetPath("https://cdn.example.com/a.png")).toBe(false);
    expect(isPublicAssetPath("r2://tokovo/assets/a.png")).toBe(false);
    expect(isPublicAssetPath("data:image/png;base64,abc")).toBe(false);
  });

  it("detects r2 locators", () => {
    expect(isR2AssetLocator("r2://tokovo/assets/a.png")).toBe(true);
    expect(isR2AssetLocator("/avatars/alex.png")).toBe(false);
  });

  it("reads the public asset base URL from env", () => {
    expect(
      getPublicAssetBaseUrl({
        TOKOVO_PUBLIC_ASSET_BASE_URL: "https://assets.example.com/media",
      }),
    ).toBe("https://assets.example.com/media");
  });

  it("resolves public asset paths against the configured base URL", () => {
    expect(
      resolvePublicAssetUrl("/avatars/alex.png", {
        TOKOVO_PUBLIC_ASSET_BASE_URL: "https://assets.example.com/media",
      }),
    ).toBe("https://assets.example.com/media/avatars/alex.png");

    expect(
      resolvePublicAssetUrl("sounds/app/message.wav", {
        TOKOVO_PUBLIC_ASSET_BASE_URL: "https://assets.example.com/media/",
      }),
    ).toBe("https://assets.example.com/media/sounds/app/message.wav");
  });

  it("falls back to the static resolver when no base URL is configured", () => {
    expect(
      resolveStaticAssetSrc(
        "/avatars/alex.png",
        (path) => `static://${path}`,
        {},
      ),
    ).toBe("static:///avatars/alex.png");
  });

  it("keeps remote URLs untouched", () => {
    expect(
      resolveStaticAssetSrc(
        "https://cdn.example.com/video.mp4",
        (path) => `static://${path}`,
        {
          TOKOVO_PUBLIC_ASSET_BASE_URL: "https://assets.example.com/media",
        },
      ),
    ).toBe("https://cdn.example.com/video.mp4");
  });

  it("resolves asset URLs from the env-backed asset map", () => {
    expect(
      resolveMappedAssetUrl("r2://tokovo/assets/a.png", {
        TOKOVO_ASSET_URL_MAP: JSON.stringify({
          "r2://tokovo/assets/a.png": "https://signed.example.com/a.png",
        }),
      }),
    ).toBe("https://signed.example.com/a.png");
  });
});
