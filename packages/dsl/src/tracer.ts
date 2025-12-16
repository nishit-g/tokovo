// Source map support removed for browser compatibility

import { Trace } from "@tokovo/ir";

/**
 * Tracer
 * 
 * Auto-captures stack traces to link IR events to DSL source code.
 */
export class Tracer {
    /**
     * Capture the current stack trace and return a Trace object.
     * @param offsetFrames Number of frames to skip (default 1 to skip capture call itself)
     */
    static capture(offsetFrames = 1): Partial<Trace> {
        const stack = new Error().stack;
        if (!stack) return {};

        // DEBUG: Uncomment to see raw stack
        // console.log("RAW STACK:", stack);

        const lines = stack.split('\n');

        // Find the first frame outside of the DSL package
        // We look for logic that is NOT in node_modules and NOT in our own internal files
        for (let i = offsetFrames + 1; i < lines.length; i++) {
            const line = lines[i];

            // Skip internal node frames
            if (line.includes('(node:') || line.includes('(internal/')) continue;

            // Skip node_modules
            if (line.includes('node_modules')) continue;

            // Skip our own DSL internals (if mapped)
            if (line.includes('/dsl/src/')) continue;
            if (line.includes('/dsl/dist/')) continue;

            // This should be the user code
            const source = this.parseFrame(line);
            if (source) {
                return {
                    source
                };
            }
        }

        return {};
    }

    /**
     * Parse a stack frame line to extract file and line number.
     * Format: "    at Function.method (/path/to/file.ts:123:45)"
     *      or "    at /path/to/file.ts:123:45"
     */
    private static parseFrame(line: string): { file: string; line: number } | undefined {
        // Regex to match file path, line, and column
        // Matches: (path):line:col
        const match = line.match(/\((.+):(\d+):(\d+)\)$/) || line.match(/at\s+(.+):(\d+):(\d+)$/);

        if (match) {
            return {
                file: match[1],
                line: parseInt(match[2], 10)
            };
        }
        return undefined;
    }
}
