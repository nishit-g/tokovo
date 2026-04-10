import type { EpisodeAssetRef, PluginAssetCollector } from "@tokovo/core";
import type { IMessageConversation, IMessageState } from "./types/index.js";

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
    appId: "app_imessage",
    usage,
    fromFrame: 0,
    strategy: "eager",
    priority,
    source: "plugin",
  };
}

function pushConversationAssets(
  refs: EpisodeAssetRef[],
  conversation: IMessageConversation | undefined,
): void {
  if (!conversation) return;
  const avatarRef = createRef(conversation.avatar ?? conversation.participants[0]?.avatar, "image", "avatar", 72);
  if (avatarRef) refs.push(avatarRef);

  for (const participant of conversation.participants) {
    const ref = createRef(participant.avatar, "image", "avatar", 62);
    if (ref) refs.push(ref);
  }

  for (const message of conversation.messages.slice(-5)) {
    for (const attachment of message.attachments ?? []) {
      const directUrl =
        "url" in attachment
          ? attachment.url
          : attachment.kind === "contact"
            ? attachment.avatarUrl
            : attachment.kind === "link"
              ? attachment.preview.thumbnail
              : undefined;
      const ref = createRef(
        directUrl,
        attachment.kind === "video" ? "video" : "image",
        attachment.kind === "link" ? "link-preview" : "message-media",
        attachment.kind === "video" ? 76 : 66,
      );
      if (ref) refs.push(ref);
    }
  }
}

export const collectIMessageAssetRefs: PluginAssetCollector<"app_imessage"> = ({
  initialWorld,
}) => {
  const state = initialWorld.appState?.app_imessage as IMessageState | undefined;
  if (!state) return [];
  const refs: EpisodeAssetRef[] = [];

  if (state.currentScreen === "list") {
    Object.values(state.conversations ?? {})
      .sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0))
      .slice(0, 5)
      .forEach((conversation) => pushConversationAssets(refs, conversation));
    return refs;
  }

  if (state.activeConversationId) {
    pushConversationAssets(refs, state.conversations?.[state.activeConversationId]);
  }

  return refs;
};
