import {
  createTokovoRuntime,
  getSharedTokovoRuntime,
  type TokovoRuntime,
} from "@tokovo/episodes";

export type VideoRunnerRuntime = TokovoRuntime;

export function createRenderRuntime(): VideoRunnerRuntime {
  return createTokovoRuntime("release");
}

export function getSharedRenderRuntime(): VideoRunnerRuntime {
  return getSharedTokovoRuntime("release");
}
