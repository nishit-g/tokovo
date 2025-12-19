/**
 * DirectorLite Derive
 * 
 * Pure function that derives camera effects for frame t.
 * Stateless, deterministic, scrubbing-safe.
 * 
 * @module device-camera/director-lite
 */

import type {
    DirectorSignal,
    DirectorLayoutModel,
    DirectorOutput,
    DerivedCameraEffect,
    DirectorDebug,
    LayoutRect,
} from "./types";
import { ViralDramaV1, DirectorStrategy, Rule } from "./strategy";
import { applyEasing } from "../utils";
import type { CameraEffect } from "../types";

// =============================================================================
// MAIN ENTRY
// =============================================================================

export interface DeriveContext {
    t: number;
    signals: DirectorSignal[];
    layoutModel: DirectorLayoutModel;
    seed?: number;
    debug?: boolean;
    manualCameraEffects?: CameraEffect[];
    strategy?: DirectorStrategy;
}

/**
 * Derive camera effects for frame t.
 * 
 * PURE FUNCTION: No internal state.
 * O(n) complexity with inline cooldown tracking.
 */
export function deriveDirectorEffects(ctx: DeriveContext): DirectorOutput {
    const {
        t,
        signals,
        layoutModel,
        seed = 0,
        debug: debugEnabled = false,
        manualCameraEffects = [],
        strategy = ViralDramaV1,
    } = ctx;

    // Policy: Skip director if any manual camera event is active
    if (manualCameraEffects.length > 0) {
        const hasActiveManual = manualCameraEffects.some(
            (ae) => t >= ae.startFrame && t < ae.endFrame
        );
        if (hasActiveManual) {
            return {
                effects: [],
                skipped: "manual-camera-active",
                debug: debugEnabled ? {
                    signalsInWindow: signals.length,
                    matchedRules: 0,
                    skippedCooldown: 0,
                } : undefined,
            };
        }
    }

    // Match rules with cooldown tracking
    interface Match {
        rule: Rule;
        signal: DirectorSignal;
        startFrame: number;
        endFrame: number;
    }

    const matches: Match[] = [];
    let skippedCooldown = 0;
    const lastSeenByKey = new Map<string, number>();

    for (const signal of signals) {
        const cooldownKey = `${signal.type}:${signal.deviceId}:${signal.appId}:${signal.conversationId ?? ""}`;
        const prevAt = lastSeenByKey.get(cooldownKey) ?? -Infinity;

        const rules = strategy.getRules(signal.type);

        for (const rule of rules) {
            const startFrame = signal.at;
            const endFrame = startFrame + rule.durationFrames;

            // Active at time t?
            if (t < startFrame || t >= endFrame) continue;

            // Cooldown check
            const framesSinceLast = signal.at - prevAt;
            if (framesSinceLast < rule.cooldownFrames && prevAt !== -Infinity) {
                skippedCooldown++;
                continue;
            }

            matches.push({ rule, signal, startFrame, endFrame });
        }

        lastSeenByKey.set(cooldownKey, signal.at);
    }

    // Generate effects
    const allEffects: DerivedCameraEffect[] = [];

    for (const match of matches) {
        const effect = generateEffect(match, layoutModel, t, seed);
        if (effect) allEffects.push(effect);
    }

    // Arbitrate: 1 framing wins, shake stacks (max 2)
    const finalEffects = arbitrate(allEffects);

    // Debug info
    let debug: DirectorDebug | undefined;
    if (debugEnabled) {
        const framingWinner = finalEffects.find((e) => e.category === "framing");
        debug = {
            signalsInWindow: signals.length,
            matchedRules: matches.length,
            winningFraming: framingWinner?.type,
            skippedCooldown,
        };
    }

    return { effects: finalEffects, debug };
}

// =============================================================================
// HELPERS
// =============================================================================

interface Match {
    rule: Rule;
    signal: DirectorSignal;
    startFrame: number;
    endFrame: number;
}

function generateEffect(
    match: Match,
    layout: DirectorLayoutModel,
    t: number,
    seed: number
): DerivedCameraEffect | null {
    const { rule, signal, startFrame, endFrame } = match;
    const duration = endFrame - startFrame;
    const localProgress = (t - startFrame) / duration;
    const progress = applyEasing(
        Math.min(1, Math.max(0, localProgress)),
        "ease-out"
    );

    // FocusAnchor effects use semantic anchors
    if (rule.effect === "FocusAnchor" && rule.anchor) {
        return {
            type: "FocusAnchor",
            category: rule.category,
            priority: rule.priority,
            progress,
            anchor: rule.anchor,
            preset: rule.preset,
            scale: rule.scale,
            seed: seed + signal.at,
        };
    }

    // Legacy effects
    const target = resolveTarget(signal, layout, rule.targetType || "");
    if (!target && rule.category === "framing" && rule.effect !== "PullBack") {
        return null;
    }

    return {
        type: rule.effect,
        category: rule.category,
        priority: rule.priority,
        progress,
        target: target ?? undefined,
        scale: rule.scale,
        intensity: rule.intensity,
        seed: seed + signal.at,
    };
}

function resolveTarget(
    signal: DirectorSignal,
    layout: DirectorLayoutModel,
    targetType: string
): LayoutRect | null {
    switch (targetType) {
        case "message":
            return signal.messageId ? layout.messageRects[signal.messageId] : null;
        case "inputArea":
            return layout.inputAreaRect ?? null;
        case "lastMessage":
            return layout.lastMessageRect ?? null;
        default:
            return null;
    }
}

function arbitrate(effects: DerivedCameraEffect[]): DerivedCameraEffect[] {
    const result: DerivedCameraEffect[] = [];

    // Framing: exactly 1 wins (highest priority)
    const framing = effects
        .filter((e) => e.category === "framing")
        .sort((a, b) => b.priority - a.priority);

    if (framing.length > 0) {
        result.push(framing[0]);
    }

    // Shake: max 2
    const shake = effects
        .filter((e) => e.category === "shake")
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 2);

    result.push(...shake);

    return result;
}
