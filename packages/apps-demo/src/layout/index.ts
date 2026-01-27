import type { PluginLayoutStrategy } from "@tokovo/core";

// Minimal stub for MVP - Demo Notes app doesn't need complex layout computation
// Layout strategies compute UI measurements (bubble sizes, positions, etc.)
// For a simple Notes app, we return empty layout data

export const demoLayoutStrategies: PluginLayoutStrategy[] = [
  {
    viewKind: "notes-list",
    // platforms field is optional; omitted for MVP stub
    computeLayout: (ctx: unknown) => {
      // For MVP, return empty object - no complex layout needed
      // Can be expanded later for note card sizing, grid layout, etc.
      return {};
    },
  },
];
