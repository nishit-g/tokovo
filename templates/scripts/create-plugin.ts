#!/usr/bin/env node
/**
 * Create Plugin Script
 * 
 * Usage: npx ts-node templates/scripts/create-plugin.ts <plugin-name>
 * Example: npx ts-node templates/scripts/create-plugin.ts instagram
 * 
 * This will create a new plugin at packages/apps-<plugin-name>/
 */

import * as fs from "fs";
import * as path from "path";

// =============================================================================
// CONFIGURATION
// =============================================================================

const TEMPLATE_DIR = path.join(__dirname, "..", "plugin");
const PACKAGES_DIR = path.join(__dirname, "..", "..", "packages");

// =============================================================================
// HELPERS
// =============================================================================

function toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function replaceTemplateVars(content: string, vars: Record<string, string>): string {
    let result = content;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
}

function copyTemplateFile(
    templatePath: string,
    destPath: string,
    vars: Record<string, string>
): void {
    const content = fs.readFileSync(templatePath, "utf-8");
    const processedContent = replaceTemplateVars(content, vars);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(destPath, processedContent);
    console.log(`  ✓ Created ${destPath}`);
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error("Usage: npx ts-node create-plugin.ts <plugin-name>");
        console.error("Example: npx ts-node create-plugin.ts instagram");
        process.exit(1);
    }

    const pluginName = args[0].toLowerCase();
    const pluginDir = path.join(PACKAGES_DIR, `apps-${pluginName}`);

    // Check if plugin already exists
    if (fs.existsSync(pluginDir)) {
        console.error(`Error: Plugin already exists at ${pluginDir}`);
        process.exit(1);
    }

    console.log(`\n🔧 Creating plugin: ${pluginName}\n`);

    // Template variables
    const vars: Record<string, string> = {
        APP_ID: pluginName,
        APP_NAME: toPascalCase(pluginName),
        APP_DISPLAY_NAME: toTitleCase(pluginName),
    };

    // Create directory structure
    const dirs = [
        "",
        "src",
        "src/logic",
        "src/ui",
        "src/ui/strategies",
        "src/ui/screens",
        "src/ui/screens/ios",
        "src/ui/screens/android",
        "src/components",
        "src/components/ios",
        "src/components/android",
        "src/assets",
        "src/adapters",
    ];

    for (const dir of dirs) {
        const fullPath = path.join(pluginDir, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }

    // Copy template files
    const templateFiles: Array<[string, string]> = [
        ["package.json.template", "package.json"],
        ["src/index.ts.template", "src/index.ts"],
        ["src/plugin.ts.template", "src/plugin.ts"],
        ["src/types.ts.template", "src/types.ts"],
        ["src/lowering.ts.template", "src/lowering.ts"],
        ["src/dsl-extension.ts.template", "src/dsl-extension.ts"],
        ["src/logic/reducer.ts.template", "src/logic/reducer.ts"],
    ];

    for (const [templateFile, destFile] of templateFiles) {
        const templatePath = path.join(TEMPLATE_DIR, templateFile);
        const destPath = path.join(pluginDir, destFile);

        if (fs.existsSync(templatePath)) {
            copyTemplateFile(templatePath, destPath, vars);
        } else {
            console.warn(`  ⚠ Template not found: ${templatePath}`);
        }
    }

    // Create placeholder files
    const placeholders: Array<[string, string]> = [
        ["src/augment.ts", `// Type augmentation for ${vars.APP_DISPLAY_NAME}\n// TODO: Add type-safe accessors\n`],
        ["src/ui/index.tsx", `// UI exports for ${vars.APP_DISPLAY_NAME}\n// TODO: Create main view component\n\nimport React from "react";\n\nexport const ${vars.APP_NAME}View: React.FC = () => {\n    return <div>${vars.APP_DISPLAY_NAME} View</div>;\n};\n`],
        ["src/ui/strategies/index.ts", `// UI Strategies for ${vars.APP_DISPLAY_NAME}\n// TODO: Create iOS and Android strategies\n`],
        ["src/assets/audio-rules.ts", `// Audio rules for ${vars.APP_DISPLAY_NAME}\nexport const ${pluginName}AudioRules = [];\n`],
        ["tsconfig.json", `{\n    "extends": "../../tsconfig.json",\n    "compilerOptions": {\n        "outDir": "./dist"\n    },\n    "include": ["src/**/*"]\n}\n`],
    ];

    for (const [filePath, content] of placeholders) {
        const fullPath = path.join(pluginDir, filePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content);
        console.log(`  ✓ Created ${fullPath}`);
    }

    console.log(`\n✅ Plugin created at ${pluginDir}`);
    console.log("\nNext steps:");
    console.log(`  1. cd packages/apps-${pluginName}`);
    console.log("  2. Update src/ui/index.tsx with your view component");
    console.log("  3. Add the plugin to pnpm-workspace.yaml if needed");
    console.log("  4. Run: pnpm install");
    console.log("");
}

main();
