import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(repoRoot, "packages/assets/public");
const manifestPath = path.join(publicRoot, "asset-provenance.json");
const write = process.argv.includes("--write");

function filesBelow(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? filesBelow(target) : [target];
    })
    .filter((file) => file !== manifestPath)
    .sort();
}

function provenanceFor(relativePath) {
  if (relativePath.startsWith("sounds/")) {
    return {
      source: "procedurally-generated-in-repository",
      license: "LicenseRef-Tokovo-Procedural",
    };
  }
  if (relativePath.startsWith("voice/")) {
    return {
      source: "generated-demo-voice-fixture",
      license: "LicenseRef-Tokovo-Original-Fixture",
    };
  }
  if (relativePath.startsWith("icons/") || relativePath.endsWith(".svg")) {
    return {
      source: "authored-in-repository-vector-fixture",
      license: "LicenseRef-Tokovo-Original-Fixture",
    };
  }
  if (relativePath.startsWith("assets/")) {
    return {
      source: "authored-device-calibration-fixture",
      license: "LicenseRef-Tokovo-Original-Fixture",
    };
  }
  return {
    source: "original-or-generated-episode-fixture",
    license: "LicenseRef-Tokovo-Original-Fixture",
  };
}

function buildManifest() {
  return {
    version: 1,
    policy: "ASSET_LICENSES.md",
    assets: filesBelow(publicRoot).map((absolutePath) => {
      const bytes = fs.readFileSync(absolutePath);
      const relativePath = path.relative(publicRoot, absolutePath).split(path.sep).join("/");
      return {
        path: relativePath,
        bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        ...provenanceFor(relativePath),
      };
    }),
  };
}

const expected = buildManifest();
if (write) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(expected, null, 2)}\n`, "utf8");
  console.log(`Wrote ${expected.assets.length} asset provenance records.`);
  process.exit(0);
}

if (!fs.existsSync(manifestPath)) {
  throw new Error("ASSET_PROVENANCE_MISSING: run pnpm assets:provenance:sync");
}
const actual = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(
    "ASSET_PROVENANCE_STALE: bundled assets or hashes changed; run pnpm assets:provenance:sync",
  );
}
if (expected.assets.some((asset) => asset.path.startsWith("placeholders/"))) {
  throw new Error("ASSET_PLACEHOLDER_FORBIDDEN: release assets may not use placeholders/");
}
console.log(`Verified ${expected.assets.length} asset provenance records.`);
