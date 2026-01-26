import React from "react";
import {
  UIStrategy,
  HeaderProps,
  MessageBubbleProps,
  TypingIndicatorProps,
  InputAreaProps,
} from "../ui-strategy";
import { MessageBubble as IOSMessageBubble } from "../../components/MessageBubble";
import { TypingIndicator as IOSTypingIndicator } from "../../components/TypingIndicator";
import { GroupTypingIndicator } from "../../components/GroupTypingIndicator";

const GHIBLI_DOODLE_PATTERN = `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234A6741' fill-opacity='0.12'%3E%3Cellipse cx='25' cy='20' rx='8' ry='12'/%3E%3Cellipse cx='21' cy='18' rx='6' ry='10'/%3E%3Cellipse cx='29' cy='18' rx='6' ry='10'/%3E%3Ccircle cx='75' cy='35' r='6'/%3E%3Ccircle cx='73' cy='31' r='2'/%3E%3Ccircle cx='77' cy='31' r='2'/%3E%3Cellipse cx='75' cy='37' rx='3' ry='2'/%3E%3Cpath d='M120 15c-3 0-5 4-5 8s2 6 5 6 5-2 5-6-2-8-5-8zm-2 6c0 .5.5 1 1 1s1-.5 1-1-.5-1-1-1-1 .5-1 1zm4 0c0 .5.5 1 1 1s1-.5 1-1-.5-1-1-1-1 .5-1 1z'/%3E%3Cpath d='M165 25l5-8 5 8z'/%3E%3Cpath d='M168 23h4v2h-4z'/%3E%3Ccircle cx='30' cy='80' r='10'/%3E%3Ccircle cx='27' cy='77' r='2'/%3E%3Ccircle cx='33' cy='77' r='2'/%3E%3Cpath d='M26 82q4 3 8 0'/%3E%3Cpath d='M80 70c-8 0-15 5-15 12h30c0-7-7-12-15-12z'/%3E%3Cpath d='M75 75v-3m10 3v-3'/%3E%3Ccircle cx='130' cy='75' r='8'/%3E%3Ccircle cx='127' cy='73' r='1.5'/%3E%3Ccircle cx='133' cy='73' r='1.5'/%3E%3Cellipse cx='130' cy='78' rx='2' ry='1'/%3E%3Cpath d='M175 65c-5 0-10 8-10 15h20c0-7-5-15-10-15z'/%3E%3Ccircle cx='172' cy='73' r='2'/%3E%3Ccircle cx='178' cy='73' r='2'/%3E%3Ccircle cx='25' cy='140' r='12'/%3E%3Ccircle cx='21' cy='136' r='2.5'/%3E%3Ccircle cx='29' cy='136' r='2.5'/%3E%3Cpath d='M20 143q5 4 10 0'/%3E%3Cpath d='M70 130l8-5v10z'/%3E%3Cellipse cx='85' cy='135' rx='10' ry='6'/%3E%3Ccircle cx='125' cy='135' r='5'/%3E%3Ccircle cx='123' cy='133' r='1'/%3E%3Ccircle cx='127' cy='133' r='1'/%3E%3Ccircle cx='175' cy='130' r='15'/%3E%3Ccircle cx='170' cy='125' r='3'/%3E%3Ccircle cx='180' cy='125' r='3'/%3E%3Cpath d='M168 135q7 5 14 0'/%3E%3Cpath d='M30 180c0-5-3-10-8-10s-8 5-8 10'/%3E%3Cpath d='M18 177h8'/%3E%3Ccircle cx='80' cy='185' r='8'/%3E%3Ccircle cx='77' cy='182' r='2'/%3E%3Ccircle cx='83' cy='182' r='2'/%3E%3Cpath d='M130 175l-5 10h10z'/%3E%3Cellipse cx='130' cy='180' rx='3' ry='2'/%3E%3Cpath d='M175 170c-8 0-12 6-12 12h24c0-6-4-12-12-12z'/%3E%3C/g%3E%3C/svg%3E")`;

const GhibliTypingIndicator: React.FC<TypingIndicatorProps> = ({
  isGroupChat,
  typingMembers,
}) => {
  if (isGroupChat && typingMembers) {
    return <GroupTypingIndicator typingMembers={typingMembers} />;
  }
  return <IOSTypingIndicator />;
};

export const ghibliStrategy: UIStrategy = {
  id: "whatsapp-ghibli",
  name: "WhatsApp Ghibli",
  platform: "custom",

  Header: null,
  MessageBubble: IOSMessageBubble as React.FC<MessageBubbleProps>,
  TypingIndicator: GhibliTypingIndicator,
  InputArea: null,

  tokens: {
    backgroundColor: "#F5EBD7",
    doodlePattern: GHIBLI_DOODLE_PATTERN,
    doodleOpacity: 0.12,

    bubbleMyBg: "#A8D5A2",
    bubbleMyText: "#2D3A29",
    bubbleOtherBg: "#FFF8E7",
    bubbleOtherText: "#3D3D3D",

    headerBg: "#4A6741",
    headerText: "#FFF8E7",
    headerSecondary: "#C8E6C9",
    headerIcon: "#FFF8E7",

    inputBg: "#E8F0E3",
    inputFieldBg: "#FFF8E7",
    inputBorder: "#4A6741",
    inputText: "#3D3D3D",
    inputPlaceholder: "#6B705C",
    inputIcon: "#4A6741",
    inputButtonBg: "#4A6741",
    inputButtonIcon: "#FFF8E7",

    systemMessageBg: "#E8F0E3",
    systemMessageText: "#4A6741",

    textColor: "#3D3D3D",
    secondaryColor: "#6B705C",
    accentColor: "#4A6741",
    fontFamily: "'Kosugi Maru', 'Hiragino Kaku Gothic Pro', sans-serif",

    timestampColor: "#6B705C",
    linkColor: "#2D5A27",
  },
};

export default ghibliStrategy;
