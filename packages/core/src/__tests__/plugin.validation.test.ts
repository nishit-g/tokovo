import { describe, expect, it, vi } from "vitest";
import type { TokovoPluginContract } from "../types/plugin-contract";
import {
  validatePluginDetailed,
  validatePlugin,
  assertPluginValid,
} from "../utils/validation";
import { validationTestUtils } from "../testing";
import { z } from "zod";

describe("plugin validation utilities", () => {
  it("collects errors and warnings", () => {
    const badPlugin = {
      id: "A",
      version: "1",
      displayName: "",
      views: {},
      reducer: "nope",
      eventKinds: ["", 123],
      assets: { sounds: { sound: "rel/path" } },
      anchors: {},
      layouts: [{ viewKind: "", computeLayout: null }],
      audioRules: [
        { match: null, sound: "" },
        { match: {}, sound: "ding" },
      ],
    } as unknown as TokovoPluginContract<string>;

    const result = validatePluginDetailed(badPlugin);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);

    expect(result.errors.some((e) => e.suggestion)).toBe(true);
  });

  it("validates array shape of event kinds", () => {
    const badKinds = {
      id: "app_test",
      version: "1.0.0",
      displayName: "Test",
      views: { AppRoot: () => null },
      eventKinds: "not-array",
    } as unknown as TokovoPluginContract<string>;

    const result = validatePluginDetailed(badKinds);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "eventKinds")).toBe(true);
  });

  it("throws on invalid plugins and warns on warnings", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const warningPlugin = {
      id: "app_test",
      version: "1",
      displayName: "Test",
      views: { AppRoot: () => null },
      assets: { sounds: { "app_test.sound": "rel/path" } },
    } as unknown as TokovoPluginContract<string>;

    expect(() => validatePlugin(warningPlugin)).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();

    const invalidPlugin = {
      id: "ab",
      version: "",
      displayName: "",
    } as unknown as TokovoPluginContract<string>;

    expect(() => validatePlugin(invalidPlugin)).toThrow();

    warnSpy.mockRestore();
  });

  it("asserts plugin validity with optional warning failures", () => {
    const warningPlugin = {
      id: "app_test",
      version: "1",
      displayName: "Test",
      views: { AppRoot: () => null },
    } as unknown as TokovoPluginContract<string>;

    expect(() => assertPluginValid(warningPlugin)).not.toThrow();
    expect(() => assertPluginValid(warningPlugin, { throwOnWarning: true })).toThrow();
  });

  it("throws for invalid plugins and handles regex issues", () => {
    const invalidPlugin = {
      id: "App",
      version: "1.0.0",
      displayName: "Bad",
      views: { AppRoot: () => null },
    } as unknown as TokovoPluginContract<string>;

    const result = validatePluginDetailed(invalidPlugin);
    expect(result.valid).toBe(false);

    expect(() => assertPluginValid(invalidPlugin)).toThrow(/Plugin validation failed/);
  });

  it("returns suggestions for zod issues when available", () => {
    const issue = {
      code: "invalid_type",
      expected: "string",
      received: "number",
      path: [],
      message: "Invalid type",
    } as z.ZodIssue;

    expect(validationTestUtils.getZodSuggestion(issue)).toBe(
      "Expected string, got number",
    );
  });

  it("returns undefined for zod issues without suggestions", () => {
    const issue = {
      code: "custom",
      path: [],
      message: "no suggestion",
    } as z.ZodIssue;

    expect(validationTestUtils.getZodSuggestion(issue)).toBeUndefined();
  });

  it("formats zod paths with root fallback", () => {
    expect(validationTestUtils.formatZodPath(["id"])).toBe("id");
    expect(validationTestUtils.formatZodPath([])).toBe("root");
  });

  it("captures zod schema issues for invalid fields", () => {
    const invalidSchema = {
      id: "app_test",
      version: "1.0.0",
      displayName: 123,
    } as unknown as TokovoPluginContract<string>;

    const result = validatePluginDetailed(invalidSchema);
    expect(result.errors.some((e) => e.field === "displayName")).toBe(true);
  });
});
