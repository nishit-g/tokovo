/** Shared painter/layout tokens in device-logical points. */
export function xTextTokens(scale = 1, android = false) {
  return {
    fontFamily: `${android ? '"Roboto Variable"' : '"Inter Variable"'}, "Noto Sans Arabic Variable", "Noto Sans Devanagari Variable", "Noto Sans JP Variable", sans-serif`,
    body: 15 * scale,
    bodyLine: 20 * scale,
    detail: 20 * scale,
    detailLine: 26 * scale,
    message: 15 * scale,
    messageLine: 20 * scale,
    small: 12 * scale,
    smallLine: 16 * scale,
    page: 16,
    touchTarget: android ? 48 : 44,
    avatar: android ? 42 : 40,
    avatarGap: 12,
    postPadding: android ? 12 : 11,
    messagePadding: 13,
    messageGap: 5,
    runGap: 8,
    threadInset: 12,
    typingHeight: 44,
  };
}
export type XTextTokens = ReturnType<typeof xTextTokens>;
