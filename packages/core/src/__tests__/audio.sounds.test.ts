import { describe, expect, it } from "vitest";
import { getSoundPath } from "../audio/sounds.js";
import { createSoundRegistry } from "../registries/sound.js";

describe("audio sounds", () => {
  it("resolves only explicit sound paths and registrations", () => {
    const registry = createSoundRegistry();

    expect(getSoundPath("/absolute.mp3", registry)).toBe("absolute.mp3");
    expect(getSoundPath("folder/file.mp3", registry)).toBe("folder/file.mp3");

    registry.register("ding", "ding.mp3");
    expect(getSoundPath("ding", registry)).toBe("sounds/ding.mp3");

    expect(() => getSoundPath("missing", registry)).toThrow(
      'SOUND_NOT_REGISTERED: "missing"',
    );
  });
});
