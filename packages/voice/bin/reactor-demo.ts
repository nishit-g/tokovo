#!/usr/bin/env node
import path from "node:path";
import { runReactorVoiceDemo } from "../src/scripts/index.js";

async function main() {
  const result = await runReactorVoiceDemo();
  const manifestPath =
    result.artifact.manifestPath ??
    path.join(path.dirname(result.artifact.audioPath), "manifest.json");

  console.log(
    JSON.stringify(
      {
        requestId: result.request.id,
        provider: result.artifact.provider,
        model: result.artifact.model,
        usedFallback: result.artifact.usedFallback,
        alignmentCoverage: result.artifact.alignmentCoverage,
        audioPath: result.artifact.audioPath,
        manifestPath,
        segmentCount: result.manifest.segments.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
