import { describe, expect, it } from "vitest";
import { WHATSAPP_UI_VERSION } from "../experience/contract.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";

describe("WhatsApp experience contract", () => {
  it("resolves a versioned serializable experience from explicit inputs", () => {
    const first = resolveWhatsAppExperience({
      platform: "ios",
      appearance: "light",
      locale: "en-US",
    });
    const second = resolveWhatsAppExperience({
      platform: "ios",
      appearance: "light",
      locale: "en-US",
    });

    expect(first.appId).toBe("app_whatsapp");
    expect(first.uiVersion).toBe(WHATSAPP_UI_VERSION);
    expect(first.presentation.platform).toBe("ios");
    expect(first.layout.app).toEqual(first.theme.uiSpacing);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("resolves Android behavior and dark visual tokens together", () => {
    const experience = resolveWhatsAppExperience({
      platform: "android",
      appearance: "dark",
      locale: "en-US",
    });

    expect(experience.presentation.navigation.tabs).not.toContain("settings");
    expect(experience.theme.platform).toBe("android");
    expect(experience.theme.colors.background).toBe("#0B141A");
  });

  it("keeps the storybook variant genuinely dark in dark appearance", () => {
    const light = resolveWhatsAppExperience({
      platform: "ios",
      appearance: "light",
      locale: "en-US",
      themeId: "whatsapp-storybook",
    });
    const dark = resolveWhatsAppExperience({
      platform: "ios",
      appearance: "dark",
      locale: "en-US",
      themeId: "whatsapp-storybook",
    });

    expect(light.theme.colors.background).toBe("#F7F2E8");
    expect(dark.theme.colors.background).toBe("#171B18");
    expect(dark.theme.colors.sentBubbleText).toBe("#F5F0E6");
    expect(dark.theme.colors.background).not.toBe(light.theme.colors.background);
  });

  it("rejects unknown legacy theme aliases instead of falling back", () => {
    expect(() =>
      resolveWhatsAppExperience({
        platform: "ios",
        appearance: "light",
        locale: "en-US",
        themeId: "storybook" as never,
      }),
    ).toThrow();
    expect(() =>
      resolveWhatsAppExperience({
        platform: "ios",
        appearance: "light",
        locale: "en-US",
        themeId: "whatsapp-cyberpunk" as never,
      }),
    ).toThrow();
  });
});
