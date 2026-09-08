import React from "react";
import { Pin } from "lucide-react";
import { requireAppStateForDevice, WorldState } from "@tokovo/core";
import {
  KeyboardAwareView,
  useInputField,
  useKeyboardHeight,
} from "@tokovo/react";
import { Header as DefaultHeader } from "../Header.js";
import { GroupHeader } from "../GroupHeader.js";
import { MessageList } from "../MessageList.js";
import { InputArea as DefaultInputArea } from "../InputArea.js";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import { formatWhatsAppNumber } from "../../localization/index.js";
import type { WhatsAppState, WhatsAppConversation } from "../../types/index.js";
import { getBaseTime } from "../../utils/messages.js";
import { resolveTypingMembers } from "../../utils/participants.js";
import { projectWhatsAppThread } from "../../thread/projector.js";
import { MessageActionMenu } from "../surfaces/MessageActionMenu.js";
import { ReplyComposerBanner } from "../surfaces/ReplyComposerBanner.js";
import { getChatChromeGeometry } from "../../config/layout-config.js";

export interface ChatScreenProps {
  world: WorldState;
  deviceId: string;
  contentInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  world,
  deviceId,
  contentInsets,
  width,
  height: _height,
}) => {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const appState = requireAppStateForDevice<WhatsAppState>(
    world,
    "app_whatsapp",
    deviceId,
  );
  const conversations = appState.conversations as Record<
    string,
    WhatsAppConversation
  >;
  const conversationId = appState.conversationId;

  const conversation: WhatsAppConversation | undefined = conversationId
    ? conversations[conversationId]
    : undefined;

  if (!conversationId || !conversation) {
    throw new Error("WhatsApp chat screen requires a valid conversationId");
  }

  const contactName = conversation.name || t("chat.unknown");
  const messages = conversation.messages;
  const typingMembers = resolveTypingMembers(conversation);

  const memberNames = conversation?.members?.map((m) => m.name) ?? [];
  const memberCount = conversation?.members?.length ?? 0;

  const status = (() => {
    if (typingMembers.length > 0) {
      if (conversation?.type !== "group") {
        return t("chat.typing");
      }
      const names = typingMembers.map((m) => m.name);
      if (names.length === 1) return t("chat.memberTyping", { name: names[0] });
      if (names.length === 2) {
        return t("chat.twoMembersTyping", {
          first: names[0],
          second: names[1],
        });
      }
      return t("chat.manyMembersTyping", {
        first: names[0],
        count: formatWhatsAppNumber(locale, names.length - 1),
      });
    }
    if (conversation?.type === "group") {
      if (conversation.description) return conversation.description;
      if (memberCount > 0) {
        return t("chat.members", {
          count: formatWhatsAppNumber(locale, memberCount),
        });
      }
      if (memberNames.length > 0) return memberNames.slice(0, 3).join(", ");
      return t("chat.group");
    }
    return (
      conversation.contact?.lastSeenLabel ??
      conversation.contact?.businessCategory ??
      ""
    );
  })();

  const device = world.devices[deviceId];
  if (!device) {
    throw new Error(
      `WHATSAPP_DEVICE_MISSING: "${deviceId}" is not in world state.`,
    );
  }
  const ownerName = device.ownerName;
  const thread = projectWhatsAppThread({
    conversationId,
    messages,
    conversation,
    ownerName: ownerName ?? "me",
    baseTime: getBaseTime(world, deviceId),
    fps: world.config?.fps ?? 30,
    locale,
  });
  const activeReply =
    appState.replyComposer?.conversationId === conversationId
      ? appState.replyComposer
      : null;
  const replyMessage = activeReply
    ? thread.messagesById.get(activeReply.messageId)
    : undefined;
  if (activeReply && !replyMessage) {
    throw new Error(
      `WhatsApp reply composer references missing message "${activeReply.messageId}"`,
    );
  }

  // TokovoRenderer already provides contentInsets in design coordinates.
  const contentInsetTop = contentInsets.top;
  const contentInsetBottom = contentInsets.bottom;
  const composerInput = useInputField("composer");
  const composerText = composerInput?.value ?? conversation.draftText ?? "";
  const composerFocused = composerInput?.isKeyboardVisible ?? false;
  // A system keyboard already owns the bottom platform inset. Keeping the app's
  // home-indicator inset while it is attached creates a conspicuous dead band
  // between the WhatsApp composer and the keyboard.
  const composerContentInsetsBottom = Math.max(
    0,
    contentInsetBottom - useKeyboardHeight(),
  );
  const bottomPadding = getChatChromeGeometry({
    top: contentInsetTop,
    bottom: composerContentInsetsBottom,
  }).messageBottomInset;

  return (
    <KeyboardAwareView>
      {conversation?.type === "group" ? (
        <GroupHeader
          groupName={contactName}
          members={conversation.members ?? []}
          groupAvatar={conversation.avatar}
          contentInsetTop={contentInsetTop}
        />
      ) : (
        <DefaultHeader
          contactName={contactName}
          avatarUrl={conversation?.avatar}
          status={status}
          contentInsetTop={contentInsetTop}
          locked={conversation.preferences?.chatLock}
          contactLabel={conversation.contact?.businessCategory}
          verifiedBusiness={conversation.contact?.verifiedBusiness}
        />
      )}

      {conversation?.pinnedMessage && (
        <div
          style={{
            backgroundColor: theme.colors.headerBackground,
            borderBottom: `1px solid ${theme.colors.divider}`,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: 9,
          }}
        >
          <Pin
            size={15}
            color={theme.colors.accent}
            style={{ flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: theme.colors.accent,
                fontWeight: 600,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {t("chat.pinnedMessage")}
            </div>
            <div
              style={{
                fontSize: 13,
                color: theme.colors.receivedBubbleText,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {conversation.pinnedMessage.from
                ? `${conversation.pinnedMessage.from}: ${conversation.pinnedMessage.text}`
                : conversation.pinnedMessage.text}
            </div>
          </div>
        </div>
      )}

      <MessageList
        thread={thread}
        viewportWidth={width}
        isTyping={typingMembers.length > 0}
        typingMembers={typingMembers}
        isGroupChat={conversation?.type === "group"}
        bottomPadding={bottomPadding}
        activeGesture={appState.activeGesture}
        focusMessageId={
          appState.threadViewport?.conversationId === conversationId
            ? appState.threadViewport.focusMessageId
            : undefined
        }
      />

      {appState.activeGesture?.gesture === "long_press" &&
        appState.activeGesture.phase === "completed" && (
          <MessageActionMenu
            message={thread.messagesById.get(appState.activeGesture.messageId)!}
          />
        )}

      {replyMessage && <ReplyComposerBanner message={replyMessage} />}

      <DefaultInputArea
        viewportWidth={width}
        text={composerText}
        showCursor={composerFocused}
        inputDirection={composerInput?.direction}
        inputLanguage={composerInput?.locale.tag}
        selection={composerInput?.selection}
        lastActivityFrame={composerInput?.lastActivityFrame}
        contentInsetBottom={composerContentInsetsBottom}
      />
    </KeyboardAwareView>
  );
};
