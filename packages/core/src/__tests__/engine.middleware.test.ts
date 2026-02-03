import { describe, expect, it, vi } from "vitest";
import type { TimelineEvent, WorldState } from "../types";
import {
  MiddlewareRegistry,
  builtInMiddlewares,
  useMiddleware,
} from "../engine/middleware";

describe("MiddlewareRegistry", () => {
  it("executes middleware in order and calls core handler", () => {
    const calls: string[] = [];
    const unsubFirst = MiddlewareRegistry.use({
      name: "first",
      order: -10,
      middleware: (_event, _draft, _ctx, next) => {
        calls.push("first");
        next();
      },
    });
    const unsubSecond = MiddlewareRegistry.use({
      name: "second",
      order: 10,
      middleware: (_event, _draft, _ctx, next) => {
        calls.push("second");
        next();
      },
    });

    const coreHandler = () => calls.push("core");

    MiddlewareRegistry.execute(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      coreHandler,
    );

    expect(calls).toEqual(["first", "second", "core"]);
    expect(MiddlewareRegistry.getMiddlewares().length).toBe(2);
    unsubFirst();
    unsubSecond();
    MiddlewareRegistry.clear();
  });

  it("continues after middleware errors", () => {
    const calls: string[] = [];
    MiddlewareRegistry.use({
      name: "boom",
      middleware: () => {
        throw new Error("boom");
      },
    });
    MiddlewareRegistry.use({
      name: "after",
      middleware: (_event, _draft, _ctx, next) => {
        calls.push("after");
        next();
      },
    });

    MiddlewareRegistry.execute(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      () => calls.push("core"),
    );

    expect(calls).toEqual(["after", "core"]);
    MiddlewareRegistry.clear();
  });

  it("executes core handler when no middleware registered", () => {
    const core = vi.fn();
    MiddlewareRegistry.execute(
      { kind: "TEST" } as TimelineEvent,
      {} as WorldState,
      { frame: 1, mode: "preview", eventIndex: 0 },
      core,
    );
    expect(core).toHaveBeenCalled();
  });

  it("registers middleware via helper", () => {
    const unsub = useMiddleware("helper", (_event, _draft, _ctx, next) => next());
    expect(MiddlewareRegistry.getMiddlewares().length).toBeGreaterThan(0);
    unsub();
    MiddlewareRegistry.clear();
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
