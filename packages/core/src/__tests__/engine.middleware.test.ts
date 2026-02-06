import { describe, expect, it, vi } from "vitest";
import type { TimelineEvent, WorldState } from "../types.js";
import {
  createMiddlewareRegistry,
  builtInMiddlewares,
  useMiddleware,
} from "../engine/middleware.js";

describe("MiddlewareRegistry", () => {
  it("executes middleware in order and calls core handler", () => {
    const registry = createMiddlewareRegistry();
    const calls: string[] = [];
    const unsubFirst = registry.use({
      name: "first",
      order: -10,
      middleware: (_event, _draft, _ctx, next) => {
        calls.push("first");
        next();
      },
    });
    const unsubSecond = registry.use({
      name: "second",
      order: 10,
      middleware: (_event, _draft, _ctx, next) => {
        calls.push("second");
        next();
      },
    });

    const coreHandler = () => calls.push("core");

    registry.execute(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      coreHandler,
    );

    expect(calls).toEqual(["first", "second", "core"]);
    expect(registry.getMiddlewares().length).toBe(2);
    unsubFirst();
    unsubSecond();
    registry.clear();
  });

  it("continues after middleware errors", () => {
    const registry = createMiddlewareRegistry();
    const calls: string[] = [];
    registry.use({
      name: "boom",
      middleware: () => {
        throw new Error("boom");
      },
    });
    registry.use({
      name: "after",
      middleware: (_event, _draft, _ctx, next) => {
        calls.push("after");
        next();
      },
    });

    registry.execute(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      () => calls.push("core"),
    );

    expect(calls).toEqual(["after", "core"]);
    registry.clear();
  });

  it("executes core handler when no middleware registered", () => {
    const registry = createMiddlewareRegistry();
    const core = vi.fn();
    registry.execute(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      core,
    );
    expect(core).toHaveBeenCalled();
  });

  it("registers middleware via helper", () => {
    const registry = createMiddlewareRegistry();
    const unsub = useMiddleware(registry, "helper", (_event, _draft, _ctx, next) => next());
    expect(registry.getMiddlewares().length).toBeGreaterThan(0);
    unsub();
    registry.clear();
  });

  it("runs built-in logging middleware", () => {
    const perfSpy = vi
      .spyOn(performance, "now")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(5);

    const next = vi.fn();
    builtInMiddlewares.logging.middleware(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      next,
    );

    expect(next).toHaveBeenCalled();
    perfSpy.mockRestore();
  });

  it("runs built-in error recovery middleware", () => {
    const next = vi.fn(() => {
      throw new Error("boom");
    });

    builtInMiddlewares.errorRecovery.middleware(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
