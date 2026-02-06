import { z } from "zod";
import type { TokovoPluginContract } from "@tokovo/core";
import type { AppMetadata } from "../registries/metadata.js";

// Core built-in sounds are registered by Tokovo itself and intentionally do not
// require namespacing (e.g. "tap", "notification_soft").
const CORE_SOUND_IDS = new Set([
  "notification",
  "notification_soft",
  "ringtone",
  "call_end",
  "camera_shutter",
  "screenshot",
  "lock",
  "unlock",
  "tap",
  "keyboard_click",
  "suspense",
  "dramatic",
]);

const ViewKindSchema = z.enum([
  "CHAT",
  "FEED",
  "STORY",
  "LOCKSCREEN",
  "HOMESCREEN",
  "FULLSCREEN",
  "TRANSITION",
]);

export const AppMetadataSchema = z.object({
  displayName: z.string(),
  themeColor: z.string().regex(/^#/, "Must be a hex color"),
  icon: z.string(),
  viewStrategy: z
    .enum(ViewKindSchema.options)
    .optional(),
  designWidth: z.number().optional().default(393),
}) as z.ZodType<Partial<AppMetadata> & { name?: string }>;

const PluginLayoutStrategySchema = z.object({
  viewKind: ViewKindSchema,
  computeLayout: z.function(),
  platforms: z.array(z.enum(["ios", "android"])).optional(),
});

const PluginAutoSoundRuleSchema = z.object({
  match: z
    .object({
      kind: z.string(),
      type: z.string().optional(),
      appId: z.string().optional(),
      from: z.union([z.string(), z.literal("*")]).optional(),
    })
    .passthrough(),
  action: z.enum(["PLAY_ONE_SHOT", "START_LOOP", "STOP_SOUND"]),
  sound: z.string().optional(),
  stopId: z.string().optional(),
  bus: z.enum(["voice", "sfx", "ui", "music", "master"]).optional(),
  volume: z.number().optional(),
  idTemplate: z.string().optional(),
  duckMusic: z.boolean().optional(),
  loop: z.boolean().optional(),
  priority: z.number().optional(),
});

const AnchorProviderSchema = z
  .object({
    appId: z.string(),
    getAnchors: z.function(),
    framing: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const TokovoPluginSchema = z.object({
  id: z.string().min(3),
  version: z.string(),
  displayName: z.string(),
  reducer: z.function(),
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
  anchorProvider: AnchorProviderSchema.optional(),
  layouts: z.array(PluginLayoutStrategySchema).optional(),
  audioRules: z.array(PluginAutoSoundRuleSchema).optional(),
});

export interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validatePlugin<AppId extends string>(
  plugin: TokovoPluginContract<AppId>,
): void {
  const result = validatePluginDetailed(plugin);

  if (!result.valid) {
    const errorMessages = result.errors
      .map((e) => {
        let msg = `  • ${e.field}: ${e.message}`;
        if (e.suggestion) {
          msg += `\n    → ${e.suggestion}`;
        }
        return msg;
      })
      .join("\n");

    throw new Error(
      `[PluginValidation] Plugin '${plugin.id}' failed validation:\n${errorMessages}`,
    );
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach((w) => {
      console.warn(
        `[PluginValidation] ${plugin.id}: ${w.field} - ${w.message}`,
      );
    });
  }
}

export function validatePluginDetailed<AppId extends string>(
  plugin: TokovoPluginContract<AppId>,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    TokovoPluginSchema.parse(plugin);
  } catch (zodError) {
    if (zodError instanceof z.ZodError) {
      zodError.issues.forEach((issue) => {
        errors.push({
          field: formatZodPath(issue.path),
          message: issue.message,
          suggestion: getZodSuggestion(issue),
        });
      });
    }
  }

  if (!plugin.id || plugin.id.length < 3) {
    errors.push({
      field: "id",
      message: "Plugin ID must be at least 3 characters",
      suggestion: "Use format 'app_myapp' or 'feature_myfeature'",
    });
  }

  if (plugin.id && !plugin.id.match(/^[a-z][a-z0-9_]*$/)) {
    errors.push({
      field: "id",
      message: "Plugin ID must be lowercase alphanumeric with underscores",
      suggestion: `Try '${plugin.id.toLowerCase().replace(/[^a-z0-9]/g, "_")}'`,
    });
  }

  if (!plugin.version) {
    errors.push({
      field: "version",
      message: "Version is required",
      suggestion: "Use semver format: '1.0.0'",
    });
  } else if (!plugin.version.match(/^\d+\.\d+\.\d+/)) {
    warnings.push({
      field: "version",
      message: "Version should follow semver format",
      suggestion: "Use format: 'MAJOR.MINOR.PATCH' (e.g., '1.0.0')",
    });
  }

  if (!plugin.displayName) {
    errors.push({
      field: "displayName",
      message: "Display name is required",
      suggestion: "Add a human-readable name for the plugin",
    });
  }

  if (!plugin.views?.AppRoot) {
    errors.push({
      field: "views.AppRoot",
      message: "AppRoot component is required",
      suggestion: "Provide a React component as views.AppRoot",
    });
  }

  if (!plugin.reducer) {
    errors.push({
      field: "reducer",
      message: "Reducer is required",
      suggestion: "Provide (draft, event) => void function",
    });
  } else if (typeof plugin.reducer !== "function") {
    errors.push({
      field: "reducer",
      message: "Reducer must be a function",
      suggestion: "Provide (draft, event, ctx) => void function",
    });
  }

  if (plugin.eventKinds) {
    if (!Array.isArray(plugin.eventKinds)) {
      errors.push({
        field: "eventKinds",
        message: "eventKinds must be an array",
        suggestion: "Use readonly string array: ['EventA', 'EventB'] as const",
      });
    } else {
      const invalidKinds = plugin.eventKinds.filter(
        (k) => typeof k !== "string" || k.length === 0,
      );
      if (invalidKinds.length > 0) {
        errors.push({
          field: "eventKinds",
          message: `Invalid event kinds: ${invalidKinds.join(", ")}`,
          suggestion: "All event kinds must be non-empty strings",
        });
      }
    }
  }

  if (plugin.assets?.sounds) {
    for (const [key, path] of Object.entries(plugin.assets.sounds)) {
      if (!key.startsWith(plugin.id)) {
        errors.push({
          field: `assets.sounds.${key}`,
          message: `Sound key must be namespaced with plugin ID`,
          suggestion: `Rename to '${plugin.id}.${key}' or '${plugin.id}_${key}'`,
        });
      }
      if (typeof path !== "string" || path.length === 0) {
        errors.push({
          field: `assets.sounds.${key}`,
          message: "Sound path must be a non-empty string",
        });
      } else if (path.startsWith("/")) {
        warnings.push({
          field: `assets.sounds.${key}`,
          message:
            "Sound paths should not start with '/'. getSoundPath() strips leading slashes but the canonical format is relative to the sounds folder.",
          suggestion: `Use '${path.replace(/^\/+/, "")}'`,
        });
      }
    }
  }

  if (plugin.anchors) {
    if (
      !plugin.anchors.providers ||
      typeof plugin.anchors.providers !== "object"
    ) {
      warnings.push({
        field: "anchors.providers",
        message:
          "Anchor providers should be an object mapping anchor IDs to provider functions",
      });
    }
  }

  if (plugin.anchorProvider) {
    const provider = plugin.anchorProvider as unknown as {
      appId?: unknown;
      getAnchors?: unknown;
    };
    if (provider.appId !== plugin.id) {
      warnings.push({
        field: "anchorProvider.appId",
        message: `Anchor provider appId should match plugin.id`,
        suggestion: `Set anchorProvider.appId to '${plugin.id}'`,
      });
    }
    if (typeof provider.getAnchors !== "function") {
      errors.push({
        field: "anchorProvider.getAnchors",
        message: "Anchor provider must implement getAnchors(world, layout, deviceId, context?)",
      });
    }
  }

  if (plugin.layouts && Array.isArray(plugin.layouts)) {
    plugin.layouts.forEach((layout, i) => {
      if (!layout.viewKind) {
        errors.push({
          field: `layouts[${i}].viewKind`,
          message: "Layout must specify viewKind",
          suggestion: "Add viewKind: 'CHAT' | 'FEED' | etc.",
        });
      }
      if (!layout.computeLayout || typeof layout.computeLayout !== "function") {
        errors.push({
          field: `layouts[${i}].computeLayout`,
          message: "Layout must have computeLayout function",
          suggestion: "Add computeLayout: (ctx: LayoutContext) => LayoutState",
        });
      }
    });
  }

  if (plugin.audioRules && Array.isArray(plugin.audioRules)) {
    plugin.audioRules.forEach((rule, i) => {
      if (!rule.match) {
        errors.push({
          field: `audioRules[${i}].match`,
          message: "Audio rule must have match criteria",
        });
      }
      if (rule.action === "STOP_SOUND") {
        if (!rule.stopId) {
          errors.push({
            field: `audioRules[${i}].stopId`,
            message: "STOP_SOUND rules must specify stopId",
          });
        }
      } else {
        if (!rule.sound) {
          errors.push({
            field: `audioRules[${i}].sound`,
            message: `${rule.action} rules must specify sound ID`,
          });
        } else if (
          !rule.sound.startsWith(plugin.id) &&
          !rule.sound.startsWith("device.") &&
          !CORE_SOUND_IDS.has(rule.sound)
        ) {
          warnings.push({
            field: `audioRules[${i}].sound`,
            message: "Sound ID should be namespaced",
            suggestion: `Consider using '${plugin.id}.${rule.sound}'`,
          });
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function getZodSuggestion(issue: z.ZodIssue): string | undefined {
  if ("expected" in issue && "received" in issue) {
    return `Expected ${issue.expected}, got ${issue.received}`;
  }
  if ("minimum" in issue) {
    return `Minimum length is ${issue.minimum}`;
  }
  return undefined;
}

function formatZodPath(path: Array<string | number | symbol>): string {
  if (path.length === 0) return "root";
  return path
    .map((part) => (typeof part === "symbol" ? part.toString() : String(part)))
    .join(".");
}

export const __test__ = {
  getZodSuggestion,
  formatZodPath,
};

export function assertPluginValid<AppId extends string>(
  plugin: TokovoPluginContract<AppId>,
  options?: { throwOnWarning?: boolean },
): asserts plugin is TokovoPluginContract<AppId> {
  const result = validatePluginDetailed(plugin);

  if (!result.valid) {
    throw new Error(
      `Plugin validation failed: ${result.errors.map((e) => e.message).join("; ")}`,
    );
  }

  if (options?.throwOnWarning && result.warnings.length > 0) {
    throw new Error(
      `Plugin has warnings: ${result.warnings.map((w) => w.message).join("; ")}`,
    );
  }
}
