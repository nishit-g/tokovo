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
 * Theme tokens for consistent styling
 */
export interface UIThemeTokens {
  backgroundColor: string;
  bubbleMyBg: string;
  bubbleOtherBg: string;
  textColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  systemMessageBg: string;
  systemMessageText: string;
  doodlePattern: string;
  doodleOpacity: number;
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
  /**
   * Register a UI strategy
   */
  register(strategy: UIStrategy): void {
    strategies.set(strategy.id, strategy);
    console.log(`[UIStrategy] Registered: ${strategy.id} (${strategy.name})`);
  },

  /**
   * Get strategy by ID
   */
  get(id: string): UIStrategy | undefined {
    return strategies.get(id);
  },

  /**
   * Get strategy or throw
   */
  require(id: string): UIStrategy {
    const strategy = strategies.get(id);
    if (!strategy) {
      throw new Error(
        `UI Strategy not found: ${id}. Available: ${Array.from(strategies.keys()).join(", ")}`,
      );
    }
    return strategy;
  },

  /**
   * List all registered strategies
   */
  list(): string[] {
    return Array.from(strategies.keys());
  },

  /**
   * List all strategies with metadata
   */
  listAll(): Array<{ id: string; name: string; platform: string }> {
    return Array.from(strategies.values()).map((s) => ({
      id: s.id,
      name: s.name,
      platform: s.platform,
    }));
  },

  /**
   * Get default strategy for platform
   */
  forPlatform(platform: "ios" | "android"): UIStrategy {
    const id = platform === "ios" ? "whatsapp-ios" : "whatsapp-android";

    // Try to get the platform-specific strategy
    let strategy = strategies.get(id);

    // Fallback to iOS if Android not registered
    if (!strategy && platform === "android") {
      strategy = strategies.get("whatsapp-ios");
    }

    if (!strategy) {
      throw new Error(`No UI strategy registered for platform: ${platform}`);
    }

    return strategy;
  },
};
