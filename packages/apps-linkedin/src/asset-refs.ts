import type { EpisodeAssetRef, PluginAssetCollector } from "@tokovo/core";
import type { LinkedInState, LIPost, LIUser } from "./runtime/state.js";

const MAX_FEED_POSTS = 4;
const MAX_NOTIFICATIONS = 6;
const MAX_MESSAGE_THREADS = 4;

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
    appId: "app_linkedin",
    usage,
    fromFrame: 0,
    strategy: "eager",
    priority,
    source: "plugin",
  };
}

function pushUserAvatar(refs: EpisodeAssetRef[], user: LIUser | undefined): void {
  const ref = createRef(user?.avatarUrl, "image", "avatar", 78);
  if (ref) {
    refs.push(ref);
  }
}

function pushPostAssets(
  refs: EpisodeAssetRef[],
  post: LIPost | undefined,
  usersById: Map<string, LIUser>,
): void {
  if (!post) {
    return;
  }

  pushUserAvatar(refs, usersById.get(post.authorId));

  const mediaType = post.media?.type;
  for (const url of post.media?.urls ?? []) {
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
    post.linkPreview?.imageUrl,
    "image",
    "link-preview",
    58,
  );
  if (linkPreviewRef) {
    refs.push(linkPreviewRef);
  }
}

export const collectLinkedInAssetRefs: PluginAssetCollector<"app_linkedin"> = ({
  initialWorld,
}) => {
  const state = initialWorld.appState?.app_linkedin as LinkedInState | undefined;
  if (!state) {
    return [];
  }

  const refs: EpisodeAssetRef[] = [];
  const usersById = new Map(state.users.map((user) => [user.id, user]));
  const postsById = new Map(state.posts.map((post) => [post.id, post]));

  pushUserAvatar(
    refs,
    state.currentUserId ? usersById.get(state.currentUserId) : undefined,
  );

  switch (state.currentScreen) {
    case "feed":
      for (const postId of state.feed.slice(0, MAX_FEED_POSTS)) {
        pushPostAssets(refs, postsById.get(postId), usersById);
      }
      break;
    case "post":
      pushPostAssets(
        refs,
        state.activePostId ? postsById.get(state.activePostId) : undefined,
        usersById,
      );
      break;
    case "profile":
      pushUserAvatar(
        refs,
        state.activeUserId ? usersById.get(state.activeUserId) : state.currentUserId ? usersById.get(state.currentUserId) : undefined,
      );
      for (const postId of state.feed.filter((id) => {
        const post = postsById.get(id);
        const ownerId = state.activeUserId ?? state.currentUserId;
        return Boolean(post && ownerId && post.authorId === ownerId);
      }).slice(0, 2)) {
        pushPostAssets(refs, postsById.get(postId), usersById);
      }
      break;
    case "notifications":
      for (const notification of state.notifications.slice(0, MAX_NOTIFICATIONS)) {
        pushUserAvatar(refs, usersById.get(notification.actorId));
      }
      break;
    case "messages":
      for (const thread of state.dmThreads.slice(0, MAX_MESSAGE_THREADS)) {
        const participantId = thread.participantIds.find((id) => id !== state.currentUserId);
        pushUserAvatar(refs, participantId ? usersById.get(participantId) : undefined);
      }
      break;
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
