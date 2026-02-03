import { describe, expect, it, vi } from "vitest";
import { getSoundPath } from "../audio/sounds";
import { createSoundRegistry } from "../registries/sound";
import { AudioLogger } from "../engine/logger";

describe("audio sounds", () => {
  it("resolves sound paths with fallbacks", () => {
    const registry = createSoundRegistry();

    expect(getSoundPath("/absolute.mp3", registry)).toBe("absolute.mp3");
    expect(getSoundPath("folder/file.mp3", registry)).toBe("folder/file.mp3");

    registry.register("ding", "ding.mp3");
    expect(getSoundPath("ding", registry)).toBe("sounds/ding.mp3");

    const spy = vi.spyOn(AudioLogger, "soundPathFallback");
    expect(getSoundPath("missing", registry)).toBe("sounds/missing.mp3");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
