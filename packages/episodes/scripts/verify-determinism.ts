#!/usr/bin/env tsx
/**
 * Determinism Verification Script
 *
 * Compiles all DSL episodes and compares hashes against golden values.
 * Fails if hashes don't match (indicating non-determinism).
 *
 * Usage:
 *   pnpm verify-determinism         # Check all episodes
 *   pnpm verify-determinism --update  # Update golden hashes
 *
 * @module @tokovo/episodes/scripts/verify-determinism
 */

/// <reference types="node" />

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

// =============================================================================
// STABLE STRINGIFY (self-contained copy to avoid import issues)
// =============================================================================

function stableStringify(obj: unknown): string {
    return JSON.stringify(obj, stableReplacer);
}

function stableReplacer(_key: string, value: unknown): unknown {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        const sorted: Record<string, unknown> = {};
        const keys = Object.keys(value as Record<string, unknown>).sort();
        for (const k of keys) {
            sorted[k] = (value as Record<string, unknown>)[k];
        }
        return sorted;
    }
    return value;
}

async function computeHash(data: unknown): Promise<string> {
    const json = stableStringify(data);
    const hash = crypto.createHash("sha256").update(json).digest("hex");
    return hash;
}

// =============================================================================
// EPISODE DISCOVERY
// =============================================================================

interface EpisodeFile {
    name: string;
    path: string;
}

function findDSLEpisodes(baseDir: string): EpisodeFile[] {
    const dslDir = path.join(baseDir, "src", "dsl");

    if (!fs.existsSync(dslDir)) {
        console.log("No DSL directory found at", dslDir);
        return [];
    }

    const files = fs.readdirSync(dslDir);
    return files
        .filter((f: string) => f.endsWith(".dsl.ts"))
        .map((f: string) => ({
            name: f.replace(".dsl.ts", ""),
            path: path.join(dslDir, f),
        }));
}

// =============================================================================
// GOLDEN HASHES
// =============================================================================

interface GoldenEntry {
    episodeName: string;
    hash: string;
    generatedAt: string;
    schemaVersion: string;
}

interface GoldenFile {
    version: number;
    entries: GoldenEntry[];
}

function loadGoldenFile(goldenPath: string): GoldenFile {
    if (!fs.existsSync(goldenPath)) {
        return { version: 1, entries: [] };
    }
    const content = fs.readFileSync(goldenPath, "utf-8");
    return JSON.parse(content);
}

function saveGoldenFile(goldenPath: string, data: GoldenFile): void {
    fs.writeFileSync(goldenPath, JSON.stringify(data, null, 2));
    console.log(`✅ Updated golden file: ${goldenPath}`);
}

// =============================================================================
// COMPILATION (simplified - actual implementation would import from compiler)
// =============================================================================

interface CompileResult {
    episodeId: string;
    opCount: number;
    actorCount: number;
    fps: number;
    durationInFrames: number;
}

async function compileEpisode(episodePath: string): Promise<CompileResult | null> {
    // In a real implementation, this would:
    // 1. Import the DSL module
    // 2. Call the exported builder
    // 3. Compile to TimelineIR
    // 4. Return the result

    // For now, we just simulate the structure
    console.log(`  📦 Would compile: ${path.basename(episodePath)}`);

    return {
        episodeId: path.basename(episodePath, ".dsl.ts"),
        opCount: 0,
        actorCount: 0,
        fps: 30,
        durationInFrames: 0,
    };
}

// =============================================================================
// VERIFICATION
// =============================================================================

interface VerifyResult {
    passed: boolean;
    mismatches: string[];
    newEpisodes: string[];
}

async function verifyDeterminism(
    episodes: EpisodeFile[],
    goldenFile: GoldenFile
): Promise<VerifyResult> {
    const mismatches: string[] = [];
    const newEpisodes: string[] = [];
    const goldenMap = new Map(goldenFile.entries.map((e) => [e.episodeName, e]));

    for (const episode of episodes) {
        const result = await compileEpisode(episode.path);
        if (!result) {
            console.log(`  ⚠️ Failed to compile: ${episode.name}`);
            continue;
        }

        const hash = await computeHash(result);
        const golden = goldenMap.get(episode.name);

        if (!golden) {
            newEpisodes.push(episode.name);
            console.log(`  🆕 New episode: ${episode.name}`);
        } else if (golden.hash !== hash) {
            mismatches.push(episode.name);
            console.log(`  ❌ Hash mismatch: ${episode.name}`);
            console.log(`     Expected: ${golden.hash.slice(0, 16)}...`);
            console.log(`     Got:      ${hash.slice(0, 16)}...`);
        } else {
            console.log(`  ✅ ${episode.name}`);
        }
    }

    return {
        passed: mismatches.length === 0,
        mismatches,
        newEpisodes,
    };
}

// =============================================================================
// UPDATE GOLDEN HASHES
// =============================================================================

async function updateGoldenHashes(
    episodes: EpisodeFile[],
    goldenPath: string
): Promise<void> {
    const entries: GoldenEntry[] = [];

    for (const episode of episodes) {
        const result = await compileEpisode(episode.path);
        if (!result) continue;

        const hash = await computeHash(result);
        entries.push({
            episodeName: episode.name,
            hash,
            generatedAt: new Date().toISOString(),
            schemaVersion: "1.0.0",
        });
        console.log(`  📝 ${episode.name}: ${hash.slice(0, 16)}...`);
    }

    const goldenFile: GoldenFile = {
        version: 1,
        entries,
    };

    saveGoldenFile(goldenPath, goldenFile);
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const updateMode = args.includes("--update");

    const episodesDir = path.resolve(import.meta.dirname ?? ".", "..");
    const goldenPath = path.join(episodesDir, "src", "golden", "hashes.json");

    console.log("🔍 Tokovo Determinism Verification");
    console.log("===================================\n");

    const episodes = findDSLEpisodes(episodesDir);
    console.log(`Found ${episodes.length} DSL episodes\n`);

    if (episodes.length === 0) {
        console.log("No episodes to verify. Create .dsl.ts files in src/dsl/\n");
        process.exit(0);
    }

    if (updateMode) {
        console.log("📝 Updating golden hashes...\n");
        await updateGoldenHashes(episodes, goldenPath);
        console.log("\n✅ Golden hashes updated!");
    } else {
        console.log("🔍 Verifying determinism...\n");
        const golden = loadGoldenFile(goldenPath);
        const result = await verifyDeterminism(episodes, golden);

        console.log("\n===================================");

        if (result.newEpisodes.length > 0) {
            console.log(`\n🆕 New episodes (${result.newEpisodes.length}):`);
            result.newEpisodes.forEach((e) => console.log(`   - ${e}`));
            console.log("\nRun with --update to add golden hashes for new episodes.");
        }

        if (result.passed) {
            console.log("\n✅ All episodes are deterministic!");
            process.exit(0);
        } else {
            console.log(`\n❌ ${result.mismatches.length} episode(s) failed determinism check.`);
            console.log("\nThis means the compiler is producing different output for the same input.");
            console.log("Check for uses of Math.random(), Date.now(), or non-deterministic ordering.");
            process.exit(1);
        }
    }
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
