import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { deviceReducer } from "./reducer";
import { WorldState, TimelineEvent } from "@tokovo/core";

describe("Device Reducer", () => {
    const initialWorld: WorldState = {
        devices: {
            "test_device": { id: "test_device", profileId: "test_profile", isLocked: true }
        },
        conversations: {},
        camera: { type: "APP_VIEW" }
    };

    it("should handle UNLOCK event", () => {
        const event: TimelineEvent = { at: 10, kind: "DEVICE", deviceId: "test_device", type: "UNLOCK" };
        const nextState = produce(initialWorld, (draft) => {
            draft.devices = deviceReducer(draft.devices, event);
        });
        expect(nextState.devices["test_device"].isLocked).toBe(false);
    });

    it("should handle OPEN_APP event", () => {
        // First unlock
        const unlockedState = produce(initialWorld, (draft) => {
            draft.devices["test_device"].isLocked = false;
        });

        const event: TimelineEvent = { at: 20, kind: "DEVICE", deviceId: "test_device", type: "OPEN_APP", appId: "app_test" };
        const nextState = produce(unlockedState, (draft) => {
            draft.devices = deviceReducer(draft.devices, event);
        });
        expect(nextState.devices["test_device"].foregroundAppId).toBe("app_test");
    });

    it("should handle CLOSE_APP event", () => {
        const openAppState = produce(initialWorld, (draft) => {
            draft.devices["test_device"].isLocked = false;
            draft.devices["test_device"].foregroundAppId = "app_test";
        });

        const event: TimelineEvent = { at: 30, kind: "DEVICE", deviceId: "test_device", type: "CLOSE_APP" };
        const nextState = produce(openAppState, (draft) => {
            draft.devices = deviceReducer(draft.devices, event);
        });
        expect(nextState.devices["test_device"].foregroundAppId).toBeUndefined();
    });
});
