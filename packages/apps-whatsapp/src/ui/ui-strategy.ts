/**
 * WhatsApp UI Strategy Pattern
 *
 * Enables platform-specific UI rendering with easy extensibility
 * for custom themes (e.g., Ghibli-style, dark mode, etc.)
 *
 * Usage:
 * 1. Import and register strategies (done automatically on import)
 * 2. Get strategy by ID or platform
 * 3. Use strategy components in screens
 *
 * Adding a new theme (e.g., Ghibli):
 * 1. Create new file: strategies/ghibli.tsx
 * 2. Implement UIStrategy interface
 * 3. Register with UIStrategyRegistry.register()
 * 4. Done! Use with UIStrategyRegistry.get("whatsapp-ghibli")
 */

import React from "react";
import { WorldState } from "@tokovo/core";
import {
  WhatsAppConversation,
  MessageData,
  WhatsAppGroupMember,
} from "../types";

// =============================================================================
// STRATEGY INTERFACES
// =============================================================================

/**
 * Header component props - platform agnostic
 */
export interface HeaderProps {
  conversation: WhatsAppConversation;
  safeAreaTop: number;
  onBack?: () => void;
}

/**
 * Message bubble props - platform agnostic
 */
export interface MessageBubbleProps {
  message: MessageData;
  isMe: boolean;
  isFirst: boolean;
  isLast: boolean;
  isGroupChat?: boolean;
  senderName?: string;
  senderColor?: string;
  showSenderName?: boolean;
}

/**
 * Typing indicator props
 */
export interface TypingIndicatorProps {
  typingMembers: Array<{ id: string; name: string }>;
  isGroupChat: boolean;
}

/**
 * Input area props
 */
export interface InputAreaProps {
  text: string;
  showCursor: boolean;
  safeAreaBottom: number;
}

/**
 * Theme tokens for consistent styling across all components
 */
export interface UIThemeTokens {
  // Chat background
  backgroundColor: string;
  doodlePattern: string;
  doodleOpacity: number;

  // Message bubbles
  bubbleMyBg: string;
  bubbleMyText: string;
  bubbleOtherBg: string;
  bubbleOtherText: string;

  // Header
  headerBg: string;
  headerText: string;
  headerSecondary: string;
  headerIcon: string;

  // Input area
  inputBg: string;
  inputFieldBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  inputIcon: string;
  inputButtonBg: string;
  inputButtonIcon: string;

  // System messages
  systemMessageBg: string;
  systemMessageText: string;

  // General
  textColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;

  // Timestamps & metadata
  timestampColor: string;
  linkColor: string;
}

/**
 * UI Strategy - Complete set of components for a platform/theme
 */
export interface UIStrategy {
  /** Unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Platform this strategy targets */
  platform: "ios" | "android" | "custom";

  // Component factory methods
  Header: React.FC<HeaderProps>;
  MessageBubble: React.FC<MessageBubbleProps>;
  TypingIndicator: React.FC<TypingIndicatorProps>;
  InputArea: React.FC<InputAreaProps>;

  // Optional: MessageList, SystemMessage, etc.
  MessageList?: React.FC<any>;
  SystemMessage?: React.FC<any>;

  // Theme tokens (colors, spacing)
  tokens: UIThemeTokens;
}

// =============================================================================
// STRATEGY REGISTRY
// =============================================================================

const strategies: Map<string, UIStrategy> = new Map();

export const UIStrategyRegistry = {
  register(strategy: UIStrategy): void {
    strategies.set(strategy.id, strategy);
    console.log(`[UIStrategy] Registered: ${strategy.id} (${strategy.name})`);
  },

  get(id: string): UIStrategy | undefined {
    return strategies.get(id);
  },

  require(id: string): UIStrategy {
    const strategy = strategies.get(id);
    if (!strategy) {
      throw new Error(
        `UI Strategy not found: ${id}. Available: ${Array.from(strategies.keys()).join(", ")}`,
      );
    }
    return strategy;
  },

  list(): string[] {
    return Array.from(strategies.keys());
  },

  listAll(): Array<{ id: string; name: string; platform: string }> {
    return Array.from(strategies.values()).map((s) => ({
      id: s.id,
      name: s.name,
      platform: s.platform,
    }));
  },

  forPlatform(platform: "ios" | "android"): UIStrategy {
    const id = platform === "ios" ? "whatsapp-ios" : "whatsapp-android";
    let strategy = strategies.get(id);
    if (!strategy && platform === "android") {
      strategy = strategies.get("whatsapp-ios");
    }
    if (!strategy) {
      throw new Error(`No UI strategy registered for platform: ${platform}`);
    }
    return strategy;
  },
};

// =============================================================================
// THEME CREATION HELPERS
// =============================================================================

const DEFAULT_TOKENS: UIThemeTokens = {
  backgroundColor: "#ECE5DD",
  doodlePattern: "",
  doodleOpacity: 0.04,

  bubbleMyBg: "#DCF8C6",
  bubbleMyText: "#000000",
  bubbleOtherBg: "#FFFFFF",
  bubbleOtherText: "#000000",

  headerBg: "#075E54",
  headerText: "#FFFFFF",
  headerSecondary: "rgba(255,255,255,0.7)",
  headerIcon: "#FFFFFF",

  inputBg: "#F0F0F0",
  inputFieldBg: "#FFFFFF",
  inputBorder: "transparent",
  inputText: "#000000",
  inputPlaceholder: "#8E8E93",
  inputIcon: "#8E8E93",
  inputButtonBg: "#075E54",
  inputButtonIcon: "#FFFFFF",

  systemMessageBg: "#FFF3C4",
  systemMessageText: "#54656F",

  textColor: "#000000",
  secondaryColor: "#667781",
  accentColor: "#075E54",
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",

  timestampColor: "#667781",
  linkColor: "#027EB5",
};

export interface ThemeConfig {
  id: string;
  name: string;
  platform?: "ios" | "android" | "custom";
  tokens: Partial<UIThemeTokens>;
}

export function createTheme(config: ThemeConfig): UIStrategy {
  const tokens: UIThemeTokens = { ...DEFAULT_TOKENS, ...config.tokens };

  const strategy: UIStrategy = {
    id: config.id,
    name: config.name,
    platform: config.platform || "custom",
    Header: undefined as any,
    MessageBubble: undefined as any,
    TypingIndicator: undefined as any,
    InputArea: undefined as any,
    tokens,
  };

  return strategy;
}
