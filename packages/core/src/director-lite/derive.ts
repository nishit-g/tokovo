/**
 * DirectorLite Derive
 *
 * Pure function that derives camera effects for frame t.
 * Stateless, deterministic, scrubbing-safe.
 *
 * FIXES from review:
 * - Cooldown uses inline lastSeen (no map key mismatch)
 * - Signals assumed pre-sorted; debug guard if not
 * - Manual camera skip policy: if any manual camera active, skip director
 * - viewport removed from this function (only needed in composer)
 */

import {
    DirectorSignal,
    DirectorLayoutModel,
    DirectorOutput,
    DerivedCameraEffect,
    DirectorDebug,
    LayoutRect,
} from "./types";
import { Rule, RULES_BY_SIGNAL } from "./rules";
import { applyEasing } from "../camera";
import { ActiveCameraEffect } from "../types";

// =============================================================================
// MAIN ENTRY
// =============================================================================

export interface DeriveContext {
    t: number;
    signals: DirectorSignal[]; // Must be pre-sorted by `at`
    layoutModel: DirectorLayoutModel;
    seed?: number;
    debug?: boolean;
    // Manual camera skip: if any active effects from timeline, skip director
    manualCameraEffects?: ActiveCameraEffect[];
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
    } = ctx;

    // Policy A: Skip director if any manual camera event is active
    if (manualCameraEffects.length > 0) {
        const hasActiveManual = manualCameraEffects.some(
            (ae) => t >= ae.startFrame && t < ae.endFrame
        );
        if (hasActiveManual) {
            return {
                effects: [],
                skipped: "manual-camera-active",
                debug: debugEnabled
                    ? {
                        signalsInWindow: signals.length,
                        matchedRules: 0,
                        skippedCooldown: 0,
                    }
                    : undefined,
            };
        }
    }

    // Debug guard: check signals are sorted
    if (debugEnabled && signals.length > 1) {
        for (let i = 1; i < signals.length; i++) {
            if (signals[i].at < signals[i - 1].at) {
                console.warn(
                    `[DirectorLite] Signals not sorted! at[${i}]=${signals[i].at} < at[${i - 1}]=${signals[i - 1].at}`
                );
                break;
            }
        }
    }

    // Match rules with INLINE cooldown tracking (no separate map)
    const matches: Match[] = [];
    let skippedCooldown = 0;

    // Track last seen time per cooldown key (inline, as we iterate sorted signals)
    const lastSeenByKey = new Map<string, number>();

    for (const signal of signals) {
        const cooldownKey = getCooldownKey(signal);
        const prevAt = lastSeenByKey.get(cooldownKey) ?? -Infinity;

        // Get rules for this signal type (O(1) lookup)
        const rules = RULES_BY_SIGNAL[signal.type] || [];

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

        // Update lastSeen after processing this signal
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

    // Debug (only if enabled)
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

/**
 * Cooldown key includes conversation to scope properly.
 * Typing in chat A won't cooldown typing in chat B.
 */
function getCooldownKey(signal: DirectorSignal): string {
    return `${signal.type}:${signal.deviceId}:${signal.appId}:${signal.conversationId ?? ""}`;
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

    // === NEW: FocusAnchor effects use semantic anchors ===
    if (rule.effect === "FocusAnchor" && rule.anchor) {
        return {
            type: "FocusAnchor",
            category: rule.category,
            priority: rule.priority,
            progress,
            anchor: rule.anchor,      // Semantic anchor ID
            preset: rule.preset,      // Shot preset
            scale: rule.scale,
            seed: seed + signal.at,
        };
    }

    // === Legacy: PushIn, ZoomToRect, PullBack use pixel rects ===
    // Resolve target (only for legacy effects)
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
            return layout.inputAreaRect;
        case "lastMessage":
            return layout.lastMessageRect ?? null;
        default:
            return null;
    }
}

/**
 * Arbitrate effects by category.
 * - Framing: exactly 1 wins (highest priority)
 * - Shake: max 2, stacks
 */
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
