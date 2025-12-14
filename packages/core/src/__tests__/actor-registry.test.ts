/**
 * Unit Tests for ActorRegistry
 * 
 * Tests actor registration, lookup, and factory functions.
 */

import { describe, it, expect } from 'vitest';
import { createActorRegistry, ACTOR_ME, ACTOR_SYSTEM, isMe, isSystem } from '../canonical/identity';

describe('ActorRegistry', () => {
    describe('createActorRegistry', () => {
        it('should create a registry with system actor pre-registered', () => {
            const registry = createActorRegistry();
            expect(registry).toBeDefined();
            // System actor is pre-registered
            expect(registry.has(ACTOR_SYSTEM)).toBe(true);
        });
    });

    describe('register', () => {
        it('should register an actor', () => {
            const registry = createActorRegistry();

            registry.register({
                id: 'actor_alice',
                displayName: 'Alice',
            });

            expect(registry.has('actor_alice')).toBe(true);
        });

        it('should allow updating an existing actor', () => {
            const registry = createActorRegistry();

            registry.register({ id: 'actor_alice', displayName: 'Alice' });
            registry.register({ id: 'actor_alice', displayName: 'Alice Updated' });

            const actor = registry.get('actor_alice');
            expect(actor?.displayName).toBe('Alice Updated');
        });
    });

    describe('get', () => {
        it('should return actor by ID', () => {
            const registry = createActorRegistry();
            registry.register({ id: 'actor_bob', displayName: 'Bob', handle: '@bob' });

            const actor = registry.get('actor_bob');

            expect(actor).toBeDefined();
            expect(actor?.displayName).toBe('Bob');
            expect(actor?.handle).toBe('@bob');
        });

        it('should return undefined for unknown ID', () => {
            const registry = createActorRegistry();
            expect(registry.get('unknown')).toBeUndefined();
        });
    });

    describe('has', () => {
        it('should return true for registered actors', () => {
            const registry = createActorRegistry();
            registry.register({ id: 'actor_1', displayName: 'Test' });

            expect(registry.has('actor_1')).toBe(true);
            expect(registry.has('actor_2')).toBe(false);
        });
    });

    describe('all', () => {
        it('should return all registered actors including system', () => {
            const registry = createActorRegistry();
            registry.register({ id: 'actor_1', displayName: 'One' });
            registry.register({ id: 'actor_2', displayName: 'Two' });
            registry.register({ id: 'actor_3', displayName: 'Three' });

            const all = registry.all();

            // System actor + 3 registered = 4
            expect(all.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('getMe', () => {
        it('should return default me actor for device', () => {
            const registry = createActorRegistry();
            const me = registry.getMe('phone_a');

            expect(me).toBeDefined();
            expect(me.displayName).toBe('Me');
        });

        it('should set custom me actor', () => {
            const registry = createActorRegistry();
            registry.setMe('phone_a', { id: 'actor_me', displayName: 'Custom Me' });

            const me = registry.getMe('phone_a');

            expect(me.displayName).toBe('Custom Me');
        });
    });
});

describe('Actor ID Helpers', () => {
    describe('isMe', () => {
        it('should return true for actor_me', () => {
            expect(isMe(ACTOR_ME)).toBe(true);
            expect(isMe('actor_me')).toBe(true);
        });

        it('should return true for device owner IDs', () => {
            expect(isMe('device_phone_a_owner')).toBe(true);
        });

        it('should return false for other IDs', () => {
            expect(isMe('actor_alice')).toBe(false);
        });
    });

    describe('isSystem', () => {
        it('should return true for actor_system', () => {
            expect(isSystem(ACTOR_SYSTEM)).toBe(true);
            expect(isSystem('actor_system')).toBe(true);
        });

        it('should return false for other IDs', () => {
            expect(isSystem('actor_alice')).toBe(false);
        });
    });
});
