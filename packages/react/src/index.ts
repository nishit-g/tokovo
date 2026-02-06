export {
  TokovoProvider,
  TokovoContext,
  useWorld,
  useDevice,
  useAppState,
  useLayout,
  useTime,
  usePlatform,
  useDeviceId,
  useAppId,
  useSafeAreaInsets,
  useKeyboardHeight,
  useConversation,
  useActiveConversation,
} from "./TokovoContext.js";

export {
  useKeyboardAwareContainer,
  useKeyboardState,
  KeyboardAwareView,
  ScrollableContent,
} from "./KeyboardAware.js";
export type {
  UseKeyboardAwareContainerOptions,
  KeyboardAwareContainerResult,
  KeyboardAwareViewProps,
  KeyboardInputState,
  ScrollableContentProps,
} from "./KeyboardAware.js";

export { AppSurface } from "./AppSurface.js";
export type { AppSurfaceProps } from "./AppSurface.js";

// =============================================================================
// UI REGISTRIES
// =============================================================================
export * from "./registries/index.js";

// =============================================================================
// PLUGINS
// =============================================================================
export * from "./plugin/index.js";

// =============================================================================
// RUNTIME REGISTRIES
// =============================================================================
export {
  createTokovoRegistries,
  type TokovoRegistries,
  type TokovoRegistriesOverrides,
} from "./registries/runtime.js";

// =============================================================================
// NOTIFICATION VIEWS
// =============================================================================
export {
  createNotificationViewRegistry,
  NotificationViewRegistryClass,
} from "./notifications/registry.js";
export type {
  NotificationViewProps,
  NotificationViewComponent,
} from "./notifications/registry.js";

// =============================================================================
// PLUGIN VALIDATION UTILS
// =============================================================================
export {
  AppMetadataSchema,
  TokovoPluginSchema,
  validatePlugin,
  validatePluginDetailed,
  assertPluginValid,
} from "./utils/validation.js";
export type { ValidationError, ValidationResult } from "./utils/validation.js";
