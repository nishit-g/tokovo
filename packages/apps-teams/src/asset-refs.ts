import type { EpisodeAssetRef, PluginAssetCollector } from "@tokovo/core";
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
}) => {
  const state = initialWorld.appState?.app_teams as TeamsState | undefined;
  if (!state) return [];

  const refs: EpisodeAssetRef[] = [];
  for (const user of Object.values(state.users).slice(0, 12)) {
    const ref = createRef(user.avatar, 70);
    if (ref) refs.push(ref);
  }
  return refs;
};
