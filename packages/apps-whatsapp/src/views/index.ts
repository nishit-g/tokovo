/**
 * WhatsApp Views Layer - Barrel Export
 * 
 * Exports all view-related modules:
 * - Strategy: UI Strategy interface and registry
 * - Shared: Cross-platform components
 * - iOS: iOS platform implementation
 */

// Strategy Pattern - re-export from ui/
export * from "../ui/ui-strategy";

// Shared Components
export * from "./shared";

// iOS Platform
export * from "./ios";
