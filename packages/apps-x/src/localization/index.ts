import type { XLocale } from "../runtime/state.js";

export type XDirection = "ltr" | "rtl";

const copy = {
  "en-US": {
    appName: "X",
    forYou: "For you",
    following: "Following",
    home: "Home",
    search: "Search",
    notifications: "Notifications",
    messages: "Messages",
    profile: "Profile",
    all: "All",
    verified: "Verified",
    mentions: "Mentions",
    posts: "Posts",
    replies: "Replies",
    media: "Media",
    likes: "Likes",
    post: "Post",
    cancel: "Cancel",
    draft: "Drafts",
    composePlaceholder: "What is happening?!",
    everyoneCanReply: "Everyone can reply",
    posting: "Posting…",
    replyPlaceholder: "Post your reply",
    reply: "Reply",
    repost: "Repost",
    like: "Like",
    bookmark: "Bookmark",
    share: "Share",
    views: "Views",
    followers: "Followers",
    followingCount: "Following",
    editProfile: "Edit profile",
    message: "Message",
    joined: "Joined",
    pollVotes: "votes",
    pollEnded: "Final results",
    sensitiveMedia: "Content warning",
    sensitiveBody: "This media may contain sensitive content.",
    show: "Show",
    emptyTimelineTitle: "Welcome to your timeline",
    emptyTimelineBody:
      "When people you follow post, their updates will appear here.",
    emptyNotificationsTitle: "Nothing to see—yet",
    emptyNotificationsBody:
      "From likes to reposts and more, this is where all the action happens.",
    emptyMessagesTitle: "Welcome to your inbox",
    emptyMessagesBody:
      "Drop a line, share posts and more with private conversations.",
    newMessage: "New message",
    send: "Send",
    typing: "typing…",
    peopleTyping: "people typing…",
    sending: "Sending…",
    sent: "Sent",
    delivered: "Delivered",
    read: "Seen",
    replyingToMessage: "Replying to",
    failed: "Not sent. Tap to retry.",
    pinned: "Pinned",
    unread: "unread",
    reposted: "reposted",
    repliedTo: "Replying to",
    notificationLike: "liked your post",
    notificationRepost: "reposted your post",
    notificationReply: "replied to your post",
    notificationFollow: "followed you",
    notificationMention: "mentioned you",
    notificationVerified: "shared a verified update",
  },
  "ar-SA": {
    appName: "إكس",
    forYou: "لك",
    following: "المتابَعون",
    home: "الرئيسية",
    search: "البحث",
    notifications: "التنبيهات",
    messages: "الرسائل",
    profile: "الملف الشخصي",
    all: "الكل",
    verified: "موثّق",
    mentions: "الإشارات",
    posts: "المنشورات",
    replies: "الردود",
    media: "الوسائط",
    likes: "الإعجابات",
    post: "نشر",
    cancel: "إلغاء",
    draft: "المسودات",
    composePlaceholder: "ماذا يحدث؟",
    everyoneCanReply: "يمكن للجميع الرد",
    posting: "جارٍ النشر…",
    replyPlaceholder: "اكتب ردك",
    reply: "رد",
    repost: "إعادة نشر",
    like: "إعجاب",
    bookmark: "حفظ",
    share: "مشاركة",
    views: "مشاهدات",
    followers: "متابِعون",
    followingCount: "يتابع",
    editProfile: "تعديل الملف",
    message: "رسالة",
    joined: "انضم في",
    pollVotes: "أصوات",
    pollEnded: "النتائج النهائية",
    sensitiveMedia: "تحذير محتوى",
    sensitiveBody: "قد تتضمن هذه الوسائط محتوى حساسًا.",
    show: "عرض",
    emptyTimelineTitle: "مرحبًا بك في خطك الزمني",
    emptyTimelineBody: "ستظهر هنا منشورات الحسابات التي تتابعها.",
    emptyNotificationsTitle: "لا شيء هنا—بعد",
    emptyNotificationsBody: "ستظهر هنا الإعجابات وإعادات النشر وبقية الأنشطة.",
    emptyMessagesTitle: "مرحبًا بك في صندوق الوارد",
    emptyMessagesBody: "ابدأ محادثة خاصة وشارك المنشورات.",
    newMessage: "رسالة جديدة",
    send: "إرسال",
    typing: "يكتب…",
    peopleTyping: "يكتبون…",
    sending: "جارٍ الإرسال…",
    sent: "تم الإرسال",
    delivered: "تم التسليم",
    read: "شوهدت",
    replyingToMessage: "ردًا على",
    failed: "لم تُرسل. اضغط لإعادة المحاولة.",
    pinned: "مثبّت",
    unread: "غير مقروء",
    reposted: "أعاد النشر",
    repliedTo: "ردًا على",
    notificationLike: "أعجب بمنشورك",
    notificationRepost: "أعاد نشر منشورك",
    notificationReply: "رد على منشورك",
    notificationFollow: "بدأ بمتابعتك",
    notificationMention: "أشار إليك",
    notificationVerified: "نشر تحديثًا موثّقًا",
  },
  "hi-IN": {
    appName: "एक्स",
    forYou: "आपके लिए",
    following: "फ़ॉलोइंग",
    home: "होम",
    search: "खोजें",
    notifications: "नोटिफ़िकेशन",
    messages: "मैसेज",
    profile: "प्रोफ़ाइल",
    all: "सभी",
    verified: "वेरिफ़ाइड",
    mentions: "मेंशन",
    posts: "पोस्ट",
    replies: "जवाब",
    media: "मीडिया",
    likes: "लाइक",
    post: "पोस्ट करें",
    cancel: "रद्द करें",
    draft: "ड्राफ़्ट",
    composePlaceholder: "क्या हो रहा है?!",
    everyoneCanReply: "हर कोई जवाब दे सकता है",
    posting: "पोस्ट हो रहा है…",
    replyPlaceholder: "अपना जवाब पोस्ट करें",
    reply: "जवाब",
    repost: "रीपोस्ट",
    like: "लाइक",
    bookmark: "बुकमार्क",
    share: "शेयर",
    views: "व्यू",
    followers: "फ़ॉलोअर",
    followingCount: "फ़ॉलोइंग",
    editProfile: "प्रोफ़ाइल बदलें",
    message: "मैसेज",
    joined: "जुड़े",
    pollVotes: "वोट",
    pollEnded: "अंतिम नतीजे",
    sensitiveMedia: "कंटेंट चेतावनी",
    sensitiveBody: "इस मीडिया में संवेदनशील सामग्री हो सकती है।",
    show: "दिखाएँ",
    emptyTimelineTitle: "आपकी टाइमलाइन में स्वागत है",
    emptyTimelineBody:
      "जिन लोगों को आप फ़ॉलो करते हैं उनकी पोस्ट यहाँ दिखेंगी।",
    emptyNotificationsTitle: "अभी यहाँ कुछ नहीं है",
    emptyNotificationsBody: "लाइक, रीपोस्ट और दूसरी गतिविधियाँ यहाँ दिखेंगी।",
    emptyMessagesTitle: "आपके इनबॉक्स में स्वागत है",
    emptyMessagesBody: "निजी बातचीत शुरू करें और पोस्ट शेयर करें।",
    newMessage: "नया मैसेज",
    send: "भेजें",
    typing: "लिख रहे हैं…",
    peopleTyping: "लोग लिख रहे हैं…",
    sending: "भेजा जा रहा है…",
    sent: "भेज दिया",
    delivered: "डिलीवर हुआ",
    read: "देखा गया",
    replyingToMessage: "इसका जवाब",
    failed: "नहीं भेजा गया। फिर कोशिश करें।",
    pinned: "पिन किया हुआ",
    unread: "अनरीड",
    reposted: "ने रीपोस्ट किया",
    repliedTo: "जवाब दे रहे हैं",
    notificationLike: "ने आपकी पोस्ट लाइक की",
    notificationRepost: "ने आपकी पोस्ट रीपोस्ट की",
    notificationReply: "ने आपकी पोस्ट का जवाब दिया",
    notificationFollow: "ने आपको फ़ॉलो किया",
    notificationMention: "ने आपको मेंशन किया",
    notificationVerified: "ने वेरिफ़ाइड अपडेट शेयर किया",
  },
} as const;

export type XCopyKey = keyof (typeof copy)["en-US"];

export function getXDirection(locale: XLocale): XDirection {
  return locale === "ar-SA" ? "rtl" : "ltr";
}

export function translateX(locale: XLocale, key: XCopyKey): string {
  return copy[locale][key];
}

export function formatXCount(value: number, locale: XLocale): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

export function formatXTimestamp(
  value: number,
  nowMs: number,
  locale: XLocale,
): string {
  const elapsed = Math.max(0, Math.floor((nowMs - value) / 1_000));
  const units =
    locale === "ar-SA"
      ? { second: "ث", minute: "د", hour: "س" }
      : locale === "hi-IN"
        ? { second: "से", minute: "मि", hour: "घं" }
        : { second: "s", minute: "m", hour: "h" };
  if (elapsed < 60)
    return new Intl.NumberFormat(locale).format(elapsed) + units.second;
  if (elapsed < 3_600)
    return (
      new Intl.NumberFormat(locale).format(Math.floor(elapsed / 60)) +
      units.minute
    );
  if (elapsed < 86_400)
    return (
      new Intl.NumberFormat(locale).format(Math.floor(elapsed / 3_600)) +
      units.hour
    );
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatXLongTimestamp(value: number, locale: XLocale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
