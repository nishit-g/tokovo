import { describe, expect, it } from "vitest";
import {
  DEFAULT_PNGTUBER_PRESET,
  PNGTUBER_PRESET_STORAGE_KEY,
  buildPngtuberPresetRecord,
  sanitizePngtuberPresetRecord,
} from "./pngtuber-presets.js";

describe("pngtuber preset helpers", () => {
  it("builds a named preset record keyed by preset id", () => {
    const record = buildPngtuberPresetRecord([
      {
        ...DEFAULT_PNGTUBER_PRESET,
        id: "chaos-cut",
        label: "Chaos Cut",
        mouthTrackProfileId: "chaos",
      },
    ]);

    expect(record["chaos-cut"]?.label).toBe("Chaos Cut");
    expect(record["chaos-cut"]?.mouthTrackProfileId).toBe("chaos");
  });

  it("sanitizes invalid persisted presets back to safe defaults", () => {
    const sanitized = sanitizePngtuberPresetRecord({
      good: {
        id: "good",
        label: "Good",
        frameKey: "deadpan",
        pulseScale: 1.06,
        mouthShape: "half",
        mouthTrackProfileId: "snappy",
      },
      broken: {
        id: "",
        label: "",
        frameKey: "bad",
        pulseScale: 8,
        mouthShape: "wide",
        mouthTrackProfileId: "",
      },
    });

    expect(sanitized.good?.frameKey).toBe("deadpan");
    expect(sanitized.broken).toEqual({
      ...DEFAULT_PNGTUBER_PRESET,
      id: "broken",
      label: "Broken",
    });
  });

  it("keeps a stable storage key for the workstation", () => {
    expect(PNGTUBER_PRESET_STORAGE_KEY).toBe("tokovo.live2d-lab.pngtuber-presets");
  });
});
