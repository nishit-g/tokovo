
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

    // 3. Conflict Prevention (Enterprise Standard)

    // Core events that don't need namespacing
    const CORE_EVENT_TYPES = new Set([
        "MESSAGE_RECEIVED", "MESSAGE_SENT", "MESSAGE_READ", "MESSAGE_DELETED",
        "TYPING_START", "TYPING_END",
        "REACTION_ADDED",
        "CALL", // Provisionally Core
        "NOTIFICATION", "SHOW_NOTIFICATION", "HIDE_NOTIFICATION",
        "PLAY_TRACK", "PAUSE_TRACK", "START_BACKGROUND_APP",
        "OPEN_APP", "CLOSE_APP",
        "SCREEN_NAVIGATED",
        // Enhanced Features (Standardized)
        "VOICE_MESSAGE_RECEIVED",
        "GROUP_MEMBER_ADDED", "GROUP_MEMBER_REMOVED"
    ]);

    // Enforce Event Namespacing
    if (plugin.eventTypes) {
        for (const type of plugin.eventTypes) {
            if (CORE_EVENT_TYPES.has(type)) continue;

            const validPrefix = `${plugin.id}.`;
            if (!type.startsWith(validPrefix)) {
                throw new Error(
                    `[Conflict Prevention] Event type '${type}' in plugin '${plugin.id}' must be namespaced.\n` +
                    `Required format: '${validPrefix}MyEvent'.\n` +
                    `Core events allowed: ${Array.from(CORE_EVENT_TYPES).join(", ")}`
                );
            }
        }
    }

    // Enforce Sound Namespacing
    if (plugin.sounds) {
        for (const key of Object.keys(plugin.sounds)) {
            // Allow dot or underscore separator
            const validPrefixDot = `${plugin.id}.`;
            // For legacy mostly, but strict enterprise usually prefers dot. 
            // However, many assets use underscore (app_whatsapp_sent).
            // Let's allow underscore if the ID itself has underscores.
            // Actually, best to strictly check if it STARTS with the ID.
            if (!key.startsWith(plugin.id)) {
                throw new Error(
                    `[Conflict Prevention] Sound key '${key}' in plugin '${plugin.id}' must be namespaced.\n` +
                    `It must start with '${plugin.id}' (e.g. '${plugin.id}.sent' or '${plugin.id}_sent').`
                );
            }
        }
    }
}
