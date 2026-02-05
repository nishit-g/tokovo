/**
 * Characterization Tests for Camera Reducer
 *
 * These tests lock in CURRENT behavior before refactoring.
 * Tests verify the reducer processes events correctly and creates typed effects.
 *
 * Pattern: reducer expects { camera: CameraState } and MUTATES state.camera
 */

import { describe, test, expect } from "vitest";
import { cameraReducer } from "../reducer";
import { createDefaultCameraState } from "./fixtures";
import { DEFAULT_CAMERA_TRANSFORM as DEFAULT_TRANSFORM } from "@tokovo/core";

describe("cameraReducer", () => {
  // ===========================================================================
  // ZOOM - Scale and translate with origin
  // ===========================================================================
  describe("zoom event", () => {
    test("creates zoom effect with all properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "zoom",
        at: 0,
        scale: 1.5,
        translateX: 10,
        translateY: 20,
        originX: 0.3,
        originY: 0.7,
        duration: 30,
        easing: "ease-out" as const,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "zoom",
        id: "zoom_0",
        startFrame: 0,
        endFrame: 30,
        targetScale: 1.5,
        targetX: 10,
        targetY: 20,
        originX: 0.3,
        originY: 0.7,
        easing: "ease-out",
      });
    });

    test("uses default duration and easing when not specified", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "zoom",
        at: 60,
        scale: 2.0,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect.startFrame).toBe(60);
      expect(effect.endFrame).toBe(90); // at + default 30
      expect(effect.easing).toBe("ease-out");
    });

    test("handles optional translate and origin properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "zoom",
        at: 0,
        scale: 1.2,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        type: "zoom",
        targetScale: 1.2,
        targetX: 0,
        targetY: 0,
      });
      if (effect.type === "zoom") {
        expect(effect.originX).toBeUndefined();
        expect(effect.originY).toBeUndefined();
      }
    });
  });

  // ===========================================================================
  // SHAKE - Procedural screen shake
  // ===========================================================================
  describe("shake event", () => {
    test("creates shake effect with all properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "shake",
        at: 10,
        intensity: 8,
        intensityX: 10,
        intensityY: 5,
        frequency: 20,
        decay: 0.9,
        duration: 20,
        easing: "ease-in" as const,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "shake",
        id: "shake_10",
        startFrame: 10,
        endFrame: 30,
        intensity: 8,
        intensityX: 10,
        intensityY: 5,
        frequency: 20,
        decay: 0.9,
        easing: "ease-in",
      });
    });

    test("uses default values for optional shake properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "shake",
        at: 0,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        type: "shake",
        intensity: 5,
        frequency: 15,
        decay: 0.8,
      });
    });
  });

  // ===========================================================================
  // FOCUS - Semantic anchor focus (one-time)
  // ===========================================================================
  describe("focus event", () => {
    test("creates focus effect with anchorId and scale", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "focus",
        at: 20,
        anchorId: "lastMessage",
        scale: 1.3,
        preset: "tight",
        duration: 25,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "focus",
        id: "focus_20",
        startFrame: 20,
        endFrame: 45,
        anchorId: "lastMessage",
        scale: 1.3,
        preset: "tight",
      });
    });

    test("uses anchor field as fallback for anchorId", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "focus",
        at: 0,
        anchor: "device",
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects[0]).toMatchObject({
        anchorId: "device",
      });
    });

    test("defaults to 'device' anchor when neither anchorId nor anchor provided", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "focus",
        at: 0,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects[0]).toMatchObject({
        anchorId: "device",
      });
    });
  });

  // ===========================================================================
  // TRACK - Continuous anchor following
  // ===========================================================================
  describe("track event", () => {
    test("creates track effect with all properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "track",
        at: 30,
        anchorId: "currentSpeaker",
        scale: 1.2,
        smoothing: 0.25,
        duration: 60,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "track",
        id: "track_30",
        startFrame: 30,
        endFrame: 90,
        anchorId: "currentSpeaker",
        scale: 1.2,
        smoothing: 0.25,
      });
    });

    test("uses default scale and track control settings", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "track",
        at: 0,
        anchorId: "target",
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        scale: 1.05,
        smoothing: 0.18,
        deadZonePx: 14,
        maxVelocityPxPerSec: 720,
        predictiveLookaheadFrames: 0,
      });
    });
  });

  // ===========================================================================
  // RESET - Return to neutral camera
  // ===========================================================================
  describe("reset event", () => {
    test("creates reset effect", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "reset",
        at: 100,
        duration: 40,
        easing: "ease-in-out" as const,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "reset",
        id: "reset_100",
        startFrame: 100,
        endFrame: 140,
        easing: "ease-in-out",
      });
    });

    test("handles spring parameter", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "reset",
        at: 0,
        spring: "smooth",
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects[0]).toMatchObject({
        spring: "smooth",
      });
    });
  });

  // ===========================================================================
  // PUNCH-ZOOM - Quick zoom with spring bounce
  // ===========================================================================
  describe("punch-zoom event", () => {
    test("creates punch-zoom effect with all properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "punch-zoom",
        at: 50,
        intensity: 0.2,
        direction: "out" as const,
        spring: "bouncy",
        duration: 15,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "punch-zoom",
        id: "punch-zoom_50",
        startFrame: 50,
        endFrame: 65,
        intensity: 0.2,
        direction: "out",
        spring: "bouncy",
      });
    });

    test("uses default values", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "punch-zoom",
        at: 0,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        intensity: 0.15,
        direction: "in",
        spring: "punch",
      });
    });
  });

  // ===========================================================================
  // DUTCH-TILT - Z-axis rotation for tension
  // ===========================================================================
  describe("dutch-tilt event", () => {
    test("creates dutch-tilt effect", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "dutch-tilt",
        at: 70,
        angle: 8,
        spring: "dramatic",
        duration: 20,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "dutch-tilt",
        id: "dutch-tilt_70",
        startFrame: 70,
        endFrame: 90,
        angle: 8,
        spring: "dramatic",
      });
    });

    test("uses default angle and spring", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "dutch-tilt",
        at: 0,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        angle: 5,
        spring: "dramatic",
      });
    });
  });

  // ===========================================================================
  // FLASH - Screen flash effect
  // ===========================================================================
  describe("flash event", () => {
    test("creates flash effect with all properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "flash",
        at: 80,
        color: "red",
        intensity: 0.8,
        duration: 5,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "flash",
        id: "flash_80",
        startFrame: 80,
        endFrame: 85,
        color: "red",
        intensity: 0.8,
      });
    });

    test("uses default color and intensity", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "flash",
        at: 0,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        color: "white",
        intensity: 1,
      });
    });
  });

  // ===========================================================================
  // WHIP-PAN - Fast pan transition
  // ===========================================================================
  describe("whip-pan event", () => {
    test("creates whip-pan effect with all properties", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "whip-pan",
        at: 90,
        direction: "right" as const,
        blur: 30,
        duration: 10,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject({
        type: "whip-pan",
        id: "whip-pan_90",
        startFrame: 90,
        endFrame: 100,
        direction: "right",
        blur: 30,
      });
    });

    test("uses default direction and blur", () => {
      const state = { camera: createDefaultCameraState() };
      const event = {
        kind: "CAMERA" as const,
        type: "whip-pan",
        at: 0,
      };

      cameraReducer(state, event);

      const effect = state.camera.activeEffects[0];
      expect(effect).toMatchObject({
        direction: "left",
        blur: 20,
      });
    });

    test("handles all direction values", () => {
      const directions: Array<"left" | "right" | "up" | "down"> = [
        "left",
        "right",
        "up",
        "down",
      ];

      directions.forEach((dir) => {
        const state = { camera: createDefaultCameraState() };
        const event = {
          kind: "CAMERA" as const,
          type: "whip-pan",
          at: 0,
          direction: dir,
        };

        cameraReducer(state, event);
        expect(state.camera.activeEffects[0]).toMatchObject({
          direction: dir,
        });
      });
    });
  });

  // ===========================================================================
  // CUT - Instant camera change
  // ===========================================================================
  describe("cut event", () => {
    test("clears non-persistent effects", () => {
      const state = { camera: createDefaultCameraState() };

      // Add multiple effects
      state.camera.activeEffects = [
        {
          type: "zoom",
          id: "zoom_1",
          startFrame: 0,
          endFrame: 30,
          targetScale: 1.5,
          easing: "ease-out",
        },
        {
          type: "shake",
          id: "shake_1",
          startFrame: 0,
          endFrame: 20,
          intensity: 5,
          easing: "ease-out",
        },
      ];

      const event = {
        kind: "CAMERA" as const,
        type: "cut",
        at: 50,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(0);
    });

    test("preserves persistent effects", () => {
      const state = { camera: createDefaultCameraState() };

      const persistentEffect = {
        type: "shake" as const,
        id: "ambient_shake",
        startFrame: 0,
        endFrame: 1000,
        intensity: 2,
        easing: "ease-out" as const,
        persistent: true,
      };

      state.camera.activeEffects = [
        {
          type: "zoom" as const,
          id: "zoom_1",
          startFrame: 0,
          endFrame: 30,
          targetScale: 1.5,
          easing: "ease-out" as const,
        },
        persistentEffect,
      ];

      const event = {
        kind: "CAMERA" as const,
        type: "cut",
        at: 50,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects).toHaveLength(1);
      expect(state.camera.activeEffects[0]).toMatchObject(persistentEffect);
    });

    test("resets transform to default", () => {
      const state = { camera: createDefaultCameraState() };

      // Modify transform
      state.camera.transform = {
        scale: 2,
        translateX: 100,
        translateY: 50,
        originX: 0.3,
        originY: 0.7,
        rotation: 10,
        shakeX: 5,
        shakeY: 3,
      };

      const event = {
        kind: "CAMERA" as const,
        type: "cut",
        at: 0,
      };

      cameraReducer(state, event);

      expect(state.camera.transform).toEqual(DEFAULT_TRANSFORM);
    });

    test("updates activeDeviceId when toDeviceId specified", () => {
      const state = { camera: createDefaultCameraState() };
      state.camera.activeDeviceId = "device_1";

      const event = {
        kind: "CAMERA" as const,
        type: "cut",
        at: 0,
        toDeviceId: "device_2",
      };

      cameraReducer(state, event);

      expect(state.camera.activeDeviceId).toBe("device_2");
    });

    test("does not change activeDeviceId when toDeviceId not specified", () => {
      const state = { camera: createDefaultCameraState() };
      state.camera.activeDeviceId = "device_1";

      const event = {
        kind: "CAMERA" as const,
        type: "cut",
        at: 0,
      };

      cameraReducer(state, event);

      expect(state.camera.activeDeviceId).toBe("device_1");
    });
  });

  // ===========================================================================
  // SET-VIEW - Legacy view change
  // ===========================================================================
  describe("set-view event", () => {
    test("updates baseView and appId", () => {
      const state = { camera: createDefaultCameraState() };

      const event = {
        kind: "CAMERA" as const,
        type: "set-view",
        at: 0,
        view: {
          type: "TRANSITION",
          appId: "app_whatsapp",
        },
      };

      cameraReducer(state, event);

      expect(state.camera.baseView).toBe("TRANSITION");
      expect(state.camera.appId).toBe("app_whatsapp");
    });

    test("handles APP_VIEW type", () => {
      const state = { camera: createDefaultCameraState() };

      const event = {
        kind: "CAMERA" as const,
        type: "set-view",
        at: 0,
        view: {
          type: "APP_VIEW",
          appId: "app_instagram",
        },
      };

      cameraReducer(state, event);

      expect(state.camera.baseView).toBe("APP_VIEW");
      expect(state.camera.appId).toBe("app_instagram");
    });

    test("does nothing when view.type is missing", () => {
      const state = { camera: createDefaultCameraState() };
      const originalView = state.camera.baseView;

      const event = {
        kind: "CAMERA" as const,
        type: "set-view",
        at: 0,
        view: {
          appId: "some_app",
        },
      };

      cameraReducer(state, event);

      expect(state.camera.baseView).toBe(originalView);
    });
  });

  // ===========================================================================
  // LAYOUT - Change view layout mode
  // ===========================================================================
  describe("layout event", () => {
    test("updates layout with all properties", () => {
      const state = { camera: createDefaultCameraState() };

      const event = {
        kind: "CAMERA" as const,
        type: "layout",
        at: 0,
        mode: "SPLIT_VERTICAL",
        primaryDeviceId: "device_1",
        secondaryDeviceId: "device_2",
      };

      cameraReducer(state, event);

      expect(state.camera.layout).toEqual({
        mode: "SPLIT_VERTICAL",
        primaryDeviceId: "device_1",
        secondaryDeviceId: "device_2",
      });
    });

    test("uses activeDeviceId as fallback for primaryDeviceId", () => {
      const state = { camera: createDefaultCameraState() };
      state.camera.activeDeviceId = "current_device";

      const event = {
        kind: "CAMERA" as const,
        type: "layout",
        at: 0,
        mode: "PICTURE_IN_PICTURE",
      };

      cameraReducer(state, event);

      expect(state.camera.layout).toMatchObject({
        mode: "PICTURE_IN_PICTURE",
        primaryDeviceId: "current_device",
      });
    });

    test("defaults to SINGLE mode when mode not specified", () => {
      const state = { camera: createDefaultCameraState() };

      const event = {
        kind: "CAMERA" as const,
        type: "layout",
        at: 0,
      };

      cameraReducer(state, event);

      expect(state.camera.layout.mode).toBe("SINGLE");
    });
  });

  // ===========================================================================
  // GENERAL BEHAVIOR
  // ===========================================================================
  describe("general reducer behavior", () => {
    test("ignores non-CAMERA events", () => {
      const state = { camera: createDefaultCameraState() };
      const initialEffects = state.camera.activeEffects.length;

      const event = {
        kind: "DEVICE" as const,
        type: "UNLOCK",
        at: 0,
      };

      cameraReducer(state, event as any);

      expect(state.camera.activeEffects.length).toBe(initialEffects);
    });

    test("creates camera state if missing", () => {
      const state: { camera?: any } = {};

      const event = {
        kind: "CAMERA" as const,
        type: "zoom",
        at: 0,
        scale: 1.5,
      };

      cameraReducer(state, event);

      expect(state.camera).toBeDefined();
      expect(state.camera.activeEffects).toHaveLength(1);
    });

    test("normalizes event type (lowercase, replace underscores)", () => {
      const state = { camera: createDefaultCameraState() };

      const event = {
        kind: "CAMERA" as const,
        type: "PUNCH_ZOOM",
        at: 0,
      };

      cameraReducer(state, event);

      expect(state.camera.activeEffects[0].type).toBe("punch-zoom");
    });

    test("accumulates multiple effects", () => {
      const state = { camera: createDefaultCameraState() };

      cameraReducer(state, {
        kind: "CAMERA",
        type: "zoom",
        at: 0,
        scale: 1.5,
      });

      cameraReducer(state, {
        kind: "CAMERA",
        type: "shake",
        at: 10,
        intensity: 5,
      });

      expect(state.camera.activeEffects).toHaveLength(2);
      expect(state.camera.activeEffects[0].type).toBe("zoom");
      expect(state.camera.activeEffects[1].type).toBe("shake");
    });
  });
});
