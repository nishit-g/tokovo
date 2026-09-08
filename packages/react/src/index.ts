export {
  TokovoProvider,
  TokovoContext,
  useWorld,
  useDevice,
  useAppState,
  useLayout,
  useTime,
  useFps,
  usePlatform,
  useDeviceId,
  useAppId,
  useAppViewport,
  usePlatformVisuals,
  useKeyboardHeight,
  useInputProgram,
  useInputProjection,
  useConversation,
  useActiveConversation,
} from "./TokovoContext.js";

export {
  clamp01,
  frameProgress,
  easeOutCubic,
  easeInOutSine,
  loopProgress,
  pulse,
  triangleWave,
} from "./motion.js";

export {
  useKeyboardAwareContainer,
  useInputField,
  KeyboardAwareView,
  ScrollableContent,
} from "./KeyboardAware.js";
export type {
  UseKeyboardAwareContainerOptions,
  KeyboardAwareContainerResult,
  KeyboardAwareViewProps,
  InputFieldState,
  UseInputFieldOptions,
  ScrollableContentProps,
} from "./KeyboardAware.js";

export { DeterministicImage } from "./DeterministicImage.js";
export { DraftText } from "./DraftText.js";
export type { DeterministicImageProps } from "./DeterministicImage.js";

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
