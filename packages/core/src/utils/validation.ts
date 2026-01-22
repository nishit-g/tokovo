import { z } from "zod";
import type { TokovoPluginContract } from "../types/plugin-contract";
import type { AppMetadata } from "../registries/metadata";

export const AppMetadataSchema = z.object({
  displayName: z.string(),
  themeColor: z.string().regex(/^#/, "Must be a hex color"),
  icon: z.string(),
  viewStrategy: z
    .enum([
      "CHAT",
      "FEED",
      "STORY",
      "LOCKSCREEN",
      "HOMESCREEN",
      "FULLSCREEN",
      "TRANSITION",
    ])
    .optional(),
  designWidth: z.number().optional().default(393),
}) as z.ZodType<Partial<AppMetadata> & { name?: string }>;

export const TokovoPluginSchema = z.object({
  id: z.string().min(3),
  version: z.string(),
  displayName: z.string(),
  views: z
    .object({
      AppRoot: z.function().optional(),
      strategies: z
        .record(z.string(), z.record(z.string(), z.function()))
        .optional(),
    })
    .optional(),
  assets: z
    .object({
      sounds: z.record(z.string(), z.string()).optional(),
      icons: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  anchors: z.record(z.string(), z.unknown()).optional(),
});

export function validatePlugin<AppId extends string>(
  plugin: TokovoPluginContract<AppId>,
): void {
  TokovoPluginSchema.parse(plugin);

  if (!plugin.views?.AppRoot) {
    throw new Error(
      `[Validation] Plugin ${plugin.id} must provide 'views.AppRoot'.`,
    );
  }

  if (!plugin.displayName) {
    throw new Error(
      `[Validation] Plugin ${plugin.id} must have a displayName.`,
    );
  }

  if (plugin.assets?.sounds) {
    for (const key of Object.keys(plugin.assets.sounds)) {
      if (!key.startsWith(plugin.id)) {
        throw new Error(
          `[Conflict Prevention] Sound key '${key}' in plugin '${plugin.id}' must be namespaced.\n` +
            `It must start with '${plugin.id}' (e.g. '${plugin.id}.sent' or '${plugin.id}_sent').`,
        );
      }
    }
  }
}
