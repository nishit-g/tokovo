import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { WorldState } from "@tokovo/core";

import {
  getMessageAccessibilityLabel,
  getReactionAccessibilityLabel,
} from "../accessibility/index.js";
import { AppScaffold } from "../components/surfaces/AppScaffold.js";
import { MessageBody } from "../components/MessageBody.js";
import { CallsScreen } from "../components/screens/CallsScreen.js";
import { CommunitiesScreen } from "../components/screens/CommunitiesScreen.js";
import { GroupInfoScreen } from "../components/screens/GroupInfoScreen.js";
import { ProfileScreen } from "../components/screens/ProfileScreen.js";
import { SettingsScreen } from "../components/screens/SettingsScreen.js";
import { WhatsAppExperienceProvider } from "../experience/ExperienceContext.js";
import { resolveWhatsAppExperience } from "../experience/resolver.js";
import {
  formatWhatsAppFileSize,
  formatWhatsAppDigits,
  formatWhatsAppNumber,
  getWhatsAppTextDirection,
  translateWhatsApp,
} from "../localization/index.js";
import type { ProjectedThreadMessage } from "../thread/projector.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";

const safeAreaInsets = { top: 47, bottom: 34, left: 0, right: 0 };

function buildArabicWorld(conversationId = "dm"): WorldState {
  const state = {
    ...createWhatsAppInitialState(),
    locale: "ar" as const,
    conversationId,
    profile: { name: "المخرج", about: "جاهز للنشر" },
    settings: {
      linkedDevicesCount: 2,
      privacy: { lastSeen: "جهات الاتصال", readReceipts: true },
      notifications: { mutedChats: 3 },
    },
    callLog: [
      {
        id: "call-1",
        name: "نور",
        direction: "incoming" as const,
        mode: "voice" as const,
        durationSeconds: 75,
        startedAt: new Date("2026-07-20T18:25:00.000Z").getTime(),
      },
    ],
    conversations: {
      dm: {
        id: "dm",
        name: "نور",
        type: "dm" as const,
        contact: { verifiedBusiness: true },
        messages: [],
      },
      team: {
        id: "team",
        name: "فريق الإطلاق",
        type: "group" as const,
        members: [
          { id: "me", name: "أنت" },
          { id: "noor", name: "نور" },
        ],
        admins: ["noor"],
        messages: [],
      },
    },
    communities: [
      {
        id: "community",
        name: "مجتمع المبدعين",
        groupConversationIds: ["team"],
        memberCount: 2,
      },
    ],
  };

  return {
    appState: { app_whatsapp: state },
    devices: {
      d1: {
        id: "d1",
        ownerName: "المخرج",
        profileId: "iphone16",
        os: { clock: new Date("2026-07-20T18:30:00.000Z").getTime() },
      },
    },
    config: { fps: 30 },
  } as unknown as WorldState;
}

describe("WhatsApp localization and accessibility contract", () => {
  it("resolves complete Arabic RTL presentation deterministically", () => {
    const experience = resolveWhatsAppExperience({
      platform: "android",
      appearance: "dark",
      locale: "ar",
    });

    expect(experience.locale).toBe("ar");
    expect(experience.direction).toBe("rtl");
    expect(getWhatsAppTextDirection("ar")).toBe("rtl");
    expect(experience.t("nav.chats")).toBe("الدردشات");
    expect(formatWhatsAppNumber("ar", 2048)).toBe("٢٠٤٨");
    expect(formatWhatsAppDigits("ar", "02:09")).toBe("٠٢:٠٩");
    expect(formatWhatsAppFileSize("ar", "2.29 MB")).toBe("٢٫٢٩ م.ب");
    expect(
      translateWhatsApp("ar", "a11y.unreadMessages", { count: 3 }),
    ).toBe("٣ رسائل غير مقروءة");
  });

  it("generates localized screen-reader labels for messages and reactions", () => {
    const message: ProjectedThreadMessage = {
      id: "message-1",
      type: "image",
      from: "noor",
      senderName: "نور",
      at: 0,
      reactions: [{ emoji: "❤️", count: 2, fromMe: false }],
    };

    expect(getMessageAccessibilityLabel(message, false, "ar")).toBe(
      "رسالة من نور: صورة",
    );
    expect(getReactionAccessibilityLabel(message, "ar")).toBe(
      "التفاعلات: ❤️ ٢",
    );
  });

  it("renders landmarks, a heading, native tab controls, and RTL direction", () => {
    const experience = resolveWhatsAppExperience({
      platform: "ios",
      appearance: "light",
      locale: "ar",
    });
    const html = renderToStaticMarkup(
      <WhatsAppExperienceProvider experience={experience}>
        <AppScaffold
          title={experience.t("nav.chats")}
          activeTab="chats"
          safeAreaTop={47}
          safeAreaBottom={34}
          unreadChatsCount={3}
        >
          <div>المحتوى</div>
        </AppScaffold>
      </WhatsAppExperienceProvider>,
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain('role="banner"');
    expect(html).toContain('role="main"');
    expect(html).toContain("<h1");
    expect(html).toContain("<nav");
    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("٣ رسائل غير مقروءة");
  });

  it("renders every secondary product screen in Arabic without English chrome", () => {
    const experience = resolveWhatsAppExperience({
      platform: "ios",
      appearance: "light",
      locale: "ar",
    });
    const directWorld = buildArabicWorld("dm");
    const groupWorld = buildArabicWorld("team");
    const screens = [
      <CallsScreen
        key="calls"
        world={directWorld}
        width={393}
        height={852}
        safeAreaInsets={safeAreaInsets}
      />,
      <CommunitiesScreen
        key="communities"
        world={directWorld}
        width={393}
        height={852}
        safeAreaInsets={safeAreaInsets}
      />,
      <SettingsScreen
        key="settings"
        world={directWorld}
        width={393}
        height={852}
        safeAreaInsets={safeAreaInsets}
      />,
      <ProfileScreen
        key="profile"
        world={directWorld}
        width={393}
        height={852}
        safeAreaInsets={safeAreaInsets}
      />,
      <GroupInfoScreen
        key="group"
        world={groupWorld}
        conversationId="team"
        width={393}
        height={852}
        safeAreaInsets={safeAreaInsets}
      />,
    ];
    const html = renderToStaticMarkup(
      <WhatsAppExperienceProvider experience={experience}>
        <>{screens}</>
      </WhatsAppExperienceProvider>,
    );

    for (const expected of [
      "إنشاء رابط مكالمة",
      "مجتمعاتك",
      "البحث في الإعدادات",
      "نشاط تجاري موثّق",
      "إضافة أعضاء",
      "١ د ١٥ ث",
    ]) {
      expect(html).toContain(expected);
    }
    for (const forbidden of [
      "Create call link",
      "Your communities",
      "Search settings",
      "Verified business",
      "Add members",
      "Media, links, and docs",
    ]) {
      expect(html).not.toContain(forbidden);
    }
  });

  it("localizes every structured message-body fallback and numeric label", () => {
    const experience = resolveWhatsAppExperience({
      platform: "android",
      appearance: "dark",
      locale: "ar",
    });
    const messages: ProjectedThreadMessage[] = [
      { id: "contact", from: "noor", type: "contact", at: 0 },
      {
        id: "poll",
        from: "noor",
        type: "poll",
        at: 1,
        options: [{ text: "نعم", votes: 1 }],
        totalVotes: 1,
      },
      {
        id: "call",
        from: "noor",
        type: "call_missed",
        callType: "voice",
        at: 2,
      },
      {
        id: "document",
        from: "noor",
        type: "document",
        fileSize: "2.29 MB",
        at: 3,
      },
    ];
    const html = renderToStaticMarkup(
      <WhatsAppExperienceProvider experience={experience}>
        <>
          {messages.map((message) => (
            <MessageBody key={message.id} message={message} isMe={false} />
          ))}
        </>
      </WhatsAppExperienceProvider>,
    );

    expect(html).toContain("جهة اتصال بلا اسم");
    expect(html).toContain("استطلاع بلا عنوان");
    expect(html).toContain("صوت واحد");
    expect(html).toContain("اضغط لمعاودة الاتصال");
    expect(html).toContain("٢٫٢٩ م.ب");
    expect(html).not.toContain("Unnamed contact");
    expect(html).not.toContain("Untitled poll");
  });
});
