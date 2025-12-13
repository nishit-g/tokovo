/**
 * Adapter Registry
 * 
 * Central registry for all app adapters.
 * Allows looking up adapters by app ID.
 */

import { TimelineOp, TimelineIR } from "@tokovo/ir";
import { AppAdapter, RuntimeEvent, AdapterContext } from "./adapter";
import { WhatsAppAdapter } from "./whatsapp";

/**
 * Registry of all available adapters.
 */
class AdapterRegistry {
    private adapters: Map<string, AppAdapter> = new Map();

    constructor() {
        // Register default adapters
        this.register(WhatsAppAdapter);
    }

    /**
     * Register an adapter.
     */
    register(adapter: AppAdapter): void {
        this.adapters.set(adapter.appId, adapter);
    }

    /**
     * Get adapter for an app ID.
     */
    get(appId: string): AppAdapter | undefined {
        return this.adapters.get(appId);
    }

    /**
     * Find an adapter that can handle the operation.
     */
    findFor(op: TimelineOp): AppAdapter | undefined {
        for (const adapter of this.adapters.values()) {
            if (adapter.supports(op)) {
                return adapter;
            }
        }
        return undefined;
    }

    /**
     * Lower all Timeline IR operations to runtime events.
     */
    lowerAll(timeline: TimelineIR): RuntimeEvent[] {
        const ctx: AdapterContext = {
            fps: timeline.fps,
            episodeId: timeline.episodeId,
        };

        const events: RuntimeEvent[] = [];

        for (const op of timeline.ops) {
            const adapter = this.findFor(op);
            if (adapter) {
                events.push(...adapter.lower(op, ctx));
            } else {
                // Fallback: try generic lowering
                events.push(...this.genericLower(op, ctx));
            }
        }

        // Sort by frame
        return events.sort((a, b) => a.at - b.at);
    }

    /**
     * Generic lowering for operations without specific adapter.
     */
    private genericLower(op: TimelineOp, ctx: AdapterContext): RuntimeEvent[] {
        switch (op.kind) {
            case "DeviceUnlocked":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "UNLOCK",
                    deviceId: op.deviceId,
                }];

            case "AppOpened":
                return [{
                    at: op.at,
                    kind: "DEVICE",
                    type: "OPEN_APP",
                    deviceId: op.deviceId,
                    appId: op.appId,
                }];

            default:
                console.warn(`No adapter found for operation: ${op.kind}`);
                return [];
        }
    }
}

/**
 * Default adapter registry instance.
 */
export const adapterRegistry = new AdapterRegistry();
