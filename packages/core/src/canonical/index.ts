/**
 * Canonical Module
 *
 * Unified exports for the canonical event system.
 *
 * This is the core contract that ALL apps and plugins must adhere to.
 *
 * @module @tokovo/core/canonical
 */

// =============================================================================
// CONTENT TYPES
// =============================================================================

export type {
    // Discriminated union types
    TextContent,
    ImageContent,
    VideoContent,
    GifContent,
    VoiceContent,
    StickerContent,
    LinkContent,
    LocationContent,
    ContactContent,
    FileContent,
    SystemContent,
    DeletedContent,
    // Master union
    CanonicalContent,
    ContentKind,
    SystemMessageType,
} from "./content";

export {
    // Type guards
    isTextContent,
    isImageContent,
    isVideoContent,
    isGifContent,
    isVoiceContent,
    isStickerContent,
    isLinkContent,
    isLocationContent,
    isContactContent,
    isFileContent,
    isSystemContent,
    isDeletedContent,
    isMediaContent,
    // Helpers
    getContentText,
} from "./content";

// =============================================================================
// IDENTITY
// =============================================================================

export type {
    ActorId,
    ActorRef,
    ActorRegistry,
    VerificationBadge,
} from "./identity";

export {
    ACTOR_ME,
    ACTOR_SYSTEM,
    createActorRegistry,
    actor,
    isMe,
    isSystem,
    getDisplayName,
    generateActorId,
} from "./identity";

// =============================================================================
// APP EVENTS
// =============================================================================

export type {
    // Trace
    CanonicalTrace,
    // Message types
    MessageEvent,
    MessageMeta,
    SemanticMeta,
    TypingEvent,
    ReadEvent,
    ReactionEvent,
    // Navigation
    NavigateEvent,
    NavigateTarget,
    ScreenType,
    // Feed types
    FeedItemEvent,
    FeedScrollEvent,
    FeedActionEvent,
    FeedItem,
    FeedAuthor,
    FeedStats,
    FeedItemType,
    FeedActionType,
    CommentEvent,
    // Story types
    StoryItemEvent,
    StoryViewEvent,
    StoryItem,
    StoryViewAction,
    // Social
    SocialEvent,
    SocialActionType,
    // Custom
    CustomEvent,
    // Union
    AppRuntimeEvent,
    AppEventType,
} from "./events";

export {
    createTrace,
    // Type guards
    isMessageEvent,
    isTypingEvent,
    isReadEvent,
    isReactionEvent,
    isNavigateEvent,
    isFeedItemEvent,
    isFeedActionEvent,
    isStoryItemEvent,
    isStoryViewEvent,
    isCustomEvent,
} from "./events";

// =============================================================================
// DEVICE/OS/CAMERA/AUDIO EVENTS
// =============================================================================

export type {
    // Device
    DeviceRuntimeEvent,
    NotificationData,
    // OS
    OSRuntimeEvent,
    NetworkType,
    // Camera
    CameraRuntimeEvent,
    EasingType,
    // Audio
    AudioRuntimeEvent,
    // Call
    CallRuntimeEvent,
    // Touch
    TouchRuntimeEvent,
    // Master union
    CanonicalRuntimeEvent,
    EventKind,
} from "./device-events";

export {
    isAppEvent,
    isDeviceEvent,
    isOSEvent,
    isCameraEvent,
    isAudioEvent,
    isCallEvent,
    isTouchEvent,
} from "./device-events";

// =============================================================================
// ORDERING
// =============================================================================

export {
    KIND_PRIORITY,
    APP_TYPE_PRIORITY,
    eventSortKey,
    sortEventsDeterministic,
    sortEventsDeterministicInPlace,
    isEventOrderValid,
    findOrderingViolation,
} from "./ordering";

// =============================================================================
// HASHING
// =============================================================================

export type {
    TimelineHashInput,
    EventHashInput,
} from "./hash";

export {
    stableStringify,
    stableStringifyPretty,
    computeHash,
    computeHashSync,
    extractEventHashData,
    computeDeterminismHash,
    compareHashes,
} from "./hash";

// =============================================================================
// ROUTING
// =============================================================================

export type {
    ReducerContext,
    WorldState,
    DeviceState,
    CameraState,
    AudioState,
    PlayingSound,
    AppReducer,
    DeviceReducer,
    OSReducer,
    CameraReducer,
    AudioReducer,
    CallReducer,
    TouchReducer,
    ReducerSet,
} from "./routing";

export {
    routeEvent,
    routeEvents,
    defaultDeviceReducer,
    defaultOSReducer,
    defaultCameraReducer,
} from "./routing";

// =============================================================================
// SURFACES
// =============================================================================

export type {
    ScreenType as SurfaceScreenType,
    Surface,
    SurfaceState,
} from "./surfaces";

export {
    createSurfaceState,
    navigateTo,
    goBack,
    canGoBack,
} from "./surfaces";

// =============================================================================
// DIAGNOSTICS
// =============================================================================

export type {
    DiagnosticSeverity,
    DiagnosticCode,
    Diagnostic,
    DiagnosticTrace,
    ValidationResult,
} from "./diagnostics";

export {
    validResult,
    invalidResult,
    categorize,
    mergeResults,
    error,
    warning,
    info,
    formatDiagnostic,
    formatValidationResult,
    ValidationError,
} from "./diagnostics";

// =============================================================================
// PLUGIN REGISTRY
// =============================================================================

export type {
    AppCapability,
    PluginSchema,
    PluginLimits,
    AppViewProps as CanonicalAppViewProps,
    AppViewComponent as CanonicalAppViewComponent,
    AppPlugin,
    PluginRegistry,
    PluginConfig,
} from "./plugin-registry";

export {
    DEFAULT_PLUGIN_SCHEMA,
    createPluginRegistry,
    defineAppPlugin,
} from "./plugin-registry";

// =============================================================================
// VERSIONING
// =============================================================================

export type {
    TokovoVersion,
    VersionedOutput,
} from "./version";

export {
    TOKOVO_VERSION,
    createVersionMetadata,
    isVersionCompatible,
    isMajorVersionCompatible,
    parseVersion,
    compareVersions,
    formatVersionInfo,
} from "./version";

// =============================================================================
// ENGINE
// =============================================================================

export type {
    EngineConfig,
    TokovoEngine,
    Checkpoint,
    ReplayCache,
    ValidationMode,
} from "./engine";

export {
    createEngine,
    createReplayCache,
    buildWorldCached,
} from "./engine";
