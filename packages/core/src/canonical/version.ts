/**
 * Tokovo Versioning
 *
 * Version constants for canonical schema, engine, and DSL.
 * Bumped on breaking changes.
 *
 * Every artifact includes version info for:
 * - Bug reports (which version was this generated with?)
 * - Migrations (is this schema compatible?)
 * - CI (detect version mismatches)
 *
 * @module @tokovo/core/canonical/version
 */

// =============================================================================
// VERSION CONSTANTS
// =============================================================================

/**
 * Tokovo version constants.
 *
 * Bump these on breaking changes.
 */
export const TOKOVO_VERSION = {
    /** Canonical schema version (events, content, identity) */
    schema: "1.0.0",

    /** Engine version (routing, reducers, replay) */
    engine: "1.0.0",

    /** DSL version (episode, beat, device builders) */
    dsl: "1.0.0",
} as const;

/**
 * Version type.
 */
export type TokovoVersion = typeof TOKOVO_VERSION;

// =============================================================================
// VERSIONED OUTPUT
// =============================================================================

/**
 * Metadata included in all artifacts.
 */
export interface VersionedOutput {
    readonly _tokovo: {
        /** Schema version */
        readonly schemaVersion: string;
        /** Engine version */
        readonly engineVersion: string;
        /** When this was generated (ISO timestamp) */
        readonly generatedAt: string;
        /** Generator name (e.g., "tokovo-compiler") */
        readonly generator?: string;
    };
}

/**
 * Create version metadata for an artifact.
 */
export function createVersionMetadata(generator?: string): VersionedOutput["_tokovo"] {
    return {
        schemaVersion: TOKOVO_VERSION.schema,
        engineVersion: TOKOVO_VERSION.engine,
        generatedAt: new Date().toISOString(),
        generator,
    };
}

/**
 * Check if a versioned output is compatible with current version.
 */
export function isVersionCompatible(output: VersionedOutput): boolean {
    const { schemaVersion } = output._tokovo;
    return schemaVersion === TOKOVO_VERSION.schema;
}

/**
 * Check schema version compatibility (major version match).
 */
export function isMajorVersionCompatible(output: VersionedOutput): boolean {
    const { schemaVersion } = output._tokovo;
    const currentMajor = TOKOVO_VERSION.schema.split(".")[0];
    const outputMajor = schemaVersion.split(".")[0];
    return currentMajor === outputMajor;
}

// =============================================================================
// VERSION HELPERS
// =============================================================================

/**
 * Parse a version string.
 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
    const [major, minor, patch] = version.split(".").map(Number);
    return { major: major ?? 0, minor: minor ?? 0, patch: patch ?? 0 };
}

/**
 * Compare two versions.
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
    const va = parseVersion(a);
    const vb = parseVersion(b);

    if (va.major !== vb.major) return va.major < vb.major ? -1 : 1;
    if (va.minor !== vb.minor) return va.minor < vb.minor ? -1 : 1;
    if (va.patch !== vb.patch) return va.patch < vb.patch ? -1 : 1;
    return 0;
}

/**
 * Format version info for display.
 */
export function formatVersionInfo(): string {
    return `Tokovo v${TOKOVO_VERSION.schema} (engine: ${TOKOVO_VERSION.engine}, dsl: ${TOKOVO_VERSION.dsl})`;
}
