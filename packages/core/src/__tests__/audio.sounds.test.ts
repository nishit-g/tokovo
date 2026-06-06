import { describe, expect, it } from "vitest";
import { getSoundPath } from "../audio/sounds.js";
import { createSoundRegistry } from "../registries/sound.js";
import { getLogger, LogCollector } from "../logger/index.js";

describe("audio sounds", () => {
  it("resolves sound paths with fallbacks", () => {
    const registry = createSoundRegistry();

    expect(getSoundPath("/absolute.mp3", registry)).toBe("absolute.mp3");
    expect(getSoundPath("folder/file.mp3", registry)).toBe("folder/file.mp3");

    registry.register("ding", "ding.mp3");
    expect(getSoundPath("ding", registry)).toBe("sounds/ding.mp3");

    const collector = new LogCollector();
    const logger = getLogger();
    logger.configure({ consoleOutput: false, minLevel: "debug", components: [] });
    logger.clearSinks();
    logger.addSink(collector);
    expect(getSoundPath("missing", registry)).toBe("sounds/missing.wav");
    expect(collector.peek().some((entry) => entry.event === "audio.sound_path_fallback")).toBe(
      true,
    );
  });
});
