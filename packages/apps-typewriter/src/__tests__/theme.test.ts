import { describe, expect, it } from "vitest";
import { resolveTypewriterTheme } from "../theme/resolve.js";

describe("typewriter theme geometry", () => {
  it("fails loudly when an override removes canonical design geometry", () => {
    expect(() =>
      resolveTypewriterTheme({
        config: { overrides: { designWidth: 0 } },
        video: { width: 1080, height: 1920 },
      }),
    ).toThrow(/TYPEWRITER_THEME_DESIGN_WIDTH_INVALID/);
  });

  it("scales pixel tokens from the declared design width", () => {
    const theme = resolveTypewriterTheme({
      video: { width: 540, height: 960 },
    });

    expect(theme.designWidth).toBe(1080);
    expect(theme.paper.maxWidthPx).toBe(470);
  });
});
