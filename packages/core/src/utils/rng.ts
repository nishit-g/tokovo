/**
 * Seeded Random Number Generator
 * 
 * Essential for deterministic video generation.
 * Uses a simple Mulberry32 algorithm.
 */

export class SeededRNG {
    private state: number;

    constructor(seed: number) {
        this.state = seed | 0;
    }

    /**
     * Returns a float between 0 and 1
     */
    next(): number {
        this.state = (this.state + 0x6D2B79F5) | 0;
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /**
     * Returns an integer between min and max (exclusive of max)
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min)) + min;
    }
}
