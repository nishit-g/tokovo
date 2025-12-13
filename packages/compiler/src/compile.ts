/**
 * Compile - Main Entry Point
 * 
 * Transforms Scene IR → Timeline IR through the pass pipeline.
 * 
 * Pipeline:
 *   normalize → resolveRefs → virtualDevice → timeLowering → validate → sort
 */

import { SceneIR, TimelineIR, TimelineOp } from "@tokovo/ir";
import { CompilerContext, CompilerConfig, Cursor } from "./context";
import {
    normalize,
    resolveRefs,
    lowerToTimeline,
    validateTimeline,
    sort,
    ValidationResult,
} from "./passes";

/**
 * Compilation result.
 */
export interface CompileResult {
    /** Compiled timeline IR */
    timeline: TimelineIR;

    /** Validation result */
    validation: ValidationResult;

    /** Computed duration in frames */
    durationInFrames: number;

    /** Debug info */
    debug?: {
        sceneIR: SceneIR;
        unsortedOps: TimelineOp[];
    };
}

/**
 * Compilation options.
 */
export interface CompileOptions {
    /** Validation mode */
    mode?: "strict" | "lenient";

    /** Include debug artifacts */
    debug?: boolean;
}

/**
 * Compile Scene IR to Timeline IR.
 */
export function compile(sceneIR: SceneIR, options: CompileOptions = {}): CompileResult {
    const config: CompilerConfig = {
        fps: sceneIR.meta.fps,
        episodeId: sceneIR.episodeId,
        mode: options.mode ?? "lenient",
    };

    const ctx = new CompilerContext(config);
    const allOps: TimelineOp[] = [];
    let maxFrame = 0;

    // Process each device
    for (const device of sceneIR.devices) {
        const cursor = new Cursor();

        // Process each beat
        for (const beat of device.beats) {
            // 1. Normalize operations
            let ops = normalize(beat.ops);

            // 2. Resolve message references
            ops = resolveRefs(
                ops,
                ctx,
                device.deviceId,
                device.conversations[0]?.id ?? ""
            );

            // 3. Lower to timeline (includes virtual device state)
            const timelineOps = lowerToTimeline(
                ops,
                ctx,
                cursor,
                device.deviceId,
                device.appId,
                device.conversations[0]?.id ?? "",
                beat.name
            );

            allOps.push(...timelineOps);
        }

        maxFrame = Math.max(maxFrame, cursor.current);
    }

    // 4. Validate
    const validation = validateTimeline(allOps, ctx);

    // 5. Sort
    const sortedOps = sort(allOps);

    // Build result
    const timeline: TimelineIR = {
        episodeId: sceneIR.episodeId,
        fps: sceneIR.meta.fps,
        durationInFrames: sceneIR.meta.durationInFrames ?? maxFrame + 30, // Add 1s buffer
        ops: sortedOps,
    };

    return {
        timeline,
        validation,
        durationInFrames: timeline.durationInFrames,
        debug: options.debug
            ? {
                sceneIR,
                unsortedOps: allOps,
            }
            : undefined,
    };
}
