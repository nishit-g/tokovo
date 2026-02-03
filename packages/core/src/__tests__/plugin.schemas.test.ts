import { describe, expect, it } from "vitest";
import {
  validatePluginSchema,
  assertPluginSchema,
} from "../plugin/schemas";

describe("plugin schemas", () => {
  it("validates plugin contracts", () => {
    const valid = {
      id: "app_test",
      version: "1.0.0",
      displayName: "Test",
      views: { AppRoot: () => null },
    };

    const result = validatePluginSchema(valid);
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("app_test");
  });

  it("reports errors and asserts schema", () => {
    const invalid = {
      id: "A",
      version: "1",
      displayName: "",
      views: { AppRoot: "nope" },
    };

    const result = validatePluginSchema(invalid);
    expect(result.success).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);

    expect(() => assertPluginSchema(invalid)).toThrow();
  });

  it("uses root path for non-object inputs", () => {
    const result = validatePluginSchema(null);
    expect(result.success).toBe(false);
    expect(result.errors?.[0].path).toBe("root");
  });
});
