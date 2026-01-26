import React from "react";
import {
  UIStrategy,
  MessageBubbleProps,
  TypingIndicatorProps,
} from "../ui-strategy";
import { MessageBubble as IOSMessageBubble } from "../../components/MessageBubble";
import { TypingIndicator as IOSTypingIndicator } from "../../components/TypingIndicator";
import { GroupTypingIndicator } from "../../components/ios/GroupTypingIndicator";

const CYBERPUNK_DOODLE_PATTERN = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2300F0FF' stroke-opacity='0.15' stroke-width='0.5'%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100'/%3E%3Cpath d='M20 0v100M40 0v100M60 0v100M80 0v100'/%3E%3Crect x='10' y='10' width='15' height='15'/%3E%3Crect x='75' y='25' width='10' height='10'/%3E%3Crect x='45' y='70' width='20' height='8'/%3E%3Ccircle cx='30' cy='70' r='5'/%3E%3Ccircle cx='85' cy='85' r='8'/%3E%3Cpath d='M5 50l10-5 10 5 10-5'/%3E%3Cpath d='M60 15l5 10h-10z'/%3E%3Cpath d='M70 55h20l-5 10h-20z'/%3E%3C/g%3E%3C/svg%3E")`;

const CyberpunkTypingIndicator: React.FC<TypingIndicatorProps> = ({
  isGroupChat,
  typingMembers,
}) => {
  if (isGroupChat && typingMembers) {
    return <GroupTypingIndicator typingMembers={typingMembers} />;
  }
  return <IOSTypingIndicator />;
};

export const cyberpunkStrategy: UIStrategy = {
  id: "whatsapp-cyberpunk",
  name: "WhatsApp Cyberpunk",
  platform: "custom",

  Header: null,
  MessageBubble: IOSMessageBubble as React.FC<MessageBubbleProps>,
  TypingIndicator: CyberpunkTypingIndicator,
  InputArea: null,

  tokens: {
    backgroundColor: "#0A0A12",
    doodlePattern: CYBERPUNK_DOODLE_PATTERN,
    doodleOpacity: 0.4,

    bubbleMyBg: "#FF2E97",
    bubbleMyText: "#FFFFFF",
    bubbleOtherBg: "#1A1A2E",
    bubbleOtherText: "#00F0FF",

    headerBg: "#12121C",
    headerText: "#00F0FF",
    headerSecondary: "#FF2E97",
    headerIcon: "#00F0FF",

    inputBg: "#12121C",
    inputFieldBg: "#1A1A2E",
    inputBorder: "#FF2E97",
    inputText: "#FFFFFF",
    inputPlaceholder: "#666680",
    inputIcon: "#00F0FF",
    inputButtonBg: "#FF2E97",
    inputButtonIcon: "#FFFFFF",

    systemMessageBg: "#1A1A2E",
    systemMessageText: "#00F0FF",

    textColor: "#FFFFFF",
    secondaryColor: "#666680",
    accentColor: "#FF2E97",
    fontFamily: "'Orbitron', 'Rajdhani', monospace",

    timestampColor: "#666680",
    linkColor: "#00F0FF",
  },
};

export default cyberpunkStrategy;
