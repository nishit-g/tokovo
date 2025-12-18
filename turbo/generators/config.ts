import type { PlopTypes } from "@turbo/gen";
import path from "path";

/**
 * Tokovo Plugin Generator Configuration
 * 
 * This file configures Turborepo's code generation system.
 * 
 * Usage:
 *   npx turbo gen plugin
 * 
 * @see https://turbo.build/repo/docs/core-concepts/code-generation
 */
export default function generator(plop: PlopTypes.NodePlopAPI): void {
    // Plugin Generator
    plop.setGenerator("plugin", {
        description: "Generate a new Tokovo app plugin (e.g., Instagram, Twitter, iMessage)",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "Plugin name (lowercase, e.g., instagram):",
                validate: (input: string) => {
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
            // Generate all template files
            {
                type: "addMany",
                destination: path.join(process.cwd(), "packages/apps-{{ kebabCase name }}"),
                templateFiles: path.join(__dirname, "plugin/templates/**/*"),
                base: path.join(__dirname, "plugin/templates"),
                globOptions: {
                    dot: true,
                },
            },
        ],
    });

    // Add custom helpers for case conversion
    plop.setHelper("pascalCase", (text: string) => {
        return text
            .split(/[-_\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");
    });

    plop.setHelper("camelCase", (text: string) => {
        const pascal = text
            .split(/[-_\s]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");
        return pascal.charAt(0).toLowerCase() + pascal.slice(1);
    });

    plop.setHelper("snakeCase", (text: string) => {
        return text
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .replace(/[-\s]+/g, "_")
            .toLowerCase();
    });

    plop.setHelper("kebabCase", (text: string) => {
        return text
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .replace(/[_\s]+/g, "-")
            .toLowerCase();
    });
}
