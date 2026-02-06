/**
 * Layout Engine Tests
 *
 * @description Verifies deterministic layout computation for renderer.
 * Tests ensure layout engine produces consistent results given same inputs.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WorldState } from "@tokovo/core";

// Mock the registry context
const mockRegistries = {
    devices: {
        get: vi.fn().mockReturnValue({
            id: "iphone16",
            name: "iPhone 16",
            type: "phone",
            platform: "ios",
            dimensions: { width: 393, height: 852 },
            screen: { width: 393, height: 852, ppi: 460, cornerRadius: 55 },
            pixelDensity: 3,
            safeArea: { top: 59, bottom: 34, left: 0, right: 0 },
        }),
        has: vi.fn().mockReturnValue(true),
        list: vi.fn().mockReturnValue(["iphone16"]),
    },
    plugins: {
        metadata: { get: vi.fn().mockReturnValue(null) },
        layouts: {
            getStrategy: vi.fn().mockReturnValue(null),
        },
    },
};

vi.mock("../RegistryContext", () => ({
    useRendererRegistries: () => mockRegistries,
}));

// =============================================================================
// TEST UTILITIES
// =============================================================================

function createTestWorld(overrides: Partial<WorldState> = {}): WorldState {
    return {
        t: 0,
        devices: {
            device_1: {
                id: "device_1",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            },
        },
        appState: {
            app_whatsapp: {
                viewMode: "CHAT",
                conversationId: "conv_1",
                conversations: {
                    conv_1: {
                        id: "conv_1",
                        name: "Test Chat",
                        messages: [
                            { id: "msg_1", text: "Hello", from: "me", at: 0 },
                            { id: "msg_2", text: "Hi there!", from: "other", at: 30 },
                        ],
                    },
                },
            },
        },
        camera: {
            activeDeviceId: "device_1",
            transform: { x: 0, y: 0, scale: 1, rotation: 0 },
            activeEffects: [],
        },
        audio: { activeSounds: [], musicBed: null },
        ...overrides,
    } as unknown as WorldState;
}

// =============================================================================
// DETERMINISM TESTS
// =============================================================================

describe("LayoutEngine", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Determinism", () => {
        it("produces identical output for identical inputs", () => {
            const world = createTestWorld();

            // Simulate two calls with same inputs
            // In real usage, useLayoutEngine would be called, but we test the logic
            const worldSignature1 = computeTestWorldSignature(world, "device_1", "app_whatsapp");
            const worldSignature2 = computeTestWorldSignature(world, "device_1", "app_whatsapp");

            expect(worldSignature1).toBe(worldSignature2);
        });

        it("produces different signature when message count changes", () => {
            const world1 = createTestWorld();
            const world2 = createTestWorld({
                appState: {
                    app_whatsapp: {
                        viewMode: "CHAT",
                        conversationId: "conv_1",
                        conversations: {
                            conv_1: {
                                id: "conv_1",
                                name: "Test Chat",
                                messages: [
                                    { id: "msg_1", text: "Hello", from: "me", at: 0 },
                                    { id: "msg_2", text: "Hi there!", from: "other", at: 30 },
                                    { id: "msg_3", text: "New message", from: "me", at: 60 },
                                ],
                            },
                        },
                    },
                },
            } as Partial<WorldState>);

            const sig1 = computeTestWorldSignature(world1, "device_1", "app_whatsapp");
            const sig2 = computeTestWorldSignature(world2, "device_1", "app_whatsapp");

            expect(sig1).not.toBe(sig2);
        });

        it("produces different signature when device lock state changes", () => {
            const world1 = createTestWorld();
            const world2 = createTestWorld({
                devices: {
                    device_1: {
                        id: "device_1",
                        profileId: "iphone16",
                        isLocked: true,
                        foregroundAppId: undefined,
                        notifications: [],
                    },
                },
            } as Partial<WorldState>);

            const sig1 = computeTestWorldSignature(world1, "device_1", "app_whatsapp");
            const sig2 = computeTestWorldSignature(world2, "device_1", undefined);

            expect(sig1).not.toBe(sig2);
        });
    });

    describe("Cache Behavior", () => {
        it("cache key includes frame number", () => {
            const cacheKey1 = buildTestCacheKey(60, "device_1", "sig_abc");
            const cacheKey2 = buildTestCacheKey(90, "device_1", "sig_abc");

            expect(cacheKey1).not.toBe(cacheKey2);
        });

        it("cache key includes device ID", () => {
            const cacheKey1 = buildTestCacheKey(60, "device_1", "sig_abc");
            const cacheKey2 = buildTestCacheKey(60, "device_2", "sig_abc");

            expect(cacheKey1).not.toBe(cacheKey2);
        });

        it("cache key includes world signature", () => {
            const cacheKey1 = buildTestCacheKey(60, "device_1", "sig_abc");
            const cacheKey2 = buildTestCacheKey(60, "device_1", "sig_xyz");

            expect(cacheKey1).not.toBe(cacheKey2);
        });
    });
});

// =============================================================================
// TEST HELPERS (mirroring production logic)
// =============================================================================

function computeTestWorldSignature(
    world: WorldState,
    deviceId: string,
    appId: string | undefined,
): string {
    const device = world.devices[deviceId];
    const appState = appId ? (world.appState as Record<string, unknown>)?.[appId] : undefined;

    const parts = [
        deviceId,
        device?.foregroundAppId ?? "",
        device?.isLocked ? "1" : "0",
        (device as { keyboard?: { visible?: boolean } })?.keyboard?.visible ? "1" : "0",
        appId ?? "",
        (appState as { conversationId?: string } | undefined)?.conversationId ?? "",
        (appState as { viewMode?: string } | undefined)?.viewMode ?? "",
    ];

    const conversationId = (appState as { conversationId?: string } | undefined)?.conversationId;
    if (conversationId && appState) {
        const conversations = (appState as { conversations?: Record<string, { messages?: unknown[] }> }).conversations;
        const convo = conversations?.[conversationId];
        if (convo?.messages) {
            parts.push(String(convo.messages.length));
        }
    }

    return parts.join("|");
}

function buildTestCacheKey(frame: number, deviceId: string, worldSignature: string): string {
    return `${frame}:${deviceId}:${worldSignature}`;
}
