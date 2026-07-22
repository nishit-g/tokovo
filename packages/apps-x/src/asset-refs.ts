import {
  getAppStateForDevice,
  type EpisodeAssetRef,
  type PluginAssetCollector,
} from "@tokovo/core";
import type { XState, XTweet, XUser } from "./runtime/state.js";

function createRef(
  src: string | undefined,
  kind: EpisodeAssetRef["kind"],
  usage: EpisodeAssetRef["usage"],
  priority: number,
): EpisodeAssetRef | null {
  if (!src) return null;
  return {
    id: "",
    src,
    kind,
    owner: "app",
    appId: "app_x",
    usage,
    fromFrame: 0,
    strategy: "eager",
    priority,
    source: "plugin",
  };
}

function pushUserAssets(refs: EpisodeAssetRef[], user: XUser): void {
  const avatar = createRef(user.avatarUrl, "image", "avatar", 82);
  const banner = createRef(user.bannerUrl, "image", "background", 66);
  if (avatar) refs.push(avatar);
  if (banner) refs.push(banner);
}

function pushTweetAssets(refs: EpisodeAssetRef[], tweet: XTweet): void {
  for (const url of tweet.media?.urls ?? []) {
    const ref = createRef(
      url,
      tweet.media?.type === "video" ? "video" : "image",
      "message-media",
      tweet.media?.type === "video" ? 76 : 72,
    );
    if (ref) refs.push(ref);
  }
  const poster = createRef(tweet.media?.posterUrl, "image", "message-media", 78);
  const preview = createRef(tweet.linkPreview?.imageUrl, "image", "link-preview", 64);
  if (poster) refs.push(poster);
  if (preview) refs.push(preview);
}

export const collectXAssetRefs: PluginAssetCollector<"app_x"> = ({
  initialWorld,
  deviceId,
}) => {
  const state = getAppStateForDevice<XState>(initialWorld, "app_x", deviceId);
  if (!state) return [];
  if (state.schemaVersion !== 2) {
    throw new Error(`X_STATE_VERSION_UNSUPPORTED: asset collection received ${String(state.schemaVersion)}`);
  }

  const refs: EpisodeAssetRef[] = [];
  Object.values(state.usersById).forEach((user) => pushUserAssets(refs, user));
  Object.values(state.tweetsById).forEach((tweet) => pushTweetAssets(refs, tweet));
  return refs;
};
