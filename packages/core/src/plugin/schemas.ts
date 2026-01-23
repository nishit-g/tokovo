import { z } from "zod";

const PlatformSchema = z.enum(["ios", "android"]);

export const PluginIdSchema = z
  .string()
  .min(3, "Plugin ID must be at least 3 characters")
  .regex(
    /^[a-z][a-z0-9_]*$/,
    "Plugin ID must be lowercase alphanumeric with underscores (e.g., 'app_whatsapp')",
  );

export const PluginVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+/, "Version must follow semver format (e.g., '1.0.0')");

export const PluginAssetsSchema = z.object({
  sounds: z.record(z.string(), z.string()).optional(),
  icons: z.record(z.string(), z.string()).optional(),
  images: z.record(z.string(), z.string()).optional(),
});

export const PluginAutoSoundRuleSchema = z.object({
  match: z.object({
    kind: z.string().optional(),
    type: z.string().optional(),
    appId: z.string().optional(),
  }),
  sound: z.string(),
  action: z.enum(["PLAY_SOUND"]).optional().default("PLAY_SOUND"),
  volume: z.number().min(0).max(1).optional(),
  priority: z.number().optional(),
});

export const PluginLayoutStrategySchema = z.object({
  viewKind: z.string(),
  platforms: z.array(PlatformSchema).optional(),
  computeLayout: z.function(),
});

export const PluginAnchorRegistrySchema = z.object({
  providers: z.record(z.string(), z.function()),
});

export const TokovoPluginContractSchema = z.object({
  id: PluginIdSchema,
  version: PluginVersionSchema,
  displayName: z.string().min(1, "Display name is required"),
  eventKinds: z.array(z.string().min(1)).readonly().optional(),
  reducer: z.function().optional(),
  views: z
    .object({
      AppRoot: z.function(),
      strategies: z
        .object({
          ios: z.record(z.string(), z.function()).optional(),
          android: z.record(z.string(), z.function()).optional(),
        })
        .optional(),
    })
    .passthrough(),
  assets: PluginAssetsSchema.optional(),
  layouts: z.array(PluginLayoutStrategySchema).optional(),
  audioRules: z.array(PluginAutoSoundRuleSchema).optional(),
  anchors: PluginAnchorRegistrySchema.optional(),
  platforms: z.array(PlatformSchema).optional(),
  dependencies: z.array(z.string()).optional(),
});

export type ParsedPluginContract = z.infer<typeof TokovoPluginContractSchema>;

export interface PluginValidationResult {
  success: boolean;
  data?: ParsedPluginContract;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

export function validatePluginSchema(input: unknown): PluginValidationResult {
  const result = TokovoPluginContractSchema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join(".") || "root",
      message: issue.message,
    })),
  };
}

export function assertPluginSchema(
  input: unknown,
): asserts input is ParsedPluginContract {
  const result = validatePluginSchema(input);

  if (!result.success) {
    const formatted = result
      .errors!.map((e) => `  - ${e.path}: ${e.message}`)
      .join("\n");

    throw new Error(`Plugin schema validation failed:\n${formatted}`);
  }
}
