import type { EpisodeAssetRef, PluginAssetCollector } from "@tokovo/core";
import type { SnapchatConversation, SnapchatState } from "./types/index.js";

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
    appId: "app_snapchat",
    usage,
    fromFrame: 0,
    strategy: "eager",
    priority,
    source: "plugin",
  };
}

function pushConversationAssets(
  refs: EpisodeAssetRef[],
  conversation: SnapchatConversation | undefined,
): void {
  if (!conversation) return;
  const avatarRef = createRef(
    conversation.avatar ?? conversation.participants[0]?.avatar,
    "image",
    "avatar",
    70,
  );
  if (avatarRef) refs.push(avatarRef);

  const recent = conversation.messages.slice(-4);
  for (const message of recent) {
    for (const attachment of message.attachments ?? []) {
      const ref = createRef(
        attachment.url,
        attachment.kind === "video" ? "video" : "image",
        message.kind === "snap" ? "message-media" : "sticker",
        message.kind === "snap" ? 76 : 60,
      );
      if (ref) refs.push(ref);
    }
  }
}

export const collectSnapchatAssetRefs: PluginAssetCollector<"app_snapchat"> = ({
  initialWorld,
}) => {
  const state = initialWorld.appState?.app_snapchat as SnapchatState | undefined;
  if (!state) return [];
  const refs: EpisodeAssetRef[] = [];

  if (state.currentScreen === "chat_list") {
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
