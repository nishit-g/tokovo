import type { EpisodeAssetRef, PluginAssetCollector } from "@tokovo/core";
import type { XState, XTweet, XUser } from "./runtime/state.js";

const MAX_TIMELINE_TWEETS = 4;
const MAX_NOTIFICATIONS = 6;

function createRef(
  src: string | undefined,
  kind: EpisodeAssetRef["kind"],
  usage: EpisodeAssetRef["usage"],
  priority: number,
): EpisodeAssetRef | null {
  if (!src) {
    return null;
  }

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

function pushUserAvatar(refs: EpisodeAssetRef[], user: XUser | undefined): void {
  const ref = createRef(user?.avatarUrl, "image", "avatar", 78);
  if (ref) {
    refs.push(ref);
  }
}

function pushTweetAssets(
  refs: EpisodeAssetRef[],
  tweet: XTweet | undefined,
  usersById: Map<string, XUser>,
): void {
  if (!tweet) {
    return;
  }

  pushUserAvatar(refs, usersById.get(tweet.authorId));

  const mediaType = tweet.media?.type;
  for (const url of tweet.media?.urls ?? []) {
    const ref = createRef(
      url,
      mediaType === "video" ? "video" : "image",
      "message-media",
      mediaType === "video" ? 74 : 70,
    );
    if (ref) {
      refs.push(ref);
    }
  }

  const linkPreviewRef = createRef(
    tweet.linkPreview?.imageUrl,
    "image",
    "link-preview",
    58,
  );
  if (linkPreviewRef) {
    refs.push(linkPreviewRef);
  }
}

export const collectXAssetRefs: PluginAssetCollector<"app_x"> = ({
  initialWorld,
}) => {
  const state = initialWorld.appState?.app_x as XState | undefined;
  if (!state) {
    return [];
  }

  const refs: EpisodeAssetRef[] = [];
  const usersById = new Map(state.users.map((user) => [user.id, user]));
  const tweetsById = new Map(state.tweets.map((tweet) => [tweet.id, tweet]));

  pushUserAvatar(refs, state.currentUserId ? usersById.get(state.currentUserId) : undefined);

  switch (state.currentScreen) {
    case "timeline":
      for (const tweetId of state.timeline.slice(0, MAX_TIMELINE_TWEETS)) {
        pushTweetAssets(refs, tweetsById.get(tweetId), usersById);
      }
      break;
    case "tweet": {
      const activeTweet = state.activeTweetId
        ? tweetsById.get(state.activeTweetId)
        : undefined;
      pushTweetAssets(refs, activeTweet, usersById);
      for (const replyId of activeTweet?.replyIds.slice(0, MAX_TIMELINE_TWEETS) ?? []) {
        pushTweetAssets(refs, tweetsById.get(replyId), usersById);
      }
      break;
    }
    case "profile":
      pushUserAvatar(refs, state.activeUserId ? usersById.get(state.activeUserId) : undefined);
      break;
    case "notifications":
      for (const notification of state.notifications.slice(0, MAX_NOTIFICATIONS)) {
        pushUserAvatar(refs, usersById.get(notification.actorId));
      }
      break;
    case "messages":
    case "thread": {
      const thread = state.activeThreadId
        ? state.dmThreads.find((item) => item.id === state.activeThreadId)
        : undefined;
      for (const participantId of thread?.participantIds ?? []) {
        if (participantId === state.currentUserId) {
          continue;
        }
        pushUserAvatar(refs, usersById.get(participantId));
      }
      break;
    }
    case "compose":
    default:
      break;
  }

  return refs;
};
