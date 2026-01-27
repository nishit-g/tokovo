// Barrel exports for Demo Notes plugin
export { DemoPlugin, registerDemoPlugin } from "./plugin";
export type { DemoState, Note } from "./runtime/state";
export { createDemoInitialState } from "./runtime/state";
export { demoReducer } from "./runtime/reducer";
export * from "./runtime/selectors";
