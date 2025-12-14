/**
 * Unit Tests for Event Ordering
 * 
 * Tests deterministic event sorting and sort key generation.
 */

import { describe, it, expect } from 'vitest';
import {
    eventSortKey,
    sortEventsDeterministic,
    KIND_PRIORITY,
    APP_TYPE_PRIORITY
} from '../canonical/ordering';
import { CanonicalRuntimeEvent } from '../canonical/device-events';

// Helper to create a valid event with trace
function createEvent(overrides: Partial<CanonicalRuntimeEvent> & { at: number; kind: string; type: string; deviceId: string }): CanonicalRuntimeEvent {
    return {
        ...overrides,
        trace: {
            episodeId: 'test-episode',
            deviceId: overrides.deviceId,
            beatName: 'test-beat',
            opIndex: 0,
        },
    } as unknown as CanonicalRuntimeEvent;
}

describe('Event Ordering', () => {
    describe('KIND_PRIORITY', () => {
        it('should have OS first', () => {
            expect(KIND_PRIORITY.OS).toBe(0);
        });

        it('should have DEVICE before APP', () => {
            expect(KIND_PRIORITY.DEVICE).toBeLessThan(KIND_PRIORITY.APP);
        });

        it('should have APP before CAMERA', () => {
            // Camera effects applied after content
            expect(KIND_PRIORITY.APP).toBeLessThan(KIND_PRIORITY.CAMERA);
        });
    });

    describe('APP_TYPE_PRIORITY', () => {
        it('should have NAVIGATE before MESSAGE', () => {
            expect(APP_TYPE_PRIORITY.NAVIGATE!).toBeLessThan(APP_TYPE_PRIORITY.MESSAGE!);
        });

        it('should have MESSAGE before REACTION', () => {
            expect(APP_TYPE_PRIORITY.MESSAGE!).toBeLessThan(APP_TYPE_PRIORITY.REACTION!);
        });
    });

    describe('eventSortKey', () => {
        it('should produce deterministic key for same event', () => {
            const event = createEvent({
                kind: 'APP',
                type: 'MESSAGE',
                at: 100,
                deviceId: 'phone_a',
            });

            const key1 = eventSortKey(event);
            const key2 = eventSortKey(event);

            expect(key1).toBe(key2);
        });

        it('should order by frame first', () => {
            const event1 = createEvent({ kind: 'APP', type: 'MESSAGE', at: 50, deviceId: 'phone' });
            const event2 = createEvent({ kind: 'APP', type: 'MESSAGE', at: 100, deviceId: 'phone' });

            const key1 = eventSortKey(event1);
            const key2 = eventSortKey(event2);

            expect(key1 < key2).toBe(true);
        });

        it('should order by kind priority at same frame', () => {
            const deviceEvent = createEvent({ kind: 'DEVICE', type: 'UNLOCK', at: 100, deviceId: 'phone' });
            const appEvent = createEvent({ kind: 'APP', type: 'MESSAGE', at: 100, deviceId: 'phone' });

            const deviceKey = eventSortKey(deviceEvent);
            const appKey = eventSortKey(appEvent);

            // DEVICE (1) should come before APP (2)
            expect(deviceKey < appKey).toBe(true);
        });
    });

    describe('sortEventsDeterministic', () => {
        it('should sort by frame', () => {
            const events = [
                createEvent({ kind: 'APP', type: 'MESSAGE', at: 100, deviceId: 'phone' }),
                createEvent({ kind: 'APP', type: 'MESSAGE', at: 50, deviceId: 'phone' }),
                createEvent({ kind: 'APP', type: 'MESSAGE', at: 75, deviceId: 'phone' }),
            ];

            const sorted = sortEventsDeterministic(events);

            expect(sorted[0].at).toBe(50);
            expect(sorted[1].at).toBe(75);
            expect(sorted[2].at).toBe(100);
        });

        it('should produce same order for same input', () => {
            const events = [
                createEvent({ kind: 'APP', type: 'MESSAGE', at: 100, deviceId: 'b' }),
                createEvent({ kind: 'DEVICE', type: 'UNLOCK', at: 100, deviceId: 'a' }),
                createEvent({ kind: 'APP', type: 'TYPING', at: 100, deviceId: 'c' }),
            ];

            const sorted1 = sortEventsDeterministic(events);
            const sorted2 = sortEventsDeterministic([...events].reverse());

            expect(sorted1.map(e => e.kind)).toEqual(sorted2.map(e => e.kind));
        });

        it('should not mutate original array', () => {
            const events = [
                createEvent({ kind: 'APP', type: 'MESSAGE', at: 100, deviceId: 'phone' }),
                createEvent({ kind: 'APP', type: 'MESSAGE', at: 50, deviceId: 'phone' }),
            ];

            const original = [...events];
            sortEventsDeterministic(events);

            expect(events[0].at).toBe(original[0].at);
        });
    });
});
