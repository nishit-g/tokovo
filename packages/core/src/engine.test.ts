import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { replay, WorldState, TimelineEvent, ReducerRegistry } from "./index";

// Mock reducer for testing
const mockReducer = (draft: WorldState, event: TimelineEvent) => {
    if (event.kind === "DEVICE" && event.type === "UNLOCK") {
        draft.devices[event.deviceId].isLocked = false;
    }
};

describe("Core Engine", () => {
    it("should replay events correctly", () => {
        // Register mock reducer
        ReducerRegistry.registerDeviceReducer(mockReducer);

        const initialWorld: WorldState = {
            devices: {
                "test_device": { id: "test_device", profileId: "test_profile", isLocked: true }
            },
            conversations: {},
            camera: { type: "APP_VIEW" }
        };

        const events: TimelineEvent[] = [
            { at: 10, kind: "DEVICE", deviceId: "test_device", type: "UNLOCK" }
        ];

        // Replay at t=0 (before event)
        const world0 = replay(initialWorld, events, 0);
        expect(world0.devices["test_device"].isLocked).toBe(true);

        // Replay at t=10 (at event)
        const world10 = replay(initialWorld, events, 10);
        expect(world10.devices["test_device"].isLocked).toBe(false);

        // Replay at t=20 (after event)
        const world20 = replay(initialWorld, events, 20);
        expect(world20.devices["test_device"].isLocked).toBe(false);
    });

    it("should handle multiple events in order", () => {
        const initialWorld: WorldState = {
            devices: {
                "test_device": { id: "test_device", profileId: "test_profile", isLocked: true }
            },
            conversations: {},
            camera: { type: "APP_VIEW" }
        };

        const events: TimelineEvent[] = [
            { at: 10, kind: "DEVICE", deviceId: "test_device", type: "UNLOCK" },
            { at: 20, kind: "DEVICE", deviceId: "test_device", type: "LOCK" } // Assuming mockReducer handled LOCK, but it doesn't. Let's update mockReducer or just test UNLOCK.
        ];

        // Let's use a more comprehensive mock reducer for this test
        const comprehensiveMockReducer = (draft: WorldState, event: TimelineEvent) => {
            if (event.kind === "DEVICE") {
                if (event.type === "UNLOCK") draft.devices[event.deviceId].isLocked = false;
                if (event.type === "LOCK") draft.devices[event.deviceId].isLocked = true;
            }
        };
        ReducerRegistry.registerDeviceReducer(comprehensiveMockReducer);

        const world15 = replay(initialWorld, events, 15);
        expect(world15.devices["test_device"].isLocked).toBe(false);

        const world25 = replay(initialWorld, events, 25);
        expect(world25.devices["test_device"].isLocked).toBe(true);
    });
});
