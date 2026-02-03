import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { logger, LogCollector, createScopedLogger } from "../logger";

describe("logger (browser)", () => {
  beforeEach(() => {
    logger.configure({
      minLevel: "debug",
      components: [],
      consoleOutput: true,
      includeStackTraces: true,
    });
    logger.clearSubscribers();
  });

  afterEach(() => {
    logger.clearSubscribers();
  });

  it("logs to console and subscribers with browser styling", () => {
    const debugSpy = vi
      .spyOn(console, "debug")
      .mockImplementation(() => undefined);
    const collector = new LogCollector();
    logger.addSubscriber(collector);

    logger.debug("engine", "hello", { foo: "bar" });

    expect(debugSpy).toHaveBeenCalled();
    expect(collector.peek()).toHaveLength(1);
    expect(collector.peek()[0].component).toBe("engine");

    debugSpy.mockRestore();
  });

  it("filters by level and component and handles errors", () => {
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    logger.configure({ minLevel: "warn", components: ["engine"] });

    const collector = new LogCollector();
    logger.addSubscriber(collector);

    logger.debug("engine", "nope");
    logger.warn("engine", "warned");
    logger.error("engine", "boom", new Error("fail"));
    logger.error("engine", "boom", "string error");

    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(collector.getByLevel("warn")).toHaveLength(1);
    expect(collector.getByLevel("error")).toHaveLength(2);

    const errorEntry = collector.getByLevel("error")[0];
    expect(errorEntry.error?.name).toBe("Error");

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("supports scoped loggers and frame logging", () => {
    const infoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const scoped = createScopedLogger("engine");

    scoped.info("frame info", { ok: true });
    scoped.atFrame(5, "info", "frame message", { extra: true });

    expect(infoSpy).toHaveBeenCalled();
    infoSpy.mockRestore();
  });

  it("updates configuration helpers", () => {
    logger.setLevel("info");
    logger.enableConsole();
    logger.disableConsole();
    logger.configure({ consoleOutput: true, minLevel: "debug" });

    const config = logger.getConfig();
    expect(config.minLevel).toBe("debug");
    expect(config.consoleOutput).toBe(true);
  });

  it("manages subscribers and collector utilities", () => {
    const collector = new LogCollector(2);
    const remove = logger.addSubscriber(collector);

    logger.info("engine", "one");
    logger.info("engine", "two");
    logger.info("engine", "three");

    expect(collector.peek()).toHaveLength(2);
    expect(collector.getByComponent("engine")).toHaveLength(2);
    expect(collector.getByLevel("info")).toHaveLength(2);

    const counts = collector.getCounts();
    expect(counts.info).toBe(2);

    expect(collector.hasErrors()).toBe(false);

    const flushed = collector.flush();
    expect(flushed).toHaveLength(2);
    expect(collector.peek()).toHaveLength(0);

    remove();
    logger.removeSubscriber(collector);
    logger.clearSubscribers();

    collector.clear();
  });

  it("exposes browser logger toggle", () => {
    const globalLogger = (window as unknown as { __TOKOVO_LOGGER?: unknown })
      .__TOKOVO_LOGGER;
    expect(globalLogger).toBeDefined();
  });
});
