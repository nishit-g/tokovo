/**
 * WhatsApp Views Layer - Barrel Export
 *
 * Exports all view-related modules:
 * - Strategy: UI Strategy interface and registry
 * - Shared: Cross-platform components
 * - iOS: iOS platform implementation
 */

// Strategy Pattern - re-export from ui/
export {
  UIStrategy,
  UIStrategyRegistry,
  UIThemeTokens,
  MessageBubbleProps,
  TypingIndicatorProps,
  InputAreaProps,
  MessageListProps,
  SystemMessageProps,
  ThemeConfig,
  createTheme,
} from "../ui/ui-strategy";

// Re-export HeaderProps specifically to avoid duplicate export
export type { HeaderProps } from "../ui/ui-strategy";

// Shared Components
export * from "./shared";

// iOS Platform
export * from "./ios";
