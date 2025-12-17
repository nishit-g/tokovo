/**
 * UI Strategies Index
 * 
 * Auto-registers all available UI strategies on import.
 */

// Import strategies to trigger auto-registration
import "./ios";
import "./android";

// Re-export for direct access
export { iOSStrategy } from "./ios";
export { androidStrategy } from "./android";
