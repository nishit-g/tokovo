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

    // ==========================================================================
    // EPISODE GENERATOR
    // ==========================================================================
    plop.setGenerator("episode", {
        description: "Generate a new Tokovo episode",
        prompts: [
            {
                type: "input",
                name: "id",
                message: "Episode ID (kebab-case, e.g., my-awesome-episode):",
                validate: (input: string) => {
                    if (!/^[a-z][a-z0-9-]*$/.test(input)) {
                        return "ID must be kebab-case (lowercase with dashes)";
                    }
                    return true;
                },
            },
            {
                type: "input",
                name: "title",
                message: "Episode title (e.g., My Awesome Episode):",
            },
            {
                type: "input",
                name: "description",
                message: "Description:",
                default: "A Tokovo episode",
            },
            {
                type: "list",
                name: "category",
                message: "Category:",
                choices: ["production", "showcase", "test"],
                default: "production",
            },
            {
                type: "list",
                name: "format",
                message: "Video format:",
                choices: ["1080x1920", "1080x1920@60", "1920x1080", "1080x1080", "iphone-16-pro"],
                default: "1080x1920",
            },
            {
                type: "input",
                name: "duration",
                message: "Duration (e.g., 30s, 1m, 45s):",
                default: "30s",
            },
            {
                type: "checkbox",
                name: "apps",
                message: "Apps to include:",
                choices: ["app_whatsapp", "app_twitter", "app_instagram"],
                default: ["app_whatsapp"],
            },
        ],
        actions: (answers: any) => {
            // Map category to folder name
            const categoryToFolder: Record<string, string> = {
                production: "production",
                showcase: "showcases",
                test: "tests",
            };
            const folder = categoryToFolder[answers.category] || answers.category;

            // Calculate derived values
            const fps = answers.format?.includes("@60") ? 60 : 30;
            const durationMatch = answers.duration?.match(/^(\d+)(s|m)$/);
            let durationInFrames = 900; // default 30s
            if (durationMatch) {
                const value = parseInt(durationMatch[1]);
                const unit = durationMatch[2];
                durationInFrames = unit === "m" ? value * 60 * fps : value * fps;
            }

            // Add computed values to answers
            answers.fps = fps;
            answers.durationInFrames = durationInFrames;
            answers.hasWhatsApp = answers.apps?.includes("app_whatsapp");
            answers.tags = answers.apps || [];
            answers.folder = folder;

            const actions: any[] = [
                {
                    type: "add",
                    path: path.join(
                        process.cwd(),
                        `packages/episodes/src/${folder}/${answers.id}.episode.ts`
                    ),
                    templateFile: path.join(__dirname, "episode/templates/episode.ts.hbs"),
                },
            ];

            // Only append to barrel if index.ts exists
            const barrelPath = path.join(
                process.cwd(),
                `packages/episodes/src/${folder}/index.ts`
            );

            actions.push({
                type: "append",
                path: barrelPath,
                template: `import "./${answers.id}.episode";\n`,
            });

            return actions;
        },
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
