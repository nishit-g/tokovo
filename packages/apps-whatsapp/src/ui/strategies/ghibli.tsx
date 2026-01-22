import React from "react";
import { ChevronLeft, Video, Phone, Smile, Mic, Camera, Plus } from "lucide-react";
import {
  UIStrategy,
  UIStrategyRegistry,
  HeaderProps,
  MessageBubbleProps,
  TypingIndicatorProps,
  InputAreaProps,
} from "../ui-strategy";
import { MessageBubble as IOSMessageBubble } from "../../components/ios/MessageBubble";
import { TypingIndicator as IOSTypingIndicator } from "../../components/ios/TypingIndicator";
import { GroupTypingIndicator } from "../../components/ios/GroupTypingIndicator";
import { UI_CONSTANTS } from "../../config/layout-config";

const GHIBLI_COLORS = {
  headerBg: "#4A6741",
  headerText: "#FFF8E7",
  headerSecondary: "#C8E6C9",
  inputBg: "#E8F0E3",
  inputBorder: "#4A6741",
  iconColor: "#FFF8E7",
  accentColor: "#6B8E5C",
};

const GHIBLI_DOODLE_PATTERN = `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234A6741' fill-opacity='0.12'%3E%3Cellipse cx='25' cy='20' rx='8' ry='12'/%3E%3Cellipse cx='21' cy='18' rx='6' ry='10'/%3E%3Cellipse cx='29' cy='18' rx='6' ry='10'/%3E%3Ccircle cx='75' cy='35' r='6'/%3E%3Ccircle cx='73' cy='31' r='2'/%3E%3Ccircle cx='77' cy='31' r='2'/%3E%3Cellipse cx='75' cy='37' rx='3' ry='2'/%3E%3Cpath d='M120 15c-3 0-5 4-5 8s2 6 5 6 5-2 5-6-2-8-5-8zm-2 6c0 .5.5 1 1 1s1-.5 1-1-.5-1-1-1-1 .5-1 1zm4 0c0 .5.5 1 1 1s1-.5 1-1-.5-1-1-1-1 .5-1 1z'/%3E%3Cpath d='M165 25l5-8 5 8z'/%3E%3Cpath d='M168 23h4v2h-4z'/%3E%3Ccircle cx='30' cy='80' r='10'/%3E%3Ccircle cx='27' cy='77' r='2'/%3E%3Ccircle cx='33' cy='77' r='2'/%3E%3Cpath d='M26 82q4 3 8 0'/%3E%3Cpath d='M80 70c-8 0-15 5-15 12h30c0-7-7-12-15-12z'/%3E%3Cpath d='M75 75v-3m10 3v-3'/%3E%3Ccircle cx='130' cy='75' r='8'/%3E%3Ccircle cx='127' cy='73' r='1.5'/%3E%3Ccircle cx='133' cy='73' r='1.5'/%3E%3Cellipse cx='130' cy='78' rx='2' ry='1'/%3E%3Cpath d='M175 65c-5 0-10 8-10 15h20c0-7-5-15-10-15z'/%3E%3Ccircle cx='172' cy='73' r='2'/%3E%3Ccircle cx='178' cy='73' r='2'/%3E%3Ccircle cx='25' cy='140' r='12'/%3E%3Ccircle cx='21' cy='136' r='2.5'/%3E%3Ccircle cx='29' cy='136' r='2.5'/%3E%3Cpath d='M20 143q5 4 10 0'/%3E%3Cpath d='M70 130l8-5v10z'/%3E%3Cellipse cx='85' cy='135' rx='10' ry='6'/%3E%3Ccircle cx='125' cy='135' r='5'/%3E%3Ccircle cx='123' cy='133' r='1'/%3E%3Ccircle cx='127' cy='133' r='1'/%3E%3Ccircle cx='175' cy='130' r='15'/%3E%3Ccircle cx='170' cy='125' r='3'/%3E%3Ccircle cx='180' cy='125' r='3'/%3E%3Cpath d='M168 135q7 5 14 0'/%3E%3Cpath d='M30 180c0-5-3-10-8-10s-8 5-8 10'/%3E%3Cpath d='M18 177h8'/%3E%3Ccircle cx='80' cy='185' r='8'/%3E%3Ccircle cx='77' cy='182' r='2'/%3E%3Ccircle cx='83' cy='182' r='2'/%3E%3Cpath d='M130 175l-5 10h10z'/%3E%3Cellipse cx='130' cy='180' rx='3' ry='2'/%3E%3Cpath d='M175 170c-8 0-12 6-12 12h24c0-6-4-12-12-12z'/%3E%3Ccircle cx='171' cy='177' r='2'/%3E%3Ccircle cx='179' cy='177' r='2'/%3E%3C/g%3E%3C/svg%3E")`;

const GhibliHeader: React.FC<HeaderProps> = ({
  conversation,
  safeAreaTop,
  onBack,
}) => {
  const contentHeight = UI_CONSTANTS.HEADER_CONTENT_HEIGHT;
  const totalHeight = safeAreaTop + contentHeight;
  const contactName = conversation.name || "Unknown";
  const avatarUrl = conversation.avatar;
  const status = (conversation as any).status || "online";

  return (
    <div
      data-anchor="header"
      style={{
        height: totalHeight,
        backgroundColor: GHIBLI_COLORS.headerBg,
        paddingTop: safeAreaTop,
        display: "flex",
        alignItems: "center",
        paddingLeft: UI_CONSTANTS.HEADER_PADDING_X,
        paddingRight: UI_CONSTANTS.HEADER_PADDING_X,
        borderBottom: `1px solid ${GHIBLI_COLORS.accentColor}`,
        position: "relative",
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginRight: 8,
          color: GHIBLI_COLORS.iconColor,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={34} color={GHIBLI_COLORS.iconColor} style={{ marginLeft: -8 }} />
      </div>

      <div
        data-anchor="profile"
        style={{
          width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          borderRadius: "50%",
          backgroundColor: GHIBLI_COLORS.headerSecondary,
          marginRight: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
          overflow: "hidden",
          flexShrink: 0,
          border: `2px solid ${GHIBLI_COLORS.headerSecondary}`,
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: GHIBLI_COLORS.headerSecondary }} />
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: GHIBLI_COLORS.headerText,
            lineHeight: "20px",
            fontFamily: "'Kosugi Maru', sans-serif",
          }}
        >
          {contactName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: GHIBLI_COLORS.headerSecondary,
            lineHeight: "14px",
          }}
        >
          {status}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, paddingRight: 8 }}>
        <Video size={24} color={GHIBLI_COLORS.iconColor} strokeWidth={1.5} />
        <Phone size={22} color={GHIBLI_COLORS.iconColor} strokeWidth={1.5} />
      </div>
    </div>
  );
};

const GhibliMessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  isFirst,
  isLast,
  isGroupChat,
  senderName,
  senderColor,
  showSenderName,
}) => {
  return (
    <IOSMessageBubble
      message={message}
      isMe={isMe}
      isFirst={isFirst}
      isLast={isLast}
      isGroupChat={isGroupChat}
      senderName={senderName}
      senderColor={senderColor}
      showSenderName={showSenderName}
    />
  );
};

const GhibliTypingIndicator: React.FC<TypingIndicatorProps> = ({
  isGroupChat,
  typingMembers,
}) => {
  if (isGroupChat && typingMembers) {
    return <GroupTypingIndicator typingMembers={typingMembers} />;
  }
  return <IOSTypingIndicator />;
};

const GhibliInputArea: React.FC<InputAreaProps> = ({
  text,
  showCursor,
  safeAreaBottom,
}) => {
  const hasText = text && text.length > 0;

  return (
    <div
      data-anchor="input-area"
      style={{
        backgroundColor: GHIBLI_COLORS.inputBg,
        paddingTop: 8,
        paddingBottom: safeAreaBottom + 8,
        paddingLeft: 8,
        paddingRight: 8,
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        borderTop: `1px solid ${GHIBLI_COLORS.inputBorder}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          backgroundColor: GHIBLI_COLORS.headerBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Plus size={20} color={GHIBLI_COLORS.iconColor} strokeWidth={2} />
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 36,
          maxHeight: 100,
          backgroundColor: "#FFF8E7",
          borderRadius: 18,
          border: `1px solid ${GHIBLI_COLORS.inputBorder}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 8,
          gap: 8,
        }}
      >
        <Smile size={24} color={GHIBLI_COLORS.headerBg} strokeWidth={1.5} />
        <div
          style={{
            flex: 1,
            fontSize: 16,
            color: text ? "#3D3D3D" : "#6B705C",
            fontFamily: "'Kosugi Maru', sans-serif",
            lineHeight: "36px",
          }}
        >
          {text || "Message"}
          {showCursor && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: 18,
                backgroundColor: GHIBLI_COLORS.headerBg,
                marginLeft: 1,
                animation: "blink 1s infinite",
              }}
            />
          )}
        </div>
        <Camera size={24} color={GHIBLI_COLORS.headerBg} strokeWidth={1.5} />
      </div>

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          backgroundColor: GHIBLI_COLORS.headerBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {hasText ? (
          <ChevronLeft
            size={22}
            color={GHIBLI_COLORS.iconColor}
            strokeWidth={2}
            style={{ transform: "rotate(180deg)" }}
          />
        ) : (
          <Mic size={20} color={GHIBLI_COLORS.iconColor} strokeWidth={2} />
        )}
      </div>
    </div>
  );
};

export const ghibliStrategy: UIStrategy = {
  id: "whatsapp-ghibli",
  name: "WhatsApp Ghibli",
  platform: "custom",
  Header: GhibliHeader,
  MessageBubble: GhibliMessageBubble,
  TypingIndicator: GhibliTypingIndicator,
  InputArea: GhibliInputArea,
  tokens: {
    backgroundColor: "#F5EBD7",
    bubbleMyBg: "#C8E6C9",
    bubbleOtherBg: "#FFF8E7",
    textColor: "#3D3D3D",
    secondaryColor: "#6B705C",
    accentColor: "#4A6741",
    fontFamily: "'Kosugi Maru', 'Hiragino Kaku Gothic Pro', sans-serif",
    systemMessageBg: "#E8F0E3",
    systemMessageText: "#4A6741",
    doodlePattern: GHIBLI_DOODLE_PATTERN,
    doodleOpacity: 0.12,
  },
};

UIStrategyRegistry.register(ghibliStrategy);

export default ghibliStrategy;
