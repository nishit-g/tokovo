/**
 * iMessage Color Palette
 */
import { SCALE_FACTOR } from "../constants";

export const iOS_COLORS = {
  blue: "#007AFF",
  bluePressed: "#0056B3",
  green: "#34C759",
  greenPressed: "#248A3D",
  gray: "#8E8E93",
  grayLight: "#C7C7CC",
  grayUltraLight: "#E5E5EA",
  grayBackground: "#F2F2F7",
  receivedBubble: "#E9E9EB",
  receivedBubbleDark: "#262628",
  textPrimary: "#000000",
  textSecondary: "#8E8E93",
  textWhite: "#FFFFFF",
  separator: "#C6C6C8",
  separatorDark: "#38383A",
  backgroundLight: "#FFFFFF",
  backgroundDark: "#000000",
};

export const TAPBACK_COLORS = {
  heart: "#FF2D55",
  thumbsUp: iOS_COLORS.blue,
  thumbsDown: iOS_COLORS.blue,
  haha: iOS_COLORS.blue,
  exclamation: iOS_COLORS.blue,
  questionMark: iOS_COLORS.blue,
};

export const LAYOUT_CONSTANTS = {
  SCALE: SCALE_FACTOR,
  SCREEN_WIDTH: 393,
  SCREEN_HEIGHT: 852,
  SAFE_AREA_TOP: 47,
  SAFE_AREA_BOTTOM: 34,
  HEADER_HEIGHT: 88,
  HEADER_AVATAR_SIZE: 40,
  BUBBLE_PADDING_H: 12,
  BUBBLE_PADDING_V: 8,
  BUBBLE_RADIUS: 18,
  BUBBLE_MAX_WIDTH: 0.75,
  BUBBLE_TAIL_WIDTH: 8,
  BUBBLE_TAIL_HEIGHT: 10,
  BUBBLE_GAP: 2,
  MESSAGE_GAP: 4,
  FONT_SIZE: 17,
  FONT_SIZE_SMALL: 13,
  FONT_SIZE_TIMESTAMP: 11,
  LINE_HEIGHT: 21,
  TAPBACK_SIZE: 30,
  TAPBACK_ICON_SIZE: 16,
  TAPBACK_OFFSET_Y: -15,
  TYPING_DOT_SIZE: 8,
  TYPING_DOT_GAP: 4,
  INPUT_HEIGHT: 50,
  INPUT_PADDING: 10,
  INPUT_FIELD_HEIGHT: 34,
  INPUT_BORDER_RADIUS: 18,
  LIST_ITEM_HEIGHT: 75,
  LIST_AVATAR_SIZE: 50,
  LIST_PADDING: 16,
};
