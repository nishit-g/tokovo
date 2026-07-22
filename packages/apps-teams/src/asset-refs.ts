import {
  getAppStateForDevice,
  type EpisodeAssetRef,
  type PluginAssetCollector,
} from "@tokovo/core";
import type { TeamsState } from "./types/index.js";

function createRef(
  src: string | undefined,
  priority: number,
): EpisodeAssetRef | null {
  if (!src) return null;
  return {
    id: src,
    src,
    kind: "image",
    owner: "app",
    appId: "app_teams",
    usage: "avatar",
    strategy: "eager",
    priority,
    source: "plugin",
  };
}

export const collectTeamsAssetRefs: PluginAssetCollector<"app_teams"> = ({
  initialWorld,
  deviceId,
}) => {
  const state = getAppStateForDevice<TeamsState>(
    initialWorld,
    "app_teams",
    deviceId,
  );
  if (!state) return [];

  const refs: EpisodeAssetRef[] = [];
  for (const user of Object.values(state.users).slice(0, 12)) {
    const ref = createRef(user.avatar, 70);
    if (ref) refs.push(ref);
  }
  return refs;
};
