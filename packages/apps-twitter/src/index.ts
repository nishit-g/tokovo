/**
 * @tokovo/apps-twitter
 * 
 * Twitter/X app for Tokovo video generation.
 */

// Plugin registration (side-effect import)
import "./plugin";

// Exports
export * from "./config";
export * from "./components";
export * from "./runtime";
export * from "./ui";
export { TWITTER_APP_ID, registerTwitterApp } from "./plugin";
