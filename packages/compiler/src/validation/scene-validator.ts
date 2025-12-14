/**
 * Scene Validation Pass
 *
 * Validates SceneIR before compilation.
 * Catches issues like missing conversations, unknown apps, missing capabilities.
 *
 * @module @tokovo/compiler/validation/scene-validator
 */

// =============================================================================
// VALIDATION MODE
// =============================================================================

export type ValidationMode = "strict" | "compat" | "lenient";

// =============================================================================
// DIAGNOSTIC TYPES (local copy to avoid cross-package issues)
// =============================================================================

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface Diagnostic {
    readonly code: string;
    readonly message: string;
    readonly severity: DiagnosticSeverity;
    readonly trace?: {
        readonly episodeId?: string;
        readonly deviceId?: string;
        readonly beatName?: string;
        readonly opIndex?: number;
        readonly conversationId?: string;
    };
    readonly hint?: string;
    readonly docsLink?: string;
}

export interface ValidationResult {
    readonly valid: boolean;
    readonly errors: ReadonlyArray<Diagnostic>;
    readonly warnings: ReadonlyArray<Diagnostic>;
    readonly infos: ReadonlyArray<Diagnostic>;
}

function error(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "error", ...opts };
}

function warning(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "warning", ...opts };
}

function info(code: string, message: string, opts?: Partial<Diagnostic>): Diagnostic {
    return { code, message, severity: "info", ...opts };
}

function categorize(diagnostics: Diagnostic[]): ValidationResult {
    const errors = diagnostics.filter((d) => d.severity === "error");
    const warnings = diagnostics.filter((d) => d.severity === "warning");
    const infos = diagnostics.filter((d) => d.severity === "info");
    return { valid: errors.length === 0, errors, warnings, infos };
}

// =============================================================================
// PLUGIN REGISTRY INTERFACE (local copy)
// =============================================================================

export type AppCapability =
    | "messaging"
    | "typing"
    | "read_receipts"
    | "reactions"
    | "voice"
    | "video"
    | "stickers"
    | "location"
    | "contacts"
    | "groups"
    | "stories"
    | "feed"
    | "calls"
    | "navigation"
    | "notifications";

export interface PluginSchema {
    readonly contentKinds: ReadonlyArray<string>;
    readonly eventTypes: ReadonlyArray<string>;
    readonly systemTypes?: ReadonlyArray<string>;
    readonly feedIds?: ReadonlyArray<string>;
    readonly allowedCustomEvents?: ReadonlyArray<string>;
}

export interface PluginRegistry {
    has(id: string): boolean;
    hasCapability(pluginId: string, capability: AppCapability): boolean;
    getSchema(pluginId: string): PluginSchema | undefined;
}

// =============================================================================
// SCENE IR TYPES (simplified for validation)
// =============================================================================

export interface SceneIRForValidation {
    episodeId: string;
    devices: DeviceIRForValidation[];
}

export interface DeviceIRForValidation {
    deviceId: string;
    appId?: string;
    conversations?: ConversationIRForValidation[];
    beats?: BeatIRForValidation[];
}

export interface ConversationIRForValidation {
    id: string;
    name?: string;
}

export interface BeatIRForValidation {
    name: string;
    ops?: OpIRForValidation[];
}

export interface OpIRForValidation {
    kind: string;
    conversationId?: string;
    feedId?: string;
    storyId?: string;
    contentKind?: string;
    index?: number;
}

// =============================================================================
// CAPABILITY MAPPING
// =============================================================================

export function getRequiredCapability(opKind: string): AppCapability | null {
    switch (opKind) {
        case "SendMessage":
        case "ReceiveMessage":
            return "messaging";
        case "Typing":
            return "typing";
        case "ReadMessage":
            return "read_receipts";
        case "AddReaction":
            return "reactions";
        case "SendVoice":
        case "ReceiveVoice":
            return "voice";
        case "SendVideo":
        case "ReceiveVideo":
            return "video";
        case "SendSticker":
            return "stickers";
        case "SendLocation":
            return "location";
        case "SendContact":
            return "contacts";
        case "Navigate":
            return "navigation";
        case "PostTweet":
        case "ReceiveTweet":
        case "LikeTweet":
            return "feed";
        case "ViewStory":
        case "AddStory":
            return "stories";
        case "Call":
            return "calls";
        default:
            return null;
    }
}

export function getCapabilityHint(capability: AppCapability, mode: ValidationMode): string {
    if (mode === "compat") {
        return `Feature will be auto-downgraded in compat mode.`;
    }

    const hints: Record<AppCapability, string> = {
        messaging: "Register your app with messaging capability.",
        typing: "Add 'typing' to plugin capabilities.",
        read_receipts: "Add 'read_receipts' to plugin capabilities.",
        reactions: "Add 'reactions' to plugin capabilities or use compat mode.",
        voice: "Add 'voice' to plugin capabilities or content will fallback to placeholder.",
        video: "Add 'video' to plugin capabilities.",
        stickers: "Add 'stickers' to plugin capabilities.",
        location: "Add 'location' to plugin capabilities.",
        contacts: "Add 'contacts' to plugin capabilities.",
        groups: "Add 'groups' to plugin capabilities.",
        stories: "Add 'stories' to plugin capabilities.",
        feed: "Add 'feed' to plugin capabilities.",
        calls: "Add 'calls' to plugin capabilities.",
        navigation: "Add 'navigation' to plugin capabilities.",
        notifications: "Add 'notifications' to plugin capabilities.",
    };

    return hints[capability] || `Add '${capability}' to plugin capabilities.`;
}

// =============================================================================
// SCENE VALIDATION
// =============================================================================

export function validateScene(
    scene: SceneIRForValidation,
    plugins: PluginRegistry,
    mode: ValidationMode
): ValidationResult {
    const diagnostics: Diagnostic[] = [];

    for (const device of scene.devices) {
        if (device.appId && !plugins.has(device.appId)) {
            diagnostics.push(
                mode === "strict"
                    ? error("UNKNOWN_APP", `App "${device.appId}" is not registered`, {
                        trace: { episodeId: scene.episodeId, deviceId: device.deviceId },
                        hint: `Register the app with pluginRegistry.register()`,
                        docsLink: "/docs/plugins/registration",
                    })
                    : warning("UNKNOWN_APP", `App "${device.appId}" is not registered`, {
                        trace: { episodeId: scene.episodeId, deviceId: device.deviceId },
                    })
            );
        }

        const definedConversations = new Set<string>(
            device.conversations?.map((c) => c.id) ?? []
        );

        for (const beat of device.beats ?? []) {
            for (let i = 0; i < (beat.ops?.length ?? 0); i++) {
                const op = beat.ops![i];

                if (op.conversationId && !definedConversations.has(op.conversationId)) {
                    diagnostics.push(
                        error("MISSING_CONVERSATION", `Conversation "${op.conversationId}" not defined`, {
                            trace: {
                                episodeId: scene.episodeId,
                                deviceId: device.deviceId,
                                beatName: beat.name,
                                opIndex: i,
                            },
                            hint: `Add d.conversation("${op.conversationId}") before beats`,
                        })
                    );
                }

                const required = getRequiredCapability(op.kind);
                if (required && device.appId && !plugins.hasCapability(device.appId, required)) {
                    diagnostics.push(
                        mode === "strict"
                            ? error(
                                "MISSING_CAPABILITY",
                                `App "${device.appId}" lacks capability "${required}" for ${op.kind}`,
                                {
                                    trace: {
                                        episodeId: scene.episodeId,
                                        deviceId: device.deviceId,
                                        beatName: beat.name,
                                        opIndex: i,
                                    },
                                    hint: getCapabilityHint(required, mode),
                                }
                            )
                            : warning(
                                "MISSING_CAPABILITY",
                                `App lacks capability "${required}" for ${op.kind}`,
                                {
                                    trace: {
                                        episodeId: scene.episodeId,
                                        deviceId: device.deviceId,
                                        beatName: beat.name,
                                    },
                                    hint: getCapabilityHint(required, mode),
                                }
                            )
                    );
                }

                if (op.contentKind && device.appId) {
                    const schema = plugins.getSchema(device.appId);
                    if (schema && !schema.contentKinds.includes(op.contentKind)) {
                        diagnostics.push(
                            mode === "strict"
                                ? error(
                                    "MISSING_SCHEMA_SUPPORT",
                                    `App "${device.appId}" does not support content kind "${op.contentKind}"`,
                                    {
                                        trace: {
                                            episodeId: scene.episodeId,
                                            deviceId: device.deviceId,
                                            beatName: beat.name,
                                            opIndex: i,
                                        },
                                        hint: `Add "${op.contentKind}" to plugin.schema.contentKinds`,
                                    }
                                )
                                : info(
                                    "MISSING_SCHEMA_SUPPORT",
                                    `Content kind "${op.contentKind}" may not render correctly`,
                                    {
                                        trace: {
                                            episodeId: scene.episodeId,
                                            deviceId: device.deviceId,
                                            beatName: beat.name,
                                        },
                                    }
                                )
                        );
                    }
                }
            }
        }
    }

    return categorize(diagnostics);
}
