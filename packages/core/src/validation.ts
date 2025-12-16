
import { z } from "zod";
import { TokovoPlugin } from "./plugin";
import { AppMetadata } from "./app-metadata";

// =============================================================================
// PLUGIN & METADATA SCHEMAS
// =============================================================================

export const AppMetadataSchema = z.object({
    displayName: z.string(),
    themeColor: z.string().regex(/^#/, "Must be a hex color"),
    icon: z.string(),
    viewStrategy: z.enum(["CHAT", "FEED", "STORY", "LOCKSCREEN", "HOMESCREEN", "FULLSCREEN", "TRANSITION"]).optional(),
    designWidth: z.number().optional().default(393),
}) as z.ZodType<Partial<AppMetadata> & { name?: string }>; // Loose typing to match Partial

// NOTE: We don't deeply validate React components or Functions (runtime checks only)
export const TokovoPluginSchema = z.object({
    id: z.string().min(3),
    version: z.string(),

    // Metadata block
    metadata: z.object({
        name: z.string(),
        themeColor: z.string().optional(),
        icon: z.string().optional(),
        designWidth: z.number().optional(),
    }).optional(),

    // Deprecated fields (lax schema)
    name: z.string().optional(),
    icon: z.string().optional(),
    primaryColor: z.string().optional(),

    // Arrays
    eventTypes: z.array(z.string()).optional(),

    // Maps
    sounds: z.record(z.string(), z.string()).optional(),
    anchors: z.record(z.string(), z.any()).optional(), // Framing config is complex, lazy check
});

/**
 * Validates a plugin definition at load time.
 * @throws ZodError if invalid
 */
export function validatePlugin(plugin: TokovoPlugin): void {
    // 1. Structural Check
    TokovoPluginSchema.parse(plugin);

    // 2. Logic Checks
    if (!plugin.appView && !plugin.screens) {
        throw new Error(`[Validation] Plugin ${plugin.id} must provide 'appView' or 'screens'.`);
    }

    if (!plugin.metadata?.name && !plugin.name) {
        throw new Error(`[Validation] Plugin ${plugin.id} must have a name.`);
    }
}
