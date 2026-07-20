import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const architectureTestPath = fileURLToPath(import.meta.url);
const sourceRoot = join(dirname(architectureTestPath), "..");

const removedLegacyFiles = [
  "components/theme.ts",
  "components/bubbles/constants.ts",
  "config/colors.ts",
  "config/theme.ts",
  "config/tokens.ts",
  "presentation/PresentationContext.tsx",
  "theme/ThemeContext.tsx",
  "ui/ThemeContext.tsx",
  "hooks/useMessageGrouping.ts",
  "components/MessageContent.tsx",
  "components/MessageBubble.tsx",
  "components/MediaBubbles.tsx",
  "components/MediaViewer.tsx",
  "components/BubbleTail.tsx",
  "components/Reactions.tsx",
  "components/screens/StatusScreen.tsx",
  "components/shared/index.ts",
  "components/shared/primitives.tsx",
  "components/bubbles/index.ts",
  "components/bubbles/shared.tsx",
  "config/polish.ts",
  "config/whatsapp-theme.ts",
  "styles.ts",
  "dsl/extension.ts",
  "assets/metadata.tsx",
  "assets/sounds.ts",
  "runtime/adapters/notifications.ts",
  "dsl/group-builder.ts",
  "ir/group-ops.ts",
  "i18n/I18nContext.tsx",
  "i18n/index.ts",
  "i18n/translations.ts",
  "ir/track-event.ts",
  "ir/type-guards.ts",
];

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("WhatsApp UI architecture boundary", () => {
  it("does not restore deleted legacy theme surfaces", () => {
    for (const file of removedLegacyFiles) {
      expect(existsSync(join(sourceRoot, file)), file).toBe(false);
    }
  });

  it("keeps conversation messages in one canonical state collection", () => {
    for (const file of [
      "types/conversation.ts",
      "bootstrap.ts",
      "runtime/reducer.ts",
    ]) {
      expect(readFileSync(join(sourceRoot, file), "utf8")).not.toContain(
        "messagesById",
      );
    }
  });

  it("keeps one canonical selected-conversation field", () => {
    const violations = collectSourceFiles(sourceRoot)
      .filter(
        (file) =>
          file !== architectureTestPath && !file.includes("/__tests__/"),
      )
      .filter((file) =>
        readFileSync(file, "utf8").includes("currentConversationId"),
      );

    expect(violations).toEqual([]);
  });

  it("routes UI consumption through the resolved experience", () => {
    const forbiddenImports = [
      "theme/ThemeContext",
      "presentation/PresentationContext",
      "components/theme",
      "config/tokens",
      "config/theme",
      "MessageData",
      "normalizeMessagesForChat",
      "normalizeMessages",
      "document.querySelector",
      "scrollIntoView",
      "messageRef",
      "openStatus",
      "REMOTE_ALIAS_IDS",
      "VOICE_MESSAGE_RECEIVED",
      "VOICE_PLAY",
      "VOICE_PAUSE",
      "playVoice",
      "pauseVoice",
      "toLocaleDateString",
      'role="button"',
      "bubbleTail",
      "GO_BACK",
      "aliasAnchor",
      '"chat_header"',
      '"message_thread"',
      '"thread_card"',
      '"message_list"',
      '"status_row"',
      '"inputArea"',
      '"typingIndicator"',
      "APP_TYPE_TO_HANDLER_KIND",
      "normalizeWhatsAppEvent",
      "DateSeparatorEvent",
    ];
    const violations = collectSourceFiles(sourceRoot)
      .filter(
        (file) =>
          file !== architectureTestPath && !file.includes("/__tests__/"),
      )
      .flatMap((file) => {
        const contents = readFileSync(file, "utf8");
        return forbiddenImports
          .filter((forbidden) => contents.includes(forbidden))
          .map((forbidden) => `${file}: ${forbidden}`);
      });

    expect(violations).toEqual([]);
  });

  it("rejects the removed voice-only playback snapshot fields at bootstrap", () => {
    const bootstrapPath = join(sourceRoot, "bootstrap.ts");
    const bootstrap = readFileSync(bootstrapPath, "utf8");
    expect(bootstrap).toContain('"isPlaying" in message');
    expect(bootstrap).toContain('"playProgress" in message');

    const violations = collectSourceFiles(sourceRoot)
      .filter(
        (file) =>
          file !== bootstrapPath &&
          file !== architectureTestPath &&
          !file.includes("/__tests__/"),
      )
      .flatMap((file) => {
        const contents = readFileSync(file, "utf8");
        return ["message.isPlaying", "message.playProgress"]
          .filter((forbidden) => contents.includes(forbidden))
          .map((forbidden) => `${file}: ${forbidden}`);
      });

    expect(violations).toEqual([]);
  });

  it("keeps the canonical message item SVG-based and semantically anchored", () => {
    const source = readFileSync(
      join(sourceRoot, "components/ChatMessageItem.tsx"),
      "utf8",
    );
    expect(source).toContain("export const ChatMessageItem");
    expect(source).toContain("function BubbleTail");
    expect(source).toContain("function DeliveryGlyph");
    expect(source).toContain('data-anchor="message"');
    expect(source).toContain('data-anchor="message-footer"');
    expect(source).toContain('data-anchor="reactions"');
    expect(source).toContain('role="listitem"');
    expect(source).toContain("<svg");
  });

  it("uses the public APP event type as the runtime discriminator", () => {
    const schemas = readFileSync(join(sourceRoot, "schemas/events.ts"), "utf8");
    const reducer = readFileSync(join(sourceRoot, "runtime/reducer.ts"), "utf8");
    expect(schemas).toContain('z.discriminatedUnion("type"');
    expect(schemas).toContain('kind: z.literal("APP")');
    expect(reducer).toContain("HANDLERS[parsed.type]");
    expect(reducer).not.toContain("APP_TYPE_TO_HANDLER_KIND");
  });

  it("forbids literal English chrome in every canonical product surface", () => {
    const surfaceFiles = [
      "components/ChatListHeader.tsx",
      "components/ChatListItem.tsx",
      "components/MessageBody.tsx",
      "components/ReplyQuote.tsx",
      "components/screens/CallsScreen.tsx",
      "components/screens/CommunitiesScreen.tsx",
      "components/screens/SettingsScreen.tsx",
      "components/screens/ProfileScreen.tsx",
      "components/screens/GroupInfoScreen.tsx",
      "components/surfaces/ReplyComposerBanner.tsx",
    ];
    const violations = surfaceFiles.flatMap((relativePath) => {
      const source = readFileSync(join(sourceRoot, relativePath), "utf8");
      const directAttributeText = Array.from(
        source.matchAll(
          /(?:title|subtitle|label|body|action|placeholder|alt)=["']([A-Za-z][^"']*)["']/g,
        ),
        (match) => `${relativePath}: ${match[1]}`,
      );
      const directJsxText = Array.from(
        source.matchAll(/>[ \t]*([A-Za-z][A-Za-z][^<{\r\n]*?)[ \t]*</g),
        (match) => `${relativePath}: ${match[1].trim()}`,
      );
      const removedPresentationLiterals = [
        '"typing…"',
        '"📷 Photo"',
        '"🎥 Video"',
        '"🎤 Voice message"',
      ]
        .filter((literal) => source.includes(literal))
        .map((literal) => `${relativePath}: ${literal}`);
      if (/presentation\.chatList\.title(?!Style)/.test(source)) {
        removedPresentationLiterals.push(
          `${relativePath}: presentation.chatList.title`,
        );
      }
      return [
        ...directAttributeText,
        ...directJsxText,
        ...removedPresentationLiterals,
      ];
    });

    expect(violations).toEqual([]);
  });
});
