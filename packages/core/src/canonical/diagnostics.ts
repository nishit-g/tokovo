/**
 * Diagnostics Format
 *
 * Structured error/warning format for compile-time validation.
 * Makes Tokovo feel like TypeScript/Rust-quality tooling.
 *
 * @module @tokovo/core/canonical/diagnostics
 */

// =============================================================================
// SEVERITY
// =============================================================================

export type DiagnosticSeverity = "error" | "warning" | "info";

// =============================================================================
// COMMON DIAGNOSTIC CODES
// =============================================================================

/**
 * Diagnostic codes for common issues.
 *
 * Core defines common codes. Compiler/plugins can extend with their own.
 */
export type DiagnosticCode =
    // Scene validation
    | "UNKNOWN_APP"
    | "MISSING_CONVERSATION"
    | "MISSING_CAPABILITY"
    | "MISSING_SCHEMA_SUPPORT"
    | "INVALID_BEAT"
    // Timeline validation
    | "MISSING_ACTOR"
    | "NEGATIVE_FRAME"
    | "FRAME_OVERFLOW"
    | "DUPLICATE_ID"
    // Content validation
    | "MISSING_REQUIRED_FIELD"
    | "INVALID_CONTENT_KIND"
    | "UNSUPPORTED_CONTENT"
    | "INVALID_URL"
    // Custom validation
    | "UNNAMESPACED_CUSTOM"
    | "DISALLOWED_CUSTOM"
    | "CUSTOM_THRESHOLD_EXCEEDED"
    // General
    | "INTERNAL_ERROR"
    | string; // Extensible

// =============================================================================
// DIAGNOSTIC
// =============================================================================

/**
 * Structured diagnostic message.
 */
export interface Diagnostic {
    /** Machine-readable error code */
    readonly code: DiagnosticCode;

    /** Human-readable message */
    readonly message: string;

    /** Severity level */
    readonly severity: DiagnosticSeverity;

    /** Trace to source location */
    readonly trace?: DiagnosticTrace;

    /** Actionable hint for fixing */
    readonly hint?: string;

    /** Link to documentation */
    readonly docsLink?: string;

    /** Related diagnostics */
    readonly related?: ReadonlyArray<Diagnostic>;
}

/**
 * Trace for locating the issue in source.
 */
export interface DiagnosticTrace {
    readonly episodeId?: string;
    readonly deviceId?: string;
    readonly beatName?: string;
    readonly opIndex?: number;
    readonly conversationId?: string;
    readonly line?: number;
    readonly column?: number;
}

// =============================================================================
// VALIDATION RESULT
// =============================================================================

/**
 * Result of a validation pass.
 */
export interface ValidationResult {
    /** Whether validation passed (no errors, warnings ok) */
    readonly valid: boolean;
    /** Error diagnostics */
    readonly errors: ReadonlyArray<Diagnostic>;
    /** Warning diagnostics */
    readonly warnings: ReadonlyArray<Diagnostic>;
    /** Info diagnostics */
    readonly infos: ReadonlyArray<Diagnostic>;
}

/**
 * Create a passing validation result.
 */
export function validResult(): ValidationResult {
    return { valid: true, errors: [], warnings: [], infos: [] };
}

/**
 * Create a failing validation result.
 */
export function invalidResult(errors: Diagnostic[]): ValidationResult {
    return { valid: false, errors, warnings: [], infos: [] };
}

/**
 * Categorize diagnostics into a validation result.
 */
export function categorize(diagnostics: ReadonlyArray<Diagnostic>): ValidationResult {
    const errors: Diagnostic[] = [];
    const warnings: Diagnostic[] = [];
    const infos: Diagnostic[] = [];

    for (const d of diagnostics) {
        switch (d.severity) {
            case "error":
                errors.push(d);
                break;
            case "warning":
                warnings.push(d);
                break;
            case "info":
                infos.push(d);
                break;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        infos,
    };
}

/**
 * Merge multiple validation results.
 */
export function mergeResults(...results: ValidationResult[]): ValidationResult {
    const errors: Diagnostic[] = [];
    const warnings: Diagnostic[] = [];
    const infos: Diagnostic[] = [];

    for (const r of results) {
        errors.push(...r.errors);
        warnings.push(...r.warnings);
        infos.push(...r.infos);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        infos,
    };
}

// =============================================================================
// DIAGNOSTIC BUILDERS
// =============================================================================

/**
 * Create an error diagnostic.
 */
export function error(
    code: DiagnosticCode,
    message: string,
    options?: Partial<Omit<Diagnostic, "code" | "message" | "severity">>
): Diagnostic {
    return { code, message, severity: "error", ...options };
}

/**
 * Create a warning diagnostic.
 */
export function warning(
    code: DiagnosticCode,
    message: string,
    options?: Partial<Omit<Diagnostic, "code" | "message" | "severity">>
): Diagnostic {
    return { code, message, severity: "warning", ...options };
}

/**
 * Create an info diagnostic.
 */
export function info(
    code: DiagnosticCode,
    message: string,
    options?: Partial<Omit<Diagnostic, "code" | "message" | "severity">>
): Diagnostic {
    return { code, message, severity: "info", ...options };
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format a diagnostic for CLI/terminal output.
 */
export function formatDiagnostic(d: Diagnostic): string {
    const icon =
        d.severity === "error" ? "❌" : d.severity === "warning" ? "⚠️" : "ℹ️";

    const location = d.trace
        ? ` [${d.trace.deviceId || ""}${d.trace.beatName ? `:${d.trace.beatName}` : ""}]`
        : "";

    let output = `${icon} ${d.code}${location}: ${d.message}`;

    if (d.hint) {
        output += `\n   💡 ${d.hint}`;
    }
    if (d.docsLink) {
        output += `\n   📚 ${d.docsLink}`;
    }

    return output;
}

/**
 * Format all diagnostics in a validation result.
 */
export function formatValidationResult(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.errors.length > 0) {
        lines.push(`Errors (${result.errors.length}):`);
        for (const d of result.errors) {
            lines.push(`  ${formatDiagnostic(d)}`);
        }
    }

    if (result.warnings.length > 0) {
        lines.push(`Warnings (${result.warnings.length}):`);
        for (const d of result.warnings) {
            lines.push(`  ${formatDiagnostic(d)}`);
        }
    }

    if (result.valid && lines.length === 0) {
        lines.push("✅ Validation passed");
    }

    return lines.join("\n");
}

// =============================================================================
// VALIDATION ERROR
// =============================================================================

/**
 * Error thrown when validation fails in strict mode.
 */
export class ValidationError extends Error {
    readonly diagnostics: ReadonlyArray<Diagnostic>;

    constructor(message: string, diagnostics: Diagnostic[] = []) {
        super(message);
        this.name = "ValidationError";
        this.diagnostics = diagnostics;
    }

    static fromResult(result: ValidationResult): ValidationError {
        const message = result.errors.map((d) => d.message).join("; ");
        return new ValidationError(message, [...result.errors]);
    }
}
