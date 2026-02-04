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
} from "./TokovoContext";

export {
  useKeyboardAwareContainer,
  useKeyboardState,
  KeyboardAwareView,
  ScrollableContent,
} from "./KeyboardAware";
export type {
  UseKeyboardAwareContainerOptions,
  KeyboardAwareContainerResult,
  KeyboardAwareViewProps,
  KeyboardInputState,
  ScrollableContentProps,
} from "./KeyboardAware";

export { AppSurface } from "./AppSurface";
export type { AppSurfaceProps } from "./AppSurface";

// =============================================================================
// UI REGISTRIES
// =============================================================================
export * from "./registries";

// =============================================================================
// PLUGINS
// =============================================================================
export * from "./plugin";

// =============================================================================
// RUNTIME REGISTRIES
// =============================================================================
export {
  createTokovoRegistries,
  type TokovoRegistries,
  type TokovoRegistriesOverrides,
} from "./registries/runtime";

// =============================================================================
// NOTIFICATION VIEWS
// =============================================================================
export {
  createNotificationViewRegistry,
  NotificationViewRegistryClass,
} from "./notifications/registry";
export type {
  NotificationViewProps,
  NotificationViewComponent,
} from "./notifications/registry";

// =============================================================================
// PLUGIN VALIDATION UTILS
// =============================================================================
export {
  AppMetadataSchema,
  TokovoPluginSchema,
  validatePlugin,
  validatePluginDetailed,
  assertPluginValid,
} from "./utils/validation";
export type { ValidationError, ValidationResult } from "./utils/validation";
