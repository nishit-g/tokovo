import { describe, test, expect } from "vitest";
import { processActiveEffects } from "../processors";
import { DEFAULT_CAMERA_TRANSFORM as DEFAULT_TRANSFORM } from "@tokovo/core";
import type {
  CameraEffect,
  ZoomEffect,
  ShakeEffect,
  FocusEffect,
  TrackEffect,
  ResetEffect,
  PanEffect,
  DollyEffect,
  KenBurnsEffect,
  PunchZoomEffect,
  DutchTiltEffect,
  FlashEffect,
  WhipPanEffect,
} from "../types";
import type { CameraTransform } from "@tokovo/core";

describe("camera processors", () => {
  describe("processActiveEffects", () => {
    test("returns initial transform when no effects are active", () => {
      const result = processActiveEffects(0, []);
      expect(result).toEqual(DEFAULT_TRANSFORM);
    });

    test("returns initial transform when frame is before effect starts", () => {
      const effects: CameraEffect[] = [
        {
          type: "zoom",
          id: "zoom_10",
          startFrame: 10,
          endFrame: 40,
          targetScale: 2.0,
          easing: "ease-out",
        },
      ];

      const result = processActiveEffects(5, effects);
      expect(result).toEqual(DEFAULT_TRANSFORM);
    });

    test("persists final state for completed persistent effects", () => {
      const effects: CameraEffect[] = [
        {
          type: "zoom",
          id: "zoom_10",
          startFrame: 10,
          endFrame: 40,
          targetScale: 2.0,
          easing: "ease-out",
        },
      ];

      const result = processActiveEffects(50, effects);
      expect(result.scale).toBeCloseTo(2, 2);
    });

    test("processes single active zoom effect", () => {
      const effects: CameraEffect[] = [
        {
          type: "zoom",
          id: "zoom_0",
          startFrame: 0,
          endFrame: 30,
          targetScale: 2.0,
          easing: "ease-out",
        },
      ];

      const result = processActiveEffects(15, effects);
      expect(result.scale).toBeGreaterThan(1.0);
      expect(result.scale).toBeLessThan(2.0);
    });

    test("processes multiple active effects sequentially", () => {
      const effects: CameraEffect[] = [
        {
          type: "zoom",
          id: "zoom_0",
          startFrame: 0,
          endFrame: 30,
          targetScale: 1.5,
          easing: "ease-out",
        },
        {
          type: "shake",
          id: "shake_0",
          startFrame: 0,
          endFrame: 30,
          intensity: 5,
          easing: "ease-out",
        },
      ];

      const result = processActiveEffects(15, effects);
      expect(result.scale).toBeGreaterThan(1.0);
      expect(result.shakeX).not.toBe(0);
      expect(result.shakeY).not.toBe(0);
    });

    test("uses custom initial transform", () => {
      const customTransform: CameraTransform = {
        ...DEFAULT_TRANSFORM,
        scale: 1.2,
        translateX: 10,
      };

      const effects: CameraEffect[] = [
        {
          type: "reset",
          id: "reset_0",
          startFrame: 0,
          endFrame: 30,
          easing: "ease-out",
        },
      ];

      const result = processActiveEffects(15, effects, customTransform);
      expect(result.scale).toBeLessThan(1.2);
      expect(result.scale).toBeGreaterThan(1.0);
    });

    test("handles effects with no registered processor gracefully", () => {
      const effects = [
        {
          type: "unknown-effect" as any,
          id: "unknown_0",
          startFrame: 0,
          endFrame: 30,
          easing: "ease-out" as const,
        },
      ];

      const result = processActiveEffects(15, effects);
      expect(result).toEqual(DEFAULT_TRANSFORM);
    });
  });

  describe("zoom processor", () => {
    test("interpolates scale from 1 to targetScale", () => {
      const effect: ZoomEffect = {
        type: "zoom",
        id: "zoom_0",
        startFrame: 0,
        endFrame: 30,
        targetScale: 2.0,
        easing: "ease-out",
      };

      const resultStart = processActiveEffects(0, [effect]);
      const resultMid = processActiveEffects(15, [effect]);
      const resultEnd = processActiveEffects(29, [effect]);

      expect(resultStart.scale).toBeCloseTo(1.0, 1);
      expect(resultMid.scale).toBeGreaterThan(1.0);
      expect(resultMid.scale).toBeLessThan(2.0);
      expect(resultEnd.scale).toBeCloseTo(2.0, 1);
    });

    test("applies translate offsets", () => {
      const effect: ZoomEffect = {
        type: "zoom",
        id: "zoom_0",
        startFrame: 0,
        endFrame: 30,
        targetScale: 1.5,
        targetX: 100,
        targetY: 50,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.translateX).toBeGreaterThan(0);
      expect(result.translateX).toBeLessThan(100);
      expect(result.translateY).toBeGreaterThan(0);
      expect(result.translateY).toBeLessThan(50);
    });

    test("sets origin when specified", () => {
      const effect: ZoomEffect = {
        type: "zoom",
        id: "zoom_0",
        startFrame: 0,
        endFrame: 30,
        targetScale: 2.0,
        originX: 0.3,
        originY: 0.7,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.originX).toBe(0.3);
      expect(result.originY).toBe(0.7);
    });

    test("uses max delta when multiple zoom effects overlap", () => {
      const effects: ZoomEffect[] = [
        {
          type: "zoom",
          id: "zoom_1",
          startFrame: 0,
          endFrame: 30,
          targetScale: 1.5,
          easing: "ease-out",
        },
        {
          type: "zoom",
          id: "zoom_2",
          startFrame: 0,
          endFrame: 30,
          targetScale: 2.0,
          easing: "ease-out",
        },
      ];

      const result = processActiveEffects(15, effects);
      expect(result.scale).toBeGreaterThan(1.5);
    });
  });

  describe("shake processor", () => {
    test("generates shake offsets", () => {
      const effect: ShakeEffect = {
        type: "shake",
        id: "shake_0",
        startFrame: 0,
        endFrame: 30,
        intensity: 10,
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(Math.abs(result.shakeX)).toBeGreaterThan(0);
      expect(Math.abs(result.shakeY)).toBeGreaterThan(0);
    });

    test("shake decays over time", () => {
      const effect: ShakeEffect = {
        type: "shake",
        id: "shake_0",
        startFrame: 0,
        endFrame: 100,
        intensity: 10,
        decay: 0.9,
        easing: "ease-out",
      };

      const resultEarly = processActiveEffects(5, [effect]);
      const resultLate = processActiveEffects(50, [effect]);

      const earlyMagnitude = Math.sqrt(
        resultEarly.shakeX ** 2 + resultEarly.shakeY ** 2,
      );
      const lateMagnitude = Math.sqrt(
        resultLate.shakeX ** 2 + resultLate.shakeY ** 2,
      );

      expect(earlyMagnitude).toBeGreaterThan(lateMagnitude);
    });

    test("respects separate intensityX and intensityY", () => {
      const effect: ShakeEffect = {
        type: "shake",
        id: "shake_0",
        startFrame: 0,
        endFrame: 30,
        intensity: 5,
        intensityX: 20,
        intensityY: 2,
        easing: "ease-out",
      };

      const result = processActiveEffects(10, [effect]);
      expect(result.shakeX).toBeDefined();
      expect(result.shakeY).toBeDefined();
    });

    test("shake is deterministic for same frame", () => {
      const effect: ShakeEffect = {
        type: "shake",
        id: "shake_0",
        startFrame: 0,
        endFrame: 30,
        intensity: 10,
        easing: "ease-out",
      };

      const result1 = processActiveEffects(15, [effect]);
      const result2 = processActiveEffects(15, [effect]);

      expect(result1.shakeX).toBe(result2.shakeX);
      expect(result1.shakeY).toBe(result2.shakeY);
    });
  });

  describe("reset processor", () => {
    test("interpolates all transform properties back to default", () => {
      const customTransform: CameraTransform = {
        scale: 2.0,
        translateX: 100,
        translateY: 50,
        originX: 0.3,
        originY: 0.7,
        rotation: 15,
        shakeX: 5,
        shakeY: 3,
      };

      const effect: ResetEffect = {
        type: "reset",
        id: "reset_0",
        startFrame: 0,
        endFrame: 30,
        easing: "ease-out",
      };

      const resultMid = processActiveEffects(15, [effect], customTransform);

      expect(resultMid.scale).toBeLessThan(2.0);
      expect(resultMid.scale).toBeGreaterThan(1.0);
      expect(resultMid.translateX).toBeLessThan(100);
      expect(resultMid.translateX).toBeGreaterThan(0);
      expect(resultMid.originX).toBeCloseTo(0.5, 1);
      expect(resultMid.originY).toBeCloseTo(0.5, 1);
    });

    test("fully resets at end frame", () => {
      const customTransform: CameraTransform = {
        scale: 2.0,
        translateX: 100,
        translateY: 50,
        originX: 0.3,
        originY: 0.7,
        rotation: 15,
        shakeX: 5,
        shakeY: 3,
      };

      const effect: ResetEffect = {
        type: "reset",
        id: "reset_0",
        startFrame: 0,
        endFrame: 30,
        easing: "ease-out",
      };

      const resultEnd = processActiveEffects(29, [effect], customTransform);

      expect(resultEnd.scale).toBeCloseTo(1.0, 1);
      expect(resultEnd.translateX).toBeCloseTo(0, 1);
      expect(resultEnd.translateY).toBeCloseTo(0, 1);
      expect(resultEnd.originX).toBeCloseTo(0.5, 1);
      expect(resultEnd.originY).toBeCloseTo(0.5, 1);
      expect(resultEnd.rotation).toBeCloseTo(0, 1);
    });
  });

  describe("pan processor", () => {
    test("applies deltaX and deltaY", () => {
      const effect: PanEffect = {
        type: "pan",
        id: "pan_0",
        startFrame: 0,
        endFrame: 30,
        deltaX: 100,
        deltaY: 50,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.translateX).toBeGreaterThan(0);
      expect(result.translateX).toBeLessThan(100);
      expect(result.translateY).toBeGreaterThan(0);
      expect(result.translateY).toBeLessThan(50);
    });

    test("does not affect scale", () => {
      const effect: PanEffect = {
        type: "pan",
        id: "pan_0",
        startFrame: 0,
        endFrame: 30,
        deltaX: 100,
        deltaY: 50,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.scale).toBe(1);
    });
  });

  describe("dolly processor", () => {
    test("interpolates scale and translateY together", () => {
      const effect: DollyEffect = {
        type: "dolly",
        id: "dolly_0",
        startFrame: 0,
        endFrame: 30,
        startScale: 1.0,
        endScale: 2.0,
        startTranslateY: 0,
        endTranslateY: 50,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.scale).toBeGreaterThan(1.0);
      expect(result.scale).toBeLessThan(2.0);
      expect(result.translateY).toBeGreaterThan(0);
      expect(result.translateY).toBeLessThan(50);
    });
  });

  describe("ken-burns processor", () => {
    test("interpolates scale and origin together", () => {
      const effect: KenBurnsEffect = {
        type: "ken-burns",
        id: "kb_0",
        startFrame: 0,
        endFrame: 30,
        startScale: 1.0,
        endScale: 1.5,
        startOriginX: 0.3,
        startOriginY: 0.3,
        endOriginX: 0.7,
        endOriginY: 0.7,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.scale).toBeGreaterThan(1.0);
      expect(result.scale).toBeLessThan(1.5);
      expect(result.originX).toBeGreaterThan(0.3);
      expect(result.originX).toBeLessThan(0.7);
      expect(result.originY).toBeGreaterThan(0.3);
      expect(result.originY).toBeLessThan(0.7);
    });
  });

  describe("punch-zoom processor", () => {
    test("creates punch-in effect with spring (multiplies scale)", () => {
      const effect: PunchZoomEffect = {
        type: "punch-zoom",
        id: "punch_0",
        startFrame: 0,
        endFrame: 30,
        intensity: 0.2,
        direction: "in",
        spring: "punch",
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result.scale).toBeDefined();
      expect(typeof result.scale).toBe("number");
    });

    test("creates punch-out effect (multiplies scale)", () => {
      const effect: PunchZoomEffect = {
        type: "punch-zoom",
        id: "punch_0",
        startFrame: 0,
        endFrame: 30,
        intensity: 0.2,
        direction: "out",
        spring: "punch",
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result.scale).toBeDefined();
      expect(typeof result.scale).toBe("number");
    });
  });

  describe("dutch-tilt processor", () => {
    test("applies rotation with spring physics (may overshoot)", () => {
      const effect: DutchTiltEffect = {
        type: "dutch-tilt",
        id: "tilt_0",
        startFrame: 0,
        endFrame: 30,
        angle: 10,
        spring: "dramatic",
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.rotation).toBeGreaterThan(0);
    });

    test("accumulates rotation with existing transform", () => {
      const customTransform: CameraTransform = {
        ...DEFAULT_TRANSFORM,
        rotation: 5,
      };

      const effect: DutchTiltEffect = {
        type: "dutch-tilt",
        id: "tilt_0",
        startFrame: 0,
        endFrame: 30,
        angle: 10,
        spring: "dramatic",
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect], customTransform);
      expect(result.rotation).toBeGreaterThan(5);
    });
  });

  describe("flash processor", () => {
    test("returns transform unchanged (visual effect only)", () => {
      const effect: FlashEffect = {
        type: "flash",
        id: "flash_0",
        startFrame: 0,
        endFrame: 10,
        color: "white",
        intensity: 1,
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result).toEqual(DEFAULT_TRANSFORM);
    });
  });

  describe("whip-pan processor", () => {
    test("applies horizontal pan for left direction", () => {
      const effect: WhipPanEffect = {
        type: "whip-pan",
        id: "whip_0",
        startFrame: 0,
        endFrame: 10,
        direction: "left",
        blur: 20,
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result.translateX).toBeLessThan(0);
    });

    test("applies horizontal pan for right direction", () => {
      const effect: WhipPanEffect = {
        type: "whip-pan",
        id: "whip_0",
        startFrame: 0,
        endFrame: 10,
        direction: "right",
        blur: 20,
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result.translateX).toBeGreaterThan(0);
    });

    test("applies vertical pan for up direction", () => {
      const effect: WhipPanEffect = {
        type: "whip-pan",
        id: "whip_0",
        startFrame: 0,
        endFrame: 10,
        direction: "up",
        blur: 20,
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result.translateY).toBeLessThan(0);
    });

    test("applies vertical pan for down direction", () => {
      const effect: WhipPanEffect = {
        type: "whip-pan",
        id: "whip_0",
        startFrame: 0,
        endFrame: 10,
        direction: "down",
        blur: 20,
        easing: "ease-out",
      };

      const result = processActiveEffects(5, [effect]);
      expect(result.translateY).toBeGreaterThan(0);
    });

    test("uses sine curve for smooth whip motion (peaks at midpoint)", () => {
      const effect: WhipPanEffect = {
        type: "whip-pan",
        id: "whip_0",
        startFrame: 0,
        endFrame: 20,
        direction: "right",
        blur: 20,
        easing: "ease-out",
      };

      const resultStart = processActiveEffects(0, [effect]);
      const resultMid = processActiveEffects(10, [effect]);
      const resultAlmostEnd = processActiveEffects(19, [effect]);

      expect(Math.abs(resultStart.translateX)).toBeCloseTo(0, 0);
      expect(Math.abs(resultMid.translateX)).toBeGreaterThan(
        Math.abs(resultStart.translateX),
      );
      expect(Math.abs(resultAlmostEnd.translateX)).toBeGreaterThan(0);
    });
  });

  describe("focus and track processors", () => {
    test("focus processor works without anchor snapshot", () => {
      const effect: FocusEffect = {
        type: "focus",
        id: "focus_0",
        startFrame: 0,
        endFrame: 30,
        anchorId: "lastMessage",
        scale: 1.3,
        easing: "ease-out",
      };

      const result = processActiveEffects(15, [effect]);
      expect(result.scale).toBeGreaterThan(1.0);
      expect(result.scale).toBeLessThan(1.3);
      expect(result.originX).toBeCloseTo(0.5, 1);
      expect(result.originY).toBeCloseTo(0.5, 1);
    });

    test("track processor works without anchor snapshot", () => {
      const effect: TrackEffect = {
        type: "track",
        id: "track_0",
        startFrame: 0,
        endFrame: 60,
        anchorId: "device",
        scale: 1.1,
        smoothing: 0.2,
        easing: "ease-out",
      };

      const result = processActiveEffects(30, [effect]);
      expect(result.scale).toBeGreaterThan(1.0);
    });
  });

  describe("processor registry", () => {
    test("processes all effect types without errors", () => {
      const allEffects: CameraEffect[] = [
        {
          type: "zoom",
          id: "zoom_0",
          startFrame: 0,
          endFrame: 30,
          targetScale: 1.5,
          easing: "ease-out",
        },
        {
          type: "shake",
          id: "shake_0",
          startFrame: 0,
          endFrame: 30,
          intensity: 5,
          easing: "ease-out",
        },
        {
          type: "focus",
          id: "focus_0",
          startFrame: 0,
          endFrame: 30,
          anchorId: "test",
          easing: "ease-out",
        },
        {
          type: "track",
          id: "track_0",
          startFrame: 0,
          endFrame: 30,
          anchorId: "test",
          easing: "ease-out",
        },
        {
          type: "reset",
          id: "reset_0",
          startFrame: 0,
          endFrame: 30,
          easing: "ease-out",
        },
        {
          type: "pan",
          id: "pan_0",
          startFrame: 0,
          endFrame: 30,
          deltaX: 50,
          deltaY: 50,
          easing: "ease-out",
        },
        {
          type: "dolly",
          id: "dolly_0",
          startFrame: 0,
          endFrame: 30,
          startScale: 1.0,
          endScale: 1.5,
          startTranslateY: 0,
          endTranslateY: 50,
          easing: "ease-out",
        },
        {
          type: "ken-burns",
          id: "kb_0",
          startFrame: 0,
          endFrame: 30,
          startScale: 1.0,
          endScale: 1.5,
          startOriginX: 0.5,
          startOriginY: 0.5,
          endOriginX: 0.7,
          endOriginY: 0.7,
          easing: "ease-out",
        },
        {
          type: "punch-zoom",
          id: "punch_0",
          startFrame: 0,
          endFrame: 30,
          intensity: 0.15,
          direction: "in",
          easing: "ease-out",
        },
        {
          type: "dutch-tilt",
          id: "tilt_0",
          startFrame: 0,
          endFrame: 30,
          angle: 5,
          easing: "ease-out",
        },
        {
          type: "flash",
          id: "flash_0",
          startFrame: 0,
          endFrame: 30,
          easing: "ease-out",
        },
        {
          type: "whip-pan",
          id: "whip_0",
          startFrame: 0,
          endFrame: 30,
          direction: "left",
          easing: "ease-out",
        },
      ];

      expect(() => {
        processActiveEffects(15, allEffects);
      }).not.toThrow();
    });
  });
});
