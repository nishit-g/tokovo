import { describe, expect, it } from "vitest";
import {
  TOKOVO_HEADLESS_PLUGIN_MANIFEST,
  requireTokovoHeadlessPlugins,
} from "./runtime/headless-plugin-manifest.js";

describe("headless app support boundary", () => {
  it("registers only fully migrated app packages", () => {
    expect(TOKOVO_HEADLESS_PLUGIN_MANIFEST.map((plugin) => plugin.id).sort()).toEqual([
      "app_whatsapp",
      "app_x",
    ]);
  });

  it("fails loudly for a package that has not crossed the migration gate", () => {
    expect(() => requireTokovoHeadlessPlugins(["app_instagram"])).toThrow(
      'TOKOVO_HEADLESS_PLUGIN_MISSING: runtime plugin "app_instagram" has no server-safe contribution.',
    );
  });

  it("resolves supported packages deterministically without duplicates", () => {
    expect(
      requireTokovoHeadlessPlugins(["app_x", "app_whatsapp", "app_x"]).map((plugin) => plugin.id),
    ).toEqual(["app_whatsapp", "app_x"]);
  });
});
