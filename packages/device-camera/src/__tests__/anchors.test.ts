import { describe, test, expect, beforeEach } from "vitest";
import {
  registerAnchorProvider,
  unregisterAnchorProvider,
  getAnchorProvider,
  hasAnchorProvider,
  getAnchorsForApp,
  getAnchorFraming,
  getRegisteredAppIds,
  clearAnchorProviders,
  getProviderCount,
} from "../anchors/index.js";
import {
  resolveAnchorWithFallback,
  anchorToOrigin,
  calculateFillScale,
  resolveAnchorFully,
} from "../anchors/resolver.js";
import type { AnchorProvider, Rect, AnchorSnapshot } from "../anchors/types.js";
import { DEFAULT_FRAMING } from "../anchors/types.js";
import type { WorldState } from "@tokovo/core";

describe("camera anchor system", () => {
  beforeEach(() => {
    clearAnchorProviders();
  });

  describe("anchor provider registration", () => {
    test("registers anchor provider for app", () => {
      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {},
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev1",
          appId: "test_app",
        }),
      };

      registerAnchorProvider(provider);
      const retrieved = getAnchorProvider("test_app");

      expect(retrieved).toBeDefined();
      expect(retrieved?.appId).toBe("test_app");
    });

    test("overwrites existing provider with same appId", () => {
      const provider1: AnchorProvider = {
        appId: "app1",
        framing: { anchor1: DEFAULT_FRAMING },
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev1",
          appId: "app1",
        }),
      };

      const provider2: AnchorProvider = {
        appId: "app1",
        framing: { anchor2: DEFAULT_FRAMING },
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev2",
          appId: "app1",
        }),
      };

      registerAnchorProvider(provider1);
      registerAnchorProvider(provider2);

      const retrieved = getAnchorProvider("app1");
      expect(retrieved?.framing).toHaveProperty("anchor2");
      expect(retrieved?.framing).not.toHaveProperty("anchor1");
    });

    test("hasAnchorProvider returns correct status", () => {
      expect(hasAnchorProvider("nonexistent")).toBe(false);

      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {},
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev1",
          appId: "test_app",
        }),
      };

      registerAnchorProvider(provider);
      expect(hasAnchorProvider("test_app")).toBe(true);
    });

    test("unregisterAnchorProvider removes provider", () => {
      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {},
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev1",
          appId: "test_app",
        }),
      };

      registerAnchorProvider(provider);
      expect(hasAnchorProvider("test_app")).toBe(true);

      const removed = unregisterAnchorProvider("test_app");
      expect(removed).toBe(true);
      expect(hasAnchorProvider("test_app")).toBe(false);
    });

    test("unregisterAnchorProvider returns false for nonexistent provider", () => {
      const removed = unregisterAnchorProvider("nonexistent");
      expect(removed).toBe(false);
    });
  });

  describe("getAnchorsForApp", () => {
    test("returns empty snapshot when provider not found", () => {
      const result = getAnchorsForApp("nonexistent", {} as WorldState, {}, "dev1");

      expect(result.anchors).toEqual({});
      expect(result.deviceId).toBe("");
      expect(result.appId).toBe("");
    });

    test("calls provider getAnchors and returns snapshot", () => {
      const mockAnchors: Record<string, Rect> = {
        lastMessage: { x: 10, y: 100, width: 300, height: 50 },
        inputArea: { x: 10, y: 500, width: 300, height: 40 },
      };

      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {},
        getAnchors: (world, layout, deviceId) => ({
          anchors: mockAnchors,
          deviceId,
          appId: "test_app",
        }),
      };

      registerAnchorProvider(provider);

      const result = getAnchorsForApp(
        "test_app",
        { mockWorld: true } as unknown as WorldState,
        { mockLayout: true },
        "device1",
      );

      expect(result.anchors).toEqual(mockAnchors);
      expect(result.deviceId).toBe("device1");
      expect(result.appId).toBe("test_app");
    });
  });

  describe("getAnchorFraming", () => {
    test("returns default framing when provider not found", () => {
      const framing = getAnchorFraming("nonexistent", "anchor1");
      expect(framing).toEqual(DEFAULT_FRAMING);
    });

    test("returns default framing when anchor not in provider", () => {
      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {
          anchor1: { anchorPoint: { x: 0.3, y: 0.7 }, targetFill: 0.5 },
        },
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev1",
          appId: "test_app",
        }),
      };

      registerAnchorProvider(provider);

      const framing = getAnchorFraming("test_app", "anchor2");
      expect(framing).toEqual(DEFAULT_FRAMING);
    });

    test("returns custom framing when defined", () => {
      const customFraming = {
        anchorPoint: { x: 0.3, y: 0.7 },
        targetFill: 0.8,
        paddingPx: 10,
      };

      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {
          lastMessage: customFraming,
        },
        getAnchors: () => ({
          anchors: {},
          deviceId: "dev1",
          appId: "test_app",
        }),
      };

      registerAnchorProvider(provider);

      const framing = getAnchorFraming("test_app", "lastMessage");
      expect(framing).toEqual(customFraming);
    });
  });

  describe("registry utilities", () => {
    test("getRegisteredAppIds returns empty array initially", () => {
      expect(getRegisteredAppIds()).toEqual([]);
    });

    test("getRegisteredAppIds returns all registered app IDs", () => {
      const provider1: AnchorProvider = {
        appId: "app1",
        framing: {},
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "app1" }),
      };
      const provider2: AnchorProvider = {
        appId: "app2",
        framing: {},
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "app2" }),
      };

      registerAnchorProvider(provider1);
      registerAnchorProvider(provider2);

      const appIds = getRegisteredAppIds();
      expect(appIds).toContain("app1");
      expect(appIds).toContain("app2");
      expect(appIds).toHaveLength(2);
    });

    test("getProviderCount returns correct count", () => {
      expect(getProviderCount()).toBe(0);

      const provider1: AnchorProvider = {
        appId: "app1",
        framing: {},
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "app1" }),
      };
      registerAnchorProvider(provider1);
      expect(getProviderCount()).toBe(1);

      const provider2: AnchorProvider = {
        appId: "app2",
        framing: {},
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "app2" }),
      };
      registerAnchorProvider(provider2);
      expect(getProviderCount()).toBe(2);
    });

    test("clearAnchorProviders removes all providers", () => {
      const provider1: AnchorProvider = {
        appId: "app1",
        framing: {},
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "app1" }),
      };
      const provider2: AnchorProvider = {
        appId: "app2",
        framing: {},
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "app2" }),
      };

      registerAnchorProvider(provider1);
      registerAnchorProvider(provider2);
      expect(getProviderCount()).toBe(2);

      clearAnchorProviders();
      expect(getProviderCount()).toBe(0);
      expect(getRegisteredAppIds()).toEqual([]);
    });
  });

  describe("resolveAnchorWithFallback", () => {
    test("returns direct match when anchor exists", () => {
      const anchors = {
        lastMessage: { x: 10, y: 100, width: 300, height: 50 },
      };

      const result = resolveAnchorWithFallback("lastMessage", anchors);

      expect(result.anchor).toBe("lastMessage");
      expect(result.isFallback).toBe(false);
      expect(result.rect).toEqual(anchors.lastMessage);
    });

    test("uses fallback chain when primary not found", () => {
      const anchors = {
        content: { x: 0, y: 100, width: 400, height: 600 },
      };

      const result = resolveAnchorWithFallback("lastMessage", anchors);

      expect(result.anchor).toBe("content");
      expect(result.isFallback).toBe(true);
      expect(result.rect).toEqual(anchors.content);
    });

    test("falls back to viewport when no anchors match", () => {
      const anchors = {};
      const viewport = { width: 400, height: 800 };

      const result = resolveAnchorWithFallback(
        "lastMessage",
        anchors,
        viewport,
      );

      expect(result.anchor).toBe("device");
      expect(result.isFallback).toBe(true);
      expect(result.rect).toEqual({ x: 0, y: 0, width: 400, height: 800 });
    });

    test("returns default rect when no viewport and no anchors", () => {
      const anchors = {};

      const result = resolveAnchorWithFallback("lastMessage", anchors);

      expect(result.anchor).toBe("unknown");
      expect(result.isFallback).toBe(true);
      expect(result.rect.width).toBe(300);
      expect(result.rect.height).toBe(500);
    });

    test("follows correct fallback chain for inputArea", () => {
      const anchors = {
        app: { x: 0, y: 0, width: 400, height: 800 },
      };

      const result = resolveAnchorWithFallback("inputArea", anchors);

      expect(result.anchor).toBe("app");
      expect(result.isFallback).toBe(true);
    });

    test("uses default fallback chain for unknown anchor", () => {
      const anchors = {
        device: { x: 0, y: 0, width: 400, height: 800 },
      };

      const result = resolveAnchorWithFallback("customAnchor", anchors);

      expect(result.anchor).toBe("device");
      expect(result.isFallback).toBe(true);
    });
  });

  describe("anchorToOrigin", () => {
    test("converts rect center to viewport-normalized origin", () => {
      const resolved = {
        rect: { x: 50, y: 100, width: 300, height: 200 },
        anchor: "test",
        isFallback: false,
      };
      const framing = {
        anchorPoint: { x: 0.5, y: 0.5 },
        targetFill: 0.6,
      };
      const viewport = { width: 400, height: 800 };

      const result = anchorToOrigin(resolved, framing, viewport);

      expect(result.originX).toBeCloseTo(0.5, 2);
      expect(result.originY).toBeCloseTo(0.25, 2);
    });

    test("handles custom anchor points", () => {
      const resolved = {
        rect: { x: 0, y: 0, width: 400, height: 200 },
        anchor: "test",
        isFallback: false,
      };
      const framing = {
        anchorPoint: { x: 0.25, y: 0.75 },
        targetFill: 0.6,
      };
      const viewport = { width: 400, height: 800 };

      const result = anchorToOrigin(resolved, framing, viewport);

      expect(result.originX).toBeCloseTo(0.25, 2);
      expect(result.originY).toBeCloseTo(0.1875, 2);
    });

    test("clamps origin to 0-1 range", () => {
      const resolved = {
        rect: { x: 500, y: 900, width: 100, height: 100 },
        anchor: "test",
        isFallback: false,
      };
      const framing = {
        anchorPoint: { x: 1.0, y: 1.0 },
        targetFill: 0.6,
      };
      const viewport = { width: 400, height: 800 };

      const result = anchorToOrigin(resolved, framing, viewport);

      expect(result.originX).toBe(1);
      expect(result.originY).toBe(1);
    });
  });

  describe("calculateFillScale", () => {
    test("calculates scale to fill 60% of viewport by default", () => {
      const rect = { x: 0, y: 0, width: 200, height: 300 };
      const viewport = { width: 400, height: 800 };

      const scale = calculateFillScale(rect, viewport);

      expect(scale).toBeGreaterThan(1);
      expect(scale).toBeLessThan(2.5);
    });

    test("respects custom target fill", () => {
      const rect = { x: 0, y: 0, width: 200, height: 300 };
      const viewport = { width: 400, height: 800 };

      const scale80 = calculateFillScale(rect, viewport, 0.8);
      const scale40 = calculateFillScale(rect, viewport, 0.4);

      expect(scale80).toBeGreaterThan(scale40);
    });

    test("clamps scale to maximum of 2.5", () => {
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      const viewport = { width: 400, height: 800 };

      const scale = calculateFillScale(rect, viewport, 0.9);

      expect(scale).toBe(2.5);
    });

    test("clamps scale to minimum of 1.0", () => {
      const rect = { x: 0, y: 0, width: 400, height: 800 };
      const viewport = { width: 400, height: 800 };

      const scale = calculateFillScale(rect, viewport, 0.3);

      expect(scale).toBe(1);
    });

    test("handles near-zero rect size safely", () => {
      const rect = { x: 0, y: 0, width: 0.001, height: 0.001 };
      const viewport = { width: 400, height: 800 };

      const scale = calculateFillScale(rect, viewport);

      expect(scale).toBe(1);
    });
  });

  describe("resolveAnchorFully", () => {
    beforeEach(() => {
      const provider: AnchorProvider = {
        appId: "test_app",
        framing: {
          lastMessage: {
            anchorPoint: { x: 0.5, y: 0.5 },
            targetFill: 0.7,
            paddingPx: 10,
          },
        },
        getAnchors: () => ({ anchors: {}, deviceId: "", appId: "test_app" }),
      };
      registerAnchorProvider(provider);
    });

    test("resolves anchor to complete transform parameters", () => {
      const snapshot: AnchorSnapshot = {
        anchors: {
          lastMessage: { x: 50, y: 200, width: 300, height: 100 },
        },
        deviceId: "dev1",
        appId: "test_app",
      };
      const viewport = { width: 400, height: 800 };

      const result = resolveAnchorFully(
        "lastMessage",
        snapshot,
        "test_app",
        viewport,
      );

      expect(result.originX).toBeGreaterThan(0);
      expect(result.originX).toBeLessThanOrEqual(1);
      expect(result.originY).toBeGreaterThan(0);
      expect(result.originY).toBeLessThanOrEqual(1);
      expect(result.suggestedScale).toBeGreaterThanOrEqual(1);
      expect(result.suggestedScale).toBeLessThanOrEqual(2.5);
      expect(result.isFallback).toBe(false);
      expect(result.resolvedAnchor).toBe("lastMessage");
    });

    test("includes fallback information when using fallback", () => {
      const snapshot: AnchorSnapshot = {
        anchors: {
          content: { x: 0, y: 100, width: 400, height: 600 },
        },
        deviceId: "dev1",
        appId: "test_app",
      };
      const viewport = { width: 400, height: 800 };

      const result = resolveAnchorFully(
        "lastMessage",
        snapshot,
        "test_app",
        viewport,
      );

      expect(result.isFallback).toBe(true);
      expect(result.resolvedAnchor).toBe("content");
    });

    test("uses default framing for unregistered anchor", () => {
      const snapshot: AnchorSnapshot = {
        anchors: {
          customAnchor: { x: 100, y: 200, width: 200, height: 150 },
        },
        deviceId: "dev1",
        appId: "test_app",
      };
      const viewport = { width: 400, height: 800 };

      const result = resolveAnchorFully(
        "customAnchor",
        snapshot,
        "test_app",
        viewport,
      );

      expect(result).toBeDefined();
      expect(result.resolvedAnchor).toBe("customAnchor");
    });

    test("combines all resolution functions correctly", () => {
      const snapshot: AnchorSnapshot = {
        anchors: {
          inputArea: { x: 10, y: 700, width: 380, height: 50 },
        },
        deviceId: "dev1",
        appId: "test_app",
      };
      const viewport = { width: 400, height: 800 };

      const result = resolveAnchorFully(
        "inputArea",
        snapshot,
        "test_app",
        viewport,
      );

      expect(result.originX).toBeCloseTo(0.5, 1);
      expect(result.originY).toBeGreaterThan(0.8);
      expect(result.suggestedScale).toBeGreaterThanOrEqual(1);
    });
  });
});
