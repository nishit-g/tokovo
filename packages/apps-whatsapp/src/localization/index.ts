export type WhatsAppLocale = "en-US" | "ar";
export type WhatsAppTextDirection = "ltr" | "rtl";

export type WhatsAppMessageKey =
  | "app.name"
  | "nav.updates"
  | "nav.calls"
  | "nav.communities"
  | "nav.chats"
  | "nav.settings"
  | "screen.contactInfo"
  | "screen.groupInfo"
  | "action.back"
  | "action.edit"
  | "action.search"
  | "action.video"
  | "action.reply"
  | "action.forward"
  | "action.copy"
  | "action.star"
  | "action.delete"
  | "action.info"
  | "action.dismiss"
  | "action.download"
  | "action.close"
  | "action.add"
  | "action.emoji"
  | "action.attachment"
  | "action.camera"
  | "action.newChat"
  | "action.voiceMessage"
  | "action.audio"
  | "action.send"
  | "action.explore"
  | "action.follow"
  | "action.following"
  | "filter.all"
  | "filter.unread"
  | "filter.favorites"
  | "filter.groups"
  | "filter.drafts"
  | "section.status"
  | "section.privacy"
  | "composer.placeholder"
  | "composer.replyingTo"
  | "chat.typing"
  | "chat.memberTyping"
  | "chat.twoMembersTyping"
  | "chat.manyMembersTyping"
  | "chat.members"
  | "chat.group"
  | "chat.contactInfo"
  | "chat.pinnedMessage"
  | "chat.noMessages"
  | "chat.archived"
  | "chat.you"
  | "chat.unknown"
  | "chat.groupInfoHint"
  | "chat.other"
  | "chat.others"
  | "message.forwarded"
  | "message.edited"
  | "message.photo"
  | "message.video"
  | "message.voice"
  | "message.document"
  | "message.location"
  | "message.contact"
  | "message.gif"
  | "message.sticker"
  | "message.poll"
  | "message.media"
  | "message.systemUpdate"
  | "message.screenshotAlert"
  | "message.videoCall"
  | "message.voiceCall"
  | "message.missedVideoCall"
  | "message.missedVoiceCall"
  | "message.documentNamed"
  | "message.untitledDocument"
  | "message.pages"
  | "message.original"
  | "message.unnamedContact"
  | "message.untitledPoll"
  | "message.callBack"
  | "message.callEnded"
  | "message.vote"
  | "message.votes"
  | "message.unavailable"
  | "message.deleted"
  | "message.deletedByYou"
  | "message.sentBy"
  | "message.receivedFrom"
  | "media.photoUnavailable"
  | "media.videoUnavailable"
  | "media.gifUnavailable"
  | "media.stickerUnavailable"
  | "media.remote"
  | "media.downloading"
  | "media.ready"
  | "media.failed"
  | "media.viewer"
  | "media.progress"
  | "media.playing"
  | "media.paused"
  | "status.today"
  | "status.yesterday"
  | "status.viewer"
  | "status.reply"
  | "status.viewedUpdates"
  | "status.mutedUpdates"
  | "updates.myStatus"
  | "updates.channels"
  | "updates.newCount"
  | "updates.emptyTitle"
  | "updates.emptyBody"
  | "calls.createLink"
  | "calls.createLinkBody"
  | "calls.favorites"
  | "calls.recent"
  | "calls.emptyTitle"
  | "calls.emptyBody"
  | "calls.voice"
  | "calls.video"
  | "calls.incoming"
  | "calls.outgoing"
  | "calls.missed"
  | "calls.durationSeconds"
  | "calls.durationMinutes"
  | "calls.durationMinutesSeconds"
  | "communities.new"
  | "communities.newBody"
  | "communities.yours"
  | "communities.announcements"
  | "communities.viewAllGroups"
  | "communities.emptyTitle"
  | "communities.emptyBody"
  | "settings.search"
  | "settings.defaultAbout"
  | "settings.accountSection"
  | "settings.account"
  | "settings.accountBody"
  | "settings.privacy"
  | "settings.privacyDefault"
  | "settings.privacySummary"
  | "settings.receiptsOn"
  | "settings.receiptsOff"
  | "settings.avatar"
  | "settings.avatarBody"
  | "settings.preferencesSection"
  | "settings.chats"
  | "settings.chatsSummary"
  | "settings.systemTheme"
  | "settings.lightTheme"
  | "settings.darkTheme"
  | "settings.contacts"
  | "settings.notConfigured"
  | "settings.notifications"
  | "settings.defaultTone"
  | "settings.mutedCount"
  | "settings.storage"
  | "settings.storageNotMeasured"
  | "settings.wifiDownloads"
  | "settings.linkedDevices"
  | "settings.help"
  | "settings.tellFriend"
  | "profile.contact"
  | "profile.group"
  | "profile.verifiedBusiness"
  | "profile.mediaLinksDocs"
  | "profile.sharedMedia"
  | "profile.nothingShared"
  | "profile.starredMessages"
  | "profile.notifications"
  | "profile.disappearingMessages"
  | "profile.encryption"
  | "profile.encryptionBody"
  | "profile.groupsInCommon"
  | "profile.block"
  | "profile.report"
  | "profile.on"
  | "profile.off"
  | "profile.muted"
  | "group.summary"
  | "group.members"
  | "group.admin"
  | "group.addMembers"
  | "group.inviteViaLink"
  | "group.exit"
  | "empty.noUnreadTitle"
  | "empty.noUnreadBody"
  | "empty.noFavoritesTitle"
  | "empty.noFavoritesBody"
  | "empty.noGroupsTitle"
  | "empty.noGroupsBody"
  | "empty.noDraftsTitle"
  | "empty.noDraftsBody"
  | "empty.noChatsTitle"
  | "empty.noChatsBody"
  | "system.screenshotTaken"
  | "system.chatUpdated"
  | "system.unreadMessages"
  | "system.encryptionTitle"
  | "system.encryptionBody"
  | "system.safetyTitle"
  | "system.safetyBody"
  | "system.businessTitle"
  | "system.businessBody"
  | "system.disappearingOn"
  | "system.disappearingAfter"
  | "system.learnMore"
  | "a11y.unreadMessages"
  | "a11y.missedCalls"
  | "a11y.messageActions"
  | "a11y.reactions"
  | "a11y.delivery.sending"
  | "a11y.delivery.sent"
  | "a11y.delivery.delivered"
  | "a11y.delivery.read"
  | "a11y.delivery.failed";

type Catalog = Record<WhatsAppMessageKey, string>;

const ENGLISH: Catalog = {
  "app.name": "WhatsApp",
  "nav.updates": "Updates",
  "nav.calls": "Calls",
  "nav.communities": "Communities",
  "nav.chats": "Chats",
  "nav.settings": "Settings",
  "screen.contactInfo": "Contact info",
  "screen.groupInfo": "Group info",
  "action.back": "Back",
  "action.edit": "Edit",
  "action.search": "Search",
  "action.video": "Video",
  "action.reply": "Reply",
  "action.forward": "Forward",
  "action.copy": "Copy",
  "action.star": "Star",
  "action.delete": "Delete",
  "action.info": "Info",
  "action.dismiss": "Dismiss",
  "action.download": "Download",
  "action.close": "Close",
  "action.add": "Add",
  "action.emoji": "Emoji",
  "action.attachment": "Attach",
  "action.camera": "Camera",
  "action.newChat": "New chat",
  "action.voiceMessage": "Voice message",
  "action.audio": "Audio",
  "action.send": "Send",
  "action.explore": "Explore",
  "action.follow": "Follow",
  "action.following": "Following",
  "filter.all": "All",
  "filter.unread": "Unread",
  "filter.favorites": "Favorites",
  "filter.groups": "Groups",
  "filter.drafts": "Drafts",
  "section.status": "Status",
  "section.privacy": "Privacy",
  "composer.placeholder": "Message",
  "composer.replyingTo": "Replying to {name}",
  "chat.typing": "typing…",
  "chat.memberTyping": "{name} typing…",
  "chat.twoMembersTyping": "{first} and {second} typing…",
  "chat.manyMembersTyping": "{first} and {count} others typing…",
  "chat.members": "{count} members",
  "chat.group": "Group chat",
  "chat.contactInfo": "Contact info",
  "chat.pinnedMessage": "Pinned message",
  "chat.noMessages": "No messages yet",
  "chat.archived": "Archived",
  "chat.you": "You",
  "chat.unknown": "Unknown",
  "chat.groupInfoHint": "tap here for group info",
  "chat.other": "other",
  "chat.others": "others",
  "message.forwarded": "Forwarded",
  "message.edited": "edited",
  "message.photo": "Photo",
  "message.video": "Video",
  "message.voice": "Voice message",
  "message.document": "Document",
  "message.location": "Location",
  "message.contact": "Contact card",
  "message.gif": "GIF",
  "message.sticker": "Sticker",
  "message.poll": "Poll",
  "message.media": "Media",
  "message.systemUpdate": "System update",
  "message.screenshotAlert": "Screenshot alert",
  "message.videoCall": "Video call",
  "message.voiceCall": "Voice call",
  "message.missedVideoCall": "Missed video call",
  "message.missedVoiceCall": "Missed voice call",
  "message.documentNamed": "Document • {name}",
  "message.untitledDocument": "Untitled document",
  "message.pages": "{count} pages",
  "message.original": "Original message",
  "message.unnamedContact": "Unnamed contact",
  "message.untitledPoll": "Untitled poll",
  "message.callBack": "Tap to call back",
  "message.callEnded": "Call ended",
  "message.vote": "{count} vote",
  "message.votes": "{count} votes",
  "message.unavailable": "Message unavailable",
  "message.deleted": "This message was deleted",
  "message.deletedByYou": "You deleted this message",
  "message.sentBy": "Message sent by {name}: {content}",
  "message.receivedFrom": "Message received from {name}: {content}",
  "media.photoUnavailable": "Photo unavailable",
  "media.videoUnavailable": "Video unavailable",
  "media.gifUnavailable": "GIF unavailable",
  "media.stickerUnavailable": "Sticker unavailable",
  "media.remote": "Media not downloaded",
  "media.downloading": "Downloading media",
  "media.ready": "Media ready",
  "media.failed": "Media download failed",
  "media.viewer": "Media viewer",
  "media.progress": "{progress}% downloaded",
  "media.playing": "Playing",
  "media.paused": "Paused",
  "status.today": "Today",
  "status.yesterday": "Yesterday",
  "status.viewer": "Status viewer",
  "status.reply": "Reply",
  "status.viewedUpdates": "Viewed updates",
  "status.mutedUpdates": "Muted updates",
  "updates.myStatus": "My status",
  "updates.channels": "Channels",
  "updates.newCount": "{count} new",
  "updates.emptyTitle": "Your updates, without the noise",
  "updates.emptyBody": "Follow channels to see their latest posts here. Channel updates stay separate from personal chats.",
  "calls.createLink": "Create call link",
  "calls.createLinkBody": "Plan a call that anyone can join",
  "calls.favorites": "Favorites",
  "calls.recent": "Recent",
  "calls.emptyTitle": "Your calls live here",
  "calls.emptyBody": "Start a voice or video call, or share a call link for later.",
  "calls.voice": "voice",
  "calls.video": "video",
  "calls.incoming": "Incoming {mode} call",
  "calls.outgoing": "Outgoing {mode} call",
  "calls.missed": "Missed {mode} call",
  "calls.durationSeconds": "{count} sec",
  "calls.durationMinutes": "{count} min",
  "calls.durationMinutesSeconds": "{minutes}m {seconds}s",
  "communities.new": "New community",
  "communities.newBody": "Keep related groups organized in one place",
  "communities.yours": "Your communities",
  "communities.announcements": "Announcements",
  "communities.viewAllGroups": "View all groups",
  "communities.emptyTitle": "Bring your groups together",
  "communities.emptyBody": "Communities organize announcements and related group chats without mixing them into one thread.",
  "settings.search": "Search settings",
  "settings.defaultAbout": "Hey there! I am using WhatsApp.",
  "settings.accountSection": "Account",
  "settings.account": "Account",
  "settings.accountBody": "Security notifications, change number",
  "settings.privacy": "Privacy",
  "settings.privacyDefault": "Last seen, profile photo, blocked contacts",
  "settings.privacySummary": "Last seen: {lastSeen} · {receipts}",
  "settings.receiptsOn": "receipts on",
  "settings.receiptsOff": "receipts off",
  "settings.avatar": "Avatar",
  "settings.avatarBody": "Create and manage your avatar",
  "settings.preferencesSection": "App preferences",
  "settings.chats": "Chats",
  "settings.chatsSummary": "Theme: {theme} · Backup: {backup}",
  "settings.systemTheme": "system",
  "settings.lightTheme": "light",
  "settings.darkTheme": "dark",
  "settings.contacts": "contacts",
  "settings.notConfigured": "Not configured",
  "settings.notifications": "Notifications",
  "settings.defaultTone": "Default tone",
  "settings.mutedCount": "{count} muted",
  "settings.storage": "Storage and data",
  "settings.storageNotMeasured": "Storage not measured",
  "settings.wifiDownloads": "Wi-Fi downloads",
  "settings.linkedDevices": "Linked devices",
  "settings.help": "Help",
  "settings.tellFriend": "Tell a friend",
  "profile.contact": "Contact",
  "profile.group": "Group",
  "profile.verifiedBusiness": "Verified business",
  "profile.mediaLinksDocs": "Media, links, and docs",
  "profile.sharedMedia": "Shared media",
  "profile.nothingShared": "Nothing shared yet",
  "profile.starredMessages": "Starred messages",
  "profile.notifications": "Notifications",
  "profile.disappearingMessages": "Disappearing messages",
  "profile.encryption": "Encryption",
  "profile.encryptionBody": "Messages and calls are end-to-end encrypted",
  "profile.groupsInCommon": "Groups in common",
  "profile.block": "Block {name}",
  "profile.report": "Report {name}",
  "profile.on": "On",
  "profile.off": "Off",
  "profile.muted": "Muted",
  "group.summary": "Group · {count} members",
  "group.members": "{count} members",
  "group.admin": "Admin",
  "group.addMembers": "Add members",
  "group.inviteViaLink": "Invite via link",
  "group.exit": "Exit group",
  "empty.noUnreadTitle": "No unread chats",
  "empty.noUnreadBody": "You're all caught up!",
  "empty.noFavoritesTitle": "No favorite chats",
  "empty.noFavoritesBody": "Pin your important chats to see them here",
  "empty.noGroupsTitle": "No groups",
  "empty.noGroupsBody": "Create or join a group to get started",
  "empty.noDraftsTitle": "No drafts",
  "empty.noDraftsBody": "Unsent messages will appear here",
  "empty.noChatsTitle": "No chats yet",
  "empty.noChatsBody": "Start a conversation!",
  "system.screenshotTaken": "Screenshot taken",
  "system.chatUpdated": "Chat updated",
  "system.unreadMessages": "Unread messages",
  "system.encryptionTitle": "End-to-end encrypted",
  "system.encryptionBody": "Messages and calls stay between the people in this chat.",
  "system.safetyTitle": "Security code changed",
  "system.safetyBody": "Verify this contact's security code if you want extra assurance.",
  "system.businessTitle": "Business account",
  "system.businessBody": "This business may use a secure service to manage this chat.",
  "system.disappearingOn": "Disappearing messages are turned on.",
  "system.disappearingAfter": "Messages disappear after {duration}.",
  "system.learnMore": "Tap to learn more.",
  "a11y.unreadMessages": "{count} unread messages",
  "a11y.missedCalls": "{count} missed calls",
  "a11y.messageActions": "Message actions",
  "a11y.reactions": "Reactions: {reactions}",
  "a11y.delivery.sending": "Sending",
  "a11y.delivery.sent": "Sent",
  "a11y.delivery.delivered": "Delivered",
  "a11y.delivery.read": "Read",
  "a11y.delivery.failed": "Not sent",
};

const ARABIC: Catalog = {
  "app.name": "واتساب",
  "nav.updates": "المستجدات",
  "nav.calls": "المكالمات",
  "nav.communities": "المجتمعات",
  "nav.chats": "الدردشات",
  "nav.settings": "الإعدادات",
  "screen.contactInfo": "معلومات جهة الاتصال",
  "screen.groupInfo": "معلومات المجموعة",
  "action.back": "رجوع",
  "action.edit": "تعديل",
  "action.search": "بحث",
  "action.video": "فيديو",
  "action.reply": "رد",
  "action.forward": "إعادة توجيه",
  "action.copy": "نسخ",
  "action.star": "تمييز بنجمة",
  "action.delete": "حذف",
  "action.info": "معلومات",
  "action.dismiss": "إغلاق",
  "action.download": "تنزيل",
  "action.close": "إغلاق",
  "action.add": "إضافة",
  "action.emoji": "رموز تعبيرية",
  "action.attachment": "إرفاق",
  "action.camera": "الكاميرا",
  "action.newChat": "دردشة جديدة",
  "action.voiceMessage": "رسالة صوتية",
  "action.audio": "صوت",
  "action.send": "إرسال",
  "action.explore": "استكشاف",
  "action.follow": "متابعة",
  "action.following": "تتابعه",
  "filter.all": "الكل",
  "filter.unread": "غير المقروءة",
  "filter.favorites": "المفضلة",
  "filter.groups": "المجموعات",
  "filter.drafts": "المسودات",
  "section.status": "الحالة",
  "section.privacy": "الخصوصية",
  "composer.placeholder": "رسالة",
  "composer.replyingTo": "الرد على {name}",
  "chat.typing": "يكتب الآن…",
  "chat.memberTyping": "{name} يكتب الآن…",
  "chat.twoMembersTyping": "{first} و{second} يكتبان الآن…",
  "chat.manyMembersTyping": "{first} و{count} آخرون يكتبون الآن…",
  "chat.members": "{count} أعضاء",
  "chat.group": "دردشة جماعية",
  "chat.contactInfo": "معلومات جهة الاتصال",
  "chat.pinnedMessage": "رسالة مثبتة",
  "chat.noMessages": "لا توجد رسائل بعد",
  "chat.archived": "المؤرشفة",
  "chat.you": "أنت",
  "chat.unknown": "غير معروف",
  "chat.groupInfoHint": "اضغط هنا لمعلومات المجموعة",
  "chat.other": "آخر",
  "chat.others": "آخرين",
  "message.forwarded": "تمت إعادة التوجيه",
  "message.edited": "تم التعديل",
  "message.photo": "صورة",
  "message.video": "فيديو",
  "message.voice": "رسالة صوتية",
  "message.document": "مستند",
  "message.location": "الموقع",
  "message.contact": "بطاقة جهة اتصال",
  "message.gif": "صورة متحركة",
  "message.sticker": "ملصق",
  "message.poll": "استطلاع",
  "message.media": "وسائط",
  "message.systemUpdate": "تحديث للنظام",
  "message.screenshotAlert": "تنبيه لقطة شاشة",
  "message.videoCall": "مكالمة فيديو",
  "message.voiceCall": "مكالمة صوتية",
  "message.missedVideoCall": "مكالمة فيديو فائتة",
  "message.missedVoiceCall": "مكالمة صوتية فائتة",
  "message.documentNamed": "مستند • {name}",
  "message.untitledDocument": "مستند بلا عنوان",
  "message.pages": "{count} صفحات",
  "message.original": "الرسالة الأصلية",
  "message.unnamedContact": "جهة اتصال بلا اسم",
  "message.untitledPoll": "استطلاع بلا عنوان",
  "message.callBack": "اضغط لمعاودة الاتصال",
  "message.callEnded": "انتهت المكالمة",
  "message.vote": "صوت واحد",
  "message.votes": "{count} أصوات",
  "message.unavailable": "الرسالة غير متاحة",
  "message.deleted": "تم حذف هذه الرسالة",
  "message.deletedByYou": "لقد حذفت هذه الرسالة",
  "message.sentBy": "رسالة أرسلها {name}: {content}",
  "message.receivedFrom": "رسالة من {name}: {content}",
  "media.photoUnavailable": "الصورة غير متاحة",
  "media.videoUnavailable": "الفيديو غير متاح",
  "media.gifUnavailable": "الصورة المتحركة غير متاحة",
  "media.stickerUnavailable": "الملصق غير متاح",
  "media.remote": "لم يتم تنزيل الوسائط",
  "media.downloading": "جارٍ تنزيل الوسائط",
  "media.ready": "الوسائط جاهزة",
  "media.failed": "فشل تنزيل الوسائط",
  "media.viewer": "عارض الوسائط",
  "media.progress": "تم تنزيل {progress}٪",
  "media.playing": "قيد التشغيل",
  "media.paused": "متوقف مؤقتًا",
  "status.today": "اليوم",
  "status.yesterday": "أمس",
  "status.viewer": "عارض الحالة",
  "status.reply": "رد",
  "status.viewedUpdates": "الحالات التي تمت مشاهدتها",
  "status.mutedUpdates": "الحالات المكتومة",
  "updates.myStatus": "حالتي",
  "updates.channels": "القنوات",
  "updates.newCount": "{count} جديد",
  "updates.emptyTitle": "مستجداتك بلا ضوضاء",
  "updates.emptyBody": "تابع القنوات لرؤية أحدث منشوراتها هنا. تبقى تحديثات القنوات منفصلة عن الدردشات الشخصية.",
  "calls.createLink": "إنشاء رابط مكالمة",
  "calls.createLinkBody": "خطط لمكالمة يمكن لأي شخص الانضمام إليها",
  "calls.favorites": "المفضلة",
  "calls.recent": "الأخيرة",
  "calls.emptyTitle": "ستظهر مكالماتك هنا",
  "calls.emptyBody": "ابدأ مكالمة صوتية أو فيديو، أو شارك رابط مكالمة لوقت لاحق.",
  "calls.voice": "صوتية",
  "calls.video": "فيديو",
  "calls.incoming": "مكالمة {mode} واردة",
  "calls.outgoing": "مكالمة {mode} صادرة",
  "calls.missed": "مكالمة {mode} فائتة",
  "calls.durationSeconds": "{count} ث",
  "calls.durationMinutes": "{count} د",
  "calls.durationMinutesSeconds": "{minutes} د {seconds} ث",
  "communities.new": "مجتمع جديد",
  "communities.newBody": "نظّم المجموعات المرتبطة في مكان واحد",
  "communities.yours": "مجتمعاتك",
  "communities.announcements": "الإعلانات",
  "communities.viewAllGroups": "عرض كل المجموعات",
  "communities.emptyTitle": "اجمع مجموعاتك معًا",
  "communities.emptyBody": "تنظم المجتمعات الإعلانات والدردشات الجماعية المرتبطة دون دمجها في محادثة واحدة.",
  "settings.search": "البحث في الإعدادات",
  "settings.defaultAbout": "مرحبًا! أنا أستخدم واتساب.",
  "settings.accountSection": "الحساب",
  "settings.account": "الحساب",
  "settings.accountBody": "إشعارات الأمان وتغيير الرقم",
  "settings.privacy": "الخصوصية",
  "settings.privacyDefault": "آخر ظهور وصورة الملف وجهات الاتصال المحظورة",
  "settings.privacySummary": "آخر ظهور: {lastSeen} · {receipts}",
  "settings.receiptsOn": "إيصالات القراءة مفعلة",
  "settings.receiptsOff": "إيصالات القراءة متوقفة",
  "settings.avatar": "الصورة الرمزية",
  "settings.avatarBody": "أنشئ صورتك الرمزية وأدرها",
  "settings.preferencesSection": "تفضيلات التطبيق",
  "settings.chats": "الدردشات",
  "settings.chatsSummary": "السمة: {theme} · النسخ الاحتياطي: {backup}",
  "settings.systemTheme": "النظام",
  "settings.lightTheme": "فاتحة",
  "settings.darkTheme": "داكنة",
  "settings.contacts": "جهات الاتصال",
  "settings.notConfigured": "غير مهيأ",
  "settings.notifications": "الإشعارات",
  "settings.defaultTone": "النغمة الافتراضية",
  "settings.mutedCount": "{count} مكتومة",
  "settings.storage": "التخزين والبيانات",
  "settings.storageNotMeasured": "لم يُقَس التخزين",
  "settings.wifiDownloads": "التنزيل عبر Wi-Fi",
  "settings.linkedDevices": "الأجهزة المرتبطة",
  "settings.help": "المساعدة",
  "settings.tellFriend": "أخبر صديقًا",
  "profile.contact": "جهة اتصال",
  "profile.group": "مجموعة",
  "profile.verifiedBusiness": "نشاط تجاري موثّق",
  "profile.mediaLinksDocs": "الوسائط والروابط والمستندات",
  "profile.sharedMedia": "وسائط مشتركة",
  "profile.nothingShared": "لا توجد عناصر مشتركة بعد",
  "profile.starredMessages": "الرسائل المميزة بنجمة",
  "profile.notifications": "الإشعارات",
  "profile.disappearingMessages": "الرسائل ذاتية الاختفاء",
  "profile.encryption": "التشفير",
  "profile.encryptionBody": "الرسائل والمكالمات مشفرة تمامًا بين الطرفين",
  "profile.groupsInCommon": "المجموعات المشتركة",
  "profile.block": "حظر {name}",
  "profile.report": "الإبلاغ عن {name}",
  "profile.on": "مفعّل",
  "profile.off": "متوقف",
  "profile.muted": "مكتومة",
  "group.summary": "مجموعة · {count} أعضاء",
  "group.members": "{count} أعضاء",
  "group.admin": "مشرف",
  "group.addMembers": "إضافة أعضاء",
  "group.inviteViaLink": "دعوة عبر رابط",
  "group.exit": "مغادرة المجموعة",
  "empty.noUnreadTitle": "لا توجد دردشات غير مقروءة",
  "empty.noUnreadBody": "اطلعت على كل شيء!",
  "empty.noFavoritesTitle": "لا توجد دردشات مفضلة",
  "empty.noFavoritesBody": "ثبّت دردشاتك المهمة لتظهر هنا",
  "empty.noGroupsTitle": "لا توجد مجموعات",
  "empty.noGroupsBody": "أنشئ مجموعة أو انضم إليها للبدء",
  "empty.noDraftsTitle": "لا توجد مسودات",
  "empty.noDraftsBody": "ستظهر الرسائل غير المرسلة هنا",
  "empty.noChatsTitle": "لا توجد دردشات بعد",
  "empty.noChatsBody": "ابدأ محادثة!",
  "system.screenshotTaken": "تم التقاط لقطة شاشة",
  "system.chatUpdated": "تم تحديث الدردشة",
  "system.unreadMessages": "رسائل غير مقروءة",
  "system.encryptionTitle": "مشفرة تمامًا بين الطرفين",
  "system.encryptionBody": "تبقى الرسائل والمكالمات بين الأشخاص في هذه الدردشة.",
  "system.safetyTitle": "تم تغيير رمز الأمان",
  "system.safetyBody": "تحقق من رمز أمان جهة الاتصال لمزيد من الاطمئنان.",
  "system.businessTitle": "حساب أعمال",
  "system.businessBody": "قد تستخدم هذه الشركة خدمة آمنة لإدارة هذه الدردشة.",
  "system.disappearingOn": "تم تشغيل الرسائل ذاتية الاختفاء.",
  "system.disappearingAfter": "تختفي الرسائل بعد {duration}.",
  "system.learnMore": "اضغط لمعرفة المزيد.",
  "a11y.unreadMessages": "{count} رسائل غير مقروءة",
  "a11y.missedCalls": "{count} مكالمات فائتة",
  "a11y.messageActions": "إجراءات الرسالة",
  "a11y.reactions": "التفاعلات: {reactions}",
  "a11y.delivery.sending": "جارٍ الإرسال",
  "a11y.delivery.sent": "تم الإرسال",
  "a11y.delivery.delivered": "تم التسليم",
  "a11y.delivery.read": "تمت القراءة",
  "a11y.delivery.failed": "لم يتم الإرسال",
};

const CATALOGS: Record<WhatsAppLocale, Catalog> = {
  "en-US": ENGLISH,
  ar: ARABIC,
};

export function getWhatsAppTextDirection(
  locale: WhatsAppLocale,
): WhatsAppTextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function translateWhatsApp(
  locale: WhatsAppLocale,
  key: WhatsAppMessageKey,
  parameters: Record<string, string | number> = {},
): string {
  const template = CATALOGS[locale][key];
  return template.replace(/\{([a-zA-Z]+)\}/g, (_match, name: string) => {
    const value = parameters[name];
    if (typeof value === "number") return formatWhatsAppNumber(locale, value);
    return value ?? `{${name}}`;
  });
}

export function formatWhatsAppNumber(
  locale: WhatsAppLocale,
  value: number,
): string {
  const ascii = String(Math.max(0, Math.floor(value)));
  return formatWhatsAppDigits(locale, ascii);
}

export function formatWhatsAppDigits(
  locale: WhatsAppLocale,
  value: string,
): string {
  if (locale !== "ar") return value;
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  return value.replace(/[0-9]/g, (digit) => arabicDigits[Number(digit)] ?? digit);
}

export function formatWhatsAppFileSize(
  locale: WhatsAppLocale,
  value: string | undefined,
): string | undefined {
  if (!value || locale !== "ar") return value;
  const match = value.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*(B|KB|MB|GB|TB)$/i);
  if (!match) return value;

  const amount = formatWhatsAppDigits(locale, match[1]).replace(".", "٫");
  const units: Record<string, string> = {
    B: "بايت",
    KB: "ك.ب",
    MB: "م.ب",
    GB: "ج.ب",
    TB: "ت.ب",
  };
  return `${amount} ${units[match[2].toUpperCase()] ?? match[2]}`;
}
