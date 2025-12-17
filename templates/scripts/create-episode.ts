#!/usr/bin/env node
/**
 * Create Episode Script
 * 
 * Usage: npx ts-node templates/scripts/create-episode.ts <episode-name>
 * Example: npx ts-node templates/scripts/create-episode.ts my-drama
 * 
 * This will create a new episode at packages/episodes/src/<episode-name>.episode.ts
 */

import * as fs from "fs";
import * as path from "path";

// =============================================================================
// CONFIGURATION
// =============================================================================

const TEMPLATE_DIR = path.join(__dirname, "..", "episode");
const EPISODES_DIR = path.join(__dirname, "..", "..", "packages", "episodes", "src");

// =============================================================================
// HELPERS
// =============================================================================

function toTitleCase(str: string): string {
    return str
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function replaceTemplateVars(content: string, vars: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error("Usage: npx ts-node create-episode.ts <episode-name>");
        console.error("Example: npx ts-node create-episode.ts my-drama");
        process.exit(1);
    }

    const episodeName = args[0].toLowerCase();
    const episodeFile = path.join(EPISODES_DIR, `${episodeName}.episode.ts`);

    // Check if episode already exists
    if (fs.existsSync(episodeFile)) {
        console.error(`Error: Episode already exists at ${episodeFile}`);
        process.exit(1);
    }

    console.log(`\n📝 Creating episode: ${episodeName}\n`);

    // Template variables
    const vars: Record<string, string> = {
        EPISODE_ID: episodeName,
        EPISODE_NAME: toTitleCase(episodeName),
        EPISODE_VAR_NAME: toCamelCase(episodeName) + "Episode",
    };

    // Read template
    const templatePath = path.join(TEMPLATE_DIR, "episode.ts.template");

    if (!fs.existsSync(templatePath)) {
        console.error(`Error: Template not found at ${templatePath}`);
        process.exit(1);
    }

    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const processedContent = replaceTemplateVars(templateContent, vars);

    // Ensure episodes directory exists
    if (!fs.existsSync(EPISODES_DIR)) {
        fs.mkdirSync(EPISODES_DIR, { recursive: true });
    }

    // Write episode file
    fs.writeFileSync(episodeFile, processedContent);
    console.log(`  ✓ Created ${episodeFile}`);

    // Update index.ts to export the new episode
    const indexPath = path.join(EPISODES_DIR, "index.ts");
    if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, "utf-8");
        const exportLine = `export { ${vars.EPISODE_VAR_NAME} } from "./${episodeName}.episode";\n`;

        if (!indexContent.includes(vars.EPISODE_VAR_NAME)) {
            fs.appendFileSync(indexPath, exportLine);
            console.log(`  ✓ Added export to ${indexPath}`);
        }
    }

    console.log(`\n✅ Episode created at ${episodeFile}`);
    console.log("\nNext steps:");
    console.log(`  1. Edit ${episodeFile} to customize your episode`);
    console.log("  2. Create a video component in apps/video-runner/src/");
    console.log("  3. Add the composition to Root.tsx");
    console.log("");
}

main();
