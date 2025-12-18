/**
 * Tokovo Plugin Generator
 * 
 * Enterprise-grade generator for creating new app plugins.
 * Uses Turborepo's code generation framework.
 * 
 * Usage:
 *   npx turbo gen plugin
 * 
 * This will prompt for:
 *   - Plugin name (lowercase, e.g., "instagram")
 *   - Display name (e.g., "Instagram")
 *   - Theme color (hex, e.g., "#E1306C")
 *   - Icon (emoji, e.g., "📸")
 * 
 * And generate a complete plugin with:
 *   - types/        Type definitions
 *   - runtime/      State management
 *   - views/        UI components
 *   - ir/           Intermediate representation
 *   - lowering/     Compiler integration
 *   - dsl/          Authoring DSL
 *   - camera/       Director system
 *   - layout/       Layout computation
 *   - config/       Configuration
 *   - assets/       Sounds, icons
 *   - README.md     Documentation
 */

import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
    plop.setGenerator("plugin", {
        description: "Generate a new Tokovo app plugin",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Plugin name (lowercase, e.g., instagram):",
                validate: (input) => {
                    if (!/^[a-z][a-z0-9-]*$/.test(input)) {
                        return "Name must be lowercase alphanumeric with optional dashes";
                    }
                    return true;
                },
            },
            {
                type: "input",
                name: "displayName",
                message: "Display name (e.g., Instagram):",
            },
            {
                type: "input",
                name: "themeColor",
                message: "Primary theme color (hex, e.g., #E1306C):",
                default: "#007AFF",
            },
            {
                type: "input",
                name: "icon",
                message: "Emoji icon (e.g., 📸):",
                default: "📱",
            },
        ],
        actions: [
            // Package Structure
            {
                type: "addMany",
                destination: "packages/apps-{{ kebabCase name }}",
                templateFiles: "templates/**/*",
                base: "templates",
            },
        ],
    });
}
