#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { dryRun, formatDryRunResult, validateEpisode } from "./dry-run";
import { formatValidationIssues } from "@tokovo/core";

interface CLIOptions {
  file?: string;
  verbose?: boolean;
  json?: boolean;
  strict?: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--json" || arg === "-j") {
      options.json = true;
    } else if (arg === "--strict" || arg === "-s") {
      options.strict = true;
    } else if (!arg.startsWith("-")) {
      options.file = arg;
    }
  }

  return options;
}

function printUsage(): void {
  console.log(`
Tokovo Episode Validator

Usage:
  tokovo-validate <file.json> [options]

Options:
  -v, --verbose    Show detailed validation output
  -j, --json       Output result as JSON
  -s, --strict     Fail on warnings
  -h, --help       Show this help message

Examples:
  tokovo-validate episode.json
  tokovo-validate episode.json --verbose
  tokovo-validate episode.json --json > result.json
`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const options = parseArgs(args);

  if (!options.file) {
    console.error("Error: No file specified");
    printUsage();
    process.exit(1);
  }

  const filePath = resolve(process.cwd(), options.file);

  if (!existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error(`Error parsing JSON: ${err}`);
    process.exit(1);
  }

  const result = dryRun(parsed, {
    strict: options.strict,
    collectWarnings: true,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatDryRunResult(result));

    if (options.verbose && result.valid) {
      console.log("\n--- Validation Details ---");
      const validation = validateEpisode(parsed);
      if (validation.issues.length > 0) {
        console.log(formatValidationIssues(validation.issues));
      } else {
        console.log("No validation issues found.");
      }
    }
  }

  if (!result.valid) {
    process.exit(1);
  }

  if (options.strict && result.warnings.length > 0) {
    console.error("\nFailing due to warnings (strict mode)");
    process.exit(1);
  }

  process.exit(0);
}

main();
