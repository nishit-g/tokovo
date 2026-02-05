import { describe, it, expect } from "vitest";
import { CameraDirector } from "../director";
import { BehaviorRegistry } from "../behaviors";
import { CameraContextBuilder } from "../context";
import type { CameraEvent } from "../types";

describe("CameraDirector", () => {
  const createMessageEvent = (
    id: string,
    from: string,
    timestamp: number,
    order: number,
  ): CameraEvent => ({
    id,
    type: "MESSAGE_RECEIVED",
    timestamp,
    priority: "normal",
    payload: {
      from,
      text: `Message ${order}`,
      order,
      anchor: `message-${order}`,
    },
  });

  describe("choreograph", () => {
    it("should handle empty event list", () => {
      const director = new CameraDirector({ fps: 30 });
      const result = director.choreograph([]);

      expect(result.effects).toEqual([]);
      expect(result.eventCount).toBe(0);
      expect(result.behaviorStats.size).toBe(0);
    });

    it("should generate effects for single message", () => {
      const director = new CameraDirector({ fps: 30 });
      const events = [createMessageEvent("msg-1", "Alex", 30, 0)];

      const result = director.choreograph(events);

      expect(result.eventCount).toBe(1);
      expect(result.effects.length).toBeGreaterThan(0);
      expect(result.effects[0].type).toBe("focus");
    });

    it("should detect message bursts and handle appropriately", () => {
      const director = new CameraDirector({ fps: 30 });
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "Alex", 60, 1),
        createMessageEvent("msg-3", "Alex", 90, 2),
      ];

      const result = director.choreograph(events);

      expect(result.eventCount).toBe(3);

      const focusEffects = result.effects.filter((e) => e.type === "focus");
      expect(focusEffects.length).toBe(3);

      const animateEffects = result.effects.filter((e) => e.type === "animate");
      expect(animateEffects.length).toBeGreaterThan(0);
    });

    it("should handle turn changes between senders", () => {
      const director = new CameraDirector({ fps: 30 });
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "Alex", 60, 1),
        createMessageEvent("msg-3", "me", 210, 2),
        createMessageEvent("msg-4", "me", 240, 3),
      ];

      const result = director.choreograph(events);

      const focusEffects = result.effects.filter((e) => e.type === "focus");
      expect(focusEffects.length).toBe(4);

      const resetEffects = result.effects.filter((e) => e.type === "reset");
      expect(resetEffects.length).toBe(0);
    });

    it("should sort effects by timestamp and priority", () => {
      const director = new CameraDirector({ fps: 30 });
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "Alex", 60, 1),
      ];

      const result = director.choreograph(events);

      for (let i = 1; i < result.effects.length; i++) {
        const prev = result.effects[i - 1];
        const curr = result.effects[i];

        if (prev.timestamp === curr.timestamp) {
          const prevPriority = prev.priority || 0;
          const currPriority = curr.priority || 0;
          expect(prevPriority).toBeGreaterThanOrEqual(currPriority);
        } else {
          expect(prev.timestamp).toBeLessThanOrEqual(curr.timestamp);
        }
      }
    });

    it("should deduplicate identical effects", () => {
      const director = new CameraDirector({ fps: 30 });
      const events = [createMessageEvent("msg-1", "Alex", 30, 0)];

      const result = director.choreograph(events);

      const effectKeys = result.effects.map(
        (e) => `${e.timestamp}-${e.type}-${JSON.stringify(e.params)}`,
      );
      const uniqueKeys = new Set(effectKeys);

      expect(effectKeys.length).toBe(uniqueKeys.size);
    });

    it("should apply custom behavior config", () => {
      const director = new CameraDirector({ fps: 30 });
      const events = [createMessageEvent("msg-1", "Alex", 30, 0)];

      const result = director.choreograph(events, {
        MESSAGE_RECEIVED: "fluid-tennis-casual",
      });

      expect(result.behaviorStats.get("fluid-tennis-casual")).toBe(1);
    });
  });

  describe("BehaviorRegistry", () => {
    it("should resolve built-in presets", () => {
      const registry = new BehaviorRegistry();

      expect(registry.has("fluid-tennis-casual")).toBe(true);
      expect(registry.has("fluid-tennis-energetic")).toBe(true);
      expect(registry.has("fluid-tennis-dramatic")).toBe(true);
      expect(registry.has("interrupt-focus")).toBe(true);
      expect(registry.has("drift-anticipation")).toBe(true);
      expect(registry.has("static")).toBe(true);
    });

    it("should register custom behaviors", () => {
      const registry = new BehaviorRegistry();
      const customBehavior = () => null;

      registry.register("custom-test", customBehavior);

      expect(registry.has("custom-test")).toBe(true);
      expect(registry.get("custom-test")).toBe(customBehavior);
    });

    it("should throw on unknown preset", () => {
      const registry = new BehaviorRegistry();

      expect(() => registry.resolve("unknown-preset")).toThrow(
        /Unknown behavior preset/,
      );
    });
  });

  describe("CameraContextBuilder", () => {
    it("should detect burst continuation correctly", () => {
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "Alex", 60, 1),
        createMessageEvent("msg-3", "Alex", 90, 2),
      ];

      const context = new CameraContextBuilder(events, 30);

      expect(context.isBurstContinuation(events[0])).toBe(false);
      expect(context.isBurstContinuation(events[1])).toBe(true);
      expect(context.isBurstContinuation(events[2])).toBe(true);
    });

    it("should detect turn starts correctly", () => {
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "Alex", 60, 1),
        createMessageEvent("msg-3", "me", 210, 2),
      ];

      const context = new CameraContextBuilder(events, 30);

      expect(context.isTurnStart(events[0])).toBe(true);
      expect(context.isTurnStart(events[1])).toBe(false);
      expect(context.isTurnStart(events[2])).toBe(true);
    });

    it("should calculate burst index correctly", () => {
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "Alex", 60, 1),
        createMessageEvent("msg-3", "Alex", 90, 2),
      ];

      const context = new CameraContextBuilder(events, 30);

      expect(context.getBurstIndex(events[0])).toBe(0);
      expect(context.getBurstIndex(events[1])).toBe(1);
      expect(context.getBurstIndex(events[2])).toBe(2);
    });

    it("should detect conversation rhythm", () => {
      const fastEvents = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "me", 40, 1),
        createMessageEvent("msg-3", "Alex", 50, 2),
      ];

      const slowEvents = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "me", 180, 1),
        createMessageEvent("msg-3", "Alex", 360, 2),
      ];

      const fastContext = new CameraContextBuilder(fastEvents, 30);
      const slowContext = new CameraContextBuilder(slowEvents, 30);

      expect(fastContext.getConversationRhythm()).toBe("fast");
      expect(slowContext.getConversationRhythm()).toBe("slow");
    });

    it("should get previous and next events", () => {
      const events = [
        createMessageEvent("msg-1", "Alex", 30, 0),
        createMessageEvent("msg-2", "me", 60, 1),
        createMessageEvent("msg-3", "Alex", 90, 2),
      ];

      const context = new CameraContextBuilder(events, 30);

      expect(context.getPreviousEvent(events[1])).toBe(events[0]);
      expect(context.getNextEvent(events[1])).toBe(events[2]);
      expect(context.getPreviousEvent(events[0])).toBeNull();
      expect(context.getNextEvent(events[2])).toBeNull();
    });
  });
});
