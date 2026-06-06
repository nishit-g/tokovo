// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

describe("logger (node)", () => {
  it("logs without browser styling and omits stack traces when disabled", async () => {
    vi.resetModules();
    const mod = await import("../logger");
    const { getLogger, LogCollector } = mod;
    const logger = getLogger();

    logger.configure({
      minLevel: "debug",
      components: [],
      consoleOutput: true,
      includeStackTraces: false,
    });
    logger.clearSubscribers();

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    const collector = new LogCollector();
    logger.addSubscriber(collector);

    logger.info("engine", "node log", { alpha: true });
    logger.error("engine", "oops", new Error("boom"));

    expect(infoSpy).toHaveBeenCalled();
    const message = infoSpy.mock.calls[0][0];
    expect(String(message)).toContain("[engine]");
    expect(String(message)).not.toContain("%c");

    const errorEntry = collector.getByLevel("error")[0];
    expect(errorEntry.error?.stack).toBeUndefined();

    infoSpy.mockRestore();

    expect((globalThis as any).__TOKOVO_LOGGER).toBeUndefined();
  });

  it("maps the quiet profile to warning-only file-safe logging", async () => {
    vi.resetModules();
    const mod = await import("../logger");
    const { configureLoggerFromEnv } = mod;

    expect(configureLoggerFromEnv({ TOKOVO_LOG_PROFILE: "quiet" })).toMatchObject({
      minLevel: "warn",
      consoleOutput: false,
      includeStackTraces: false,
    });
  });
});
