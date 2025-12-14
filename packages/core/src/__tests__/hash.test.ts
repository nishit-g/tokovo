/**
 * Unit Tests for Stable Hashing
 * 
 * Tests stable stringify function.
 * Note: computeDeterminismHash is async and returns a Promise
 */

import { describe, it, expect } from 'vitest';
import { stableStringify } from '../canonical/hash';

describe('Stable Hashing', () => {
    describe('stableStringify', () => {
        it('should produce same output for same object', () => {
            const obj = { b: 2, a: 1, c: 3 };

            const str1 = stableStringify(obj);
            const str2 = stableStringify(obj);

            expect(str1).toBe(str2);
        });

        it('should sort object keys alphabetically', () => {
            const obj = { z: 1, a: 2, m: 3 };
            const str = stableStringify(obj);

            // Keys should be in order: a, m, z
            expect(str.indexOf('"a"')).toBeLessThan(str.indexOf('"m"'));
            expect(str.indexOf('"m"')).toBeLessThan(str.indexOf('"z"'));
        });

        it('should handle nested objects', () => {
            const obj = {
                outer: { z: 1, a: 2 },
                inner: { b: 3, a: 4 }
            };

            const str = stableStringify(obj);

            // Should be deterministic
            expect(stableStringify(obj)).toBe(str);
        });

        it('should handle arrays', () => {
            const arr = [{ b: 1, a: 2 }, { d: 3, c: 4 }];
            const str = stableStringify(arr);

            // Array order preserved, but object keys sorted
            expect(str).toContain('[');
            expect(stableStringify(arr)).toBe(str);
        });

        it('should handle primitives', () => {
            expect(stableStringify('hello')).toBe('"hello"');
            expect(stableStringify(42)).toBe('42');
            expect(stableStringify(true)).toBe('true');
            expect(stableStringify(null)).toBe('null');
        });

        it('should produce different output for different objects', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 3 };

            expect(stableStringify(obj1)).not.toBe(stableStringify(obj2));
        });

        it('should handle undefined values', () => {
            const obj = { a: 1, b: undefined };
            const str = stableStringify(obj);

            // undefined values should be handled (either omitted or null)
            expect(str).toBeDefined();
        });

        it('should produce consistent order for deep objects', () => {
            const obj = {
                z: { y: { x: 1 } },
                a: { b: { c: 2 } },
                m: [{ n: 3 }, { o: 4 }],
            };

            const str1 = stableStringify(obj);
            const str2 = stableStringify(obj);

            expect(str1).toBe(str2);
        });

        it('should handle empty objects and arrays', () => {
            expect(stableStringify({})).toBe('{}');
            expect(stableStringify([])).toBe('[]');
        });

        it('should handle special characters in strings', () => {
            const obj = { name: 'Alex ❤️', emoji: '👋' };
            const str = stableStringify(obj);

            expect(str).toContain('Alex');
            expect(stableStringify(obj)).toBe(str);
        });
    });
});
