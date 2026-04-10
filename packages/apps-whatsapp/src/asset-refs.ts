import type { EpisodeAssetRef, PluginAssetCollector } from "@tokovo/core";
import type {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppState,
} from "./types/index.js";

const MAX_ACTIVE_CHAT_MEDIA = 8;
const MAX_LIST_AVATARS = 10;

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
    appId: "app_whatsapp",
    usage,
    fromFrame: 0,
    strategy: "eager",
    priority,
    source: "plugin",
  };
}

function collectMessageRefs(message: WhatsAppMessage): EpisodeAssetRef[] {
  const refs = [
    createRef(message.imageUrl, "image", "message-media", 72),
    createRef(message.videoUrl, "video", "message-media", 76),
    createRef(message.thumbnailUrl, "image", "message-media", 70),
    createRef(message.gifUrl, "gif", "message-media", 70),
    createRef(message.stickerUrl, "image", "sticker", 68),
    createRef(message.mapThumbnailUrl, "image", "map", 62),
    createRef(message.linkPreview?.image, "image", "link-preview", 58),
    createRef(message.replyTo?.thumbnailUrl, "image", "message-media", 56),
    createRef(message.contactAvatarUrl, "image", "avatar", 74),
  ];

  return refs.filter((ref): ref is EpisodeAssetRef => ref !== null);
}

function asConversationMap(
  conversations: WhatsAppState["conversations"],
): Record<string, WhatsAppConversation> {
  return (conversations ?? {}) as Record<string, WhatsAppConversation>;
}

export const collectWhatsAppAssetRefs: PluginAssetCollector<"app_whatsapp"> = ({
  initialWorld,
}) => {
  const state = initialWorld.appState?.app_whatsapp as WhatsAppState | undefined;
  if (!state) {
    return [];
  }

  const conversations = asConversationMap(state.conversations);
  const refs: EpisodeAssetRef[] = [];

  if (state.currentScreen === "chat") {
    const activeConversationId = state.currentConversationId ?? state.conversationId;
    const conversation = activeConversationId
      ? conversations[activeConversationId]
      : undefined;

    if (conversation?.avatar) {
      const avatarRef = createRef(conversation.avatar, "image", "avatar", 82);
      if (avatarRef) {
        refs.push(avatarRef);
      }
    }

    const mediaMessages = [...(conversation?.messages ?? [])]
      .filter((message) =>
        Boolean(
          message.imageUrl ||
            message.videoUrl ||
            message.thumbnailUrl ||
            message.gifUrl ||
            message.stickerUrl ||
            message.mapThumbnailUrl ||
            message.linkPreview?.image ||
            message.replyTo?.thumbnailUrl ||
            message.contactAvatarUrl,
        ),
      )
      .slice(-MAX_ACTIVE_CHAT_MEDIA);

    for (const message of mediaMessages) {
      refs.push(...collectMessageRefs(message));
    }

    return refs;
  }

  for (const conversation of Object.values(conversations).slice(0, MAX_LIST_AVATARS)) {
    const avatarRef = createRef(conversation.avatar, "image", "avatar", 76);
    if (avatarRef) {
      refs.push(avatarRef);
    }
  }

  return refs;
};
