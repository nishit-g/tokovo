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
}
