/**
 * CUSTOM Event Validation
 *
 * Guardrails for CUSTOM events.
 *
 * @module @tokovo/compiler/validation/custom-validator
 */

import type { ValidationMode, Diagnostic, ValidationResult, PluginRegistry } from "./scene-validator";

// Local helpers
function error(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "error", ...opts };
}

function warning(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "warning", ...opts };
}

function categorize(diagnostics: Diagnostic[]): ValidationResult {
    const errors = diagnostics.filter((d) => d.severity === "error");
    const warnings = diagnostics.filter((d) => d.severity === "warning");
    const infos = diagnostics.filter((d) => d.severity === "info");
    return { valid: errors.length === 0, errors, warnings, infos };
}

// =============================================================================
// CUSTOM EVENT VALIDATION
// =============================================================================

export function validateCustomEvent(
    eventName: string,
    appId: string,
    plugins: PluginRegistry,
    mode: ValidationMode
): Diagnostic | null {
    if (!eventName.startsWith(`${appId}.`)) {
        return mode === "strict"
            ? error(
                "UNNAMESPACED_CUSTOM",
                `CUSTOM event "${eventName}" must be namespaced as "${appId}.${eventName}"`,
                {
                    hint: `Rename to "${appId}.${eventName}"`,
                    docsLink: "/docs/events/custom",
                }
            )
            : warning(
                "UNNAMESPACED_CUSTOM",
                `CUSTOM event "${eventName}" should be namespaced as "${appId}.${eventName}"`,
                {}
            );
    }

    const schema = plugins.getSchema(appId);
    if (schema?.allowedCustomEvents) {
        if (!schema.allowedCustomEvents.includes(eventName)) {
            return mode === "strict"
                ? error(
                    "DISALLOWED_CUSTOM",
                    `CUSTOM event "${eventName}" not in plugin allowlist`,
                    {
                        hint: `Add "${eventName}" to plugin.schema.allowedCustomEvents or use a canonical event type`,
                    }
                )
                : warning(
                    "DISALLOWED_CUSTOM",
                    `CUSTOM event "${eventName}" not in plugin allowlist`,
                    {}
                );
        }
    }

    return null;
}

// =============================================================================
// CUSTOM USAGE THRESHOLD
// =============================================================================

export interface CustomUsageResult {
    total: number;
    customCount: number;
    ratio: number;
    status: "ok" | "warning" | "error";
    diagnostics: Diagnostic[];
}

export function checkCustomUsageThreshold(
    events: Array<{ kind: string; type?: string }>,
    warningThreshold = 0.05,
    errorThreshold = 0.15
): CustomUsageResult {
    const appEvents = events.filter((e) => e.kind === "APP");
    const customEvents = appEvents.filter((e) => e.type === "CUSTOM");

    const total = appEvents.length;
    const customCount = customEvents.length;
    const ratio = total > 0 ? customCount / total : 0;

    const diagnostics: Diagnostic[] = [];
    let status: "ok" | "warning" | "error" = "ok";

    if (ratio > errorThreshold) {
        status = "error";
        diagnostics.push(
            error(
                "CUSTOM_THRESHOLD_EXCEEDED",
                `CUSTOM event usage too high: ${(ratio * 100).toFixed(1)}% (threshold: ${(errorThreshold * 100).toFixed(0)}%)`,
                {
                    hint: "Add canonical event types for common patterns instead of using CUSTOM",
                    docsLink: "/docs/events/custom#guidelines",
                }
            )
        );
    } else if (ratio > warningThreshold) {
        status = "warning";
        diagnostics.push(
            warning(
                "CUSTOM_THRESHOLD_EXCEEDED",
                `High CUSTOM event usage: ${(ratio * 100).toFixed(1)}% (warning at ${(warningThreshold * 100).toFixed(0)}%)`,
                {
                    hint: "Consider adding canonical event types for common patterns",
                }
            )
        );
    }

    return { total, customCount, ratio, status, diagnostics };
}

export function validateAllCustomEvents(
    events: Array<{ kind: string; type?: string; name?: string; appId?: string }>,
    plugins: PluginRegistry,
    mode: ValidationMode
): ValidationResult {
    const diagnostics: Diagnostic[] = [];

    for (const event of events) {
        if (event.kind === "APP" && event.type === "CUSTOM" && event.name && event.appId) {
            const diagnostic = validateCustomEvent(event.name, event.appId, plugins, mode);
            if (diagnostic) {
                diagnostics.push(diagnostic);
            }
        }
    }

    const usageResult = checkCustomUsageThreshold(events);
    diagnostics.push(...usageResult.diagnostics);

    return categorize(diagnostics);
}
