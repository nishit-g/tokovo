// turbo/generators/config.ts - FULL IMPLEMENTATION
import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("plugin", {
    description: "Create a new Tokovo app plugin",

    // Step 1: Prompts collect user input
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Plugin name (lowercase, no spaces):",
        validate: (input) =>
          /^[a-z][a-z0-9-]*$/.test(input) ||
          "Must be lowercase with hyphens only",
      },
      {
        type: "input",
        name: "displayName",
        message: "Display name (e.g., 'Notes'):",
        validate: (input) => input.length > 0 || "Required",
      },
      {
        type: "input",
        name: "description",
        message: "Description:",
      },
    ],

    // Step 2: Actions function receives answers, returns action array
    // CRITICAL: This is a FUNCTION, not an array - allows computing derived values
    actions: (answers) => {
      if (!answers) return [];

      const data = {
        ...answers,
        pluginId: `app_${answers.name}`,
        packageName: `@tokovo/apps-${answers.name}`,
      };

      return [
        {
          type: "addMany",
          destination: "{{ turbo.paths.root }}/packages/apps-{{ name }}",
          base: "templates/plugin",
          templateFiles: "templates/plugin/**/*.hbs",
          data: data, // <-- Pass computed data object here
        },
        {
          type: "add",
          path: "{{ turbo.paths.root }}/packages/episodes/src/production/example-{{ name }}.episode.ts",
          templateFile: "templates/episode/example.episode.ts.hbs",
          data: data, // <-- Same data object for episode template
        },
      ];
    },
  });

  plop.setGenerator("episode", {
    description: "Create a new Tokovo episode definition (defineEpisode)",
    prompts: [
      {
        type: "input",
        name: "id",
        message: "Episode id (lowercase, hyphens):",
        validate: (input) =>
          /^[a-z][a-z0-9-]*$/.test(input) ||
          "Must be lowercase with hyphens only",
      },
      {
        type: "input",
        name: "title",
        message: "Title:",
        validate: (input) => input.length > 0 || "Required",
      },
      {
        type: "input",
        name: "description",
        message: "Description (optional):",
      },
      {
        type: "list",
        name: "category",
        message: "Category:",
        choices: ["production", "showcase", "test"],
        default: "production",
      },
      {
        type: "input",
        name: "appId",
        message: "Primary appId (e.g., app_whatsapp):",
        default: "app_whatsapp",
        validate: (input) =>
          /^app_[a-z0-9_]+$/.test(input) || "Must look like app_whatsapp",
      },
      {
        type: "input",
        name: "format",
        message: "Format id (e.g., 1080x1920):",
        default: "1080x1920",
      },
      {
        type: "input",
        name: "fps",
        message: "FPS:",
        default: "30",
        validate: (input) =>
          Number.isFinite(Number(input)) && Number(input) > 0
            ? true
            : "Must be a positive number",
      },
      {
        type: "input",
        name: "durationSeconds",
        message: "Duration (seconds):",
        default: "10",
        validate: (input) =>
          Number.isFinite(Number(input)) && Number(input) > 0
            ? true
            : "Must be a positive number",
      },
    ],
    actions: (answers) => {
      if (!answers) return [];

      const category = String(answers.category);
      const folder =
        category === "production"
          ? "production"
          : category === "showcase"
            ? "showcases"
            : "tests";

      const fps = Number(answers.fps);
      const durationSeconds = Number(answers.durationSeconds);
      const durationInFrames = Math.round(durationSeconds * fps);

      const data = {
        ...answers,
        fps,
        durationSeconds,
        durationInFrames,
        folder,
      };

      const indexPath = `{{ turbo.paths.root }}/packages/episodes/src/${folder}/index.ts`;
      const episodeRelPath = `{{ turbo.paths.root }}/packages/episodes/src/${folder}/${answers.id}.episode.ts`;

      return [
        {
          type: "add",
          path: episodeRelPath,
          templateFile: "templates/episode/basic.episode.ts.hbs",
          data,
        },
        {
          type: "modify",
          path: indexPath,
          pattern: /\/\/ plop:episode-import/u,
          template: `import {{ camelCase id }} from "./{{ id }}.episode";\n// plop:episode-import`,
          data,
        },
        {
          type: "modify",
          path: indexPath,
          pattern: /\/\/ plop:episode-entry/u,
          template: `  {{ camelCase id }},\n  // plop:episode-entry`,
          data,
        },
      ];
    },
  });
}
