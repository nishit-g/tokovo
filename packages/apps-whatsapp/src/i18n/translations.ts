export type Locale =
  | "en"
  | "es"
  | "pt"
  | "fr"
  | "de"
  | "it"
  | "ar"
  | "hi"
  | "zh"
  | "ja"
  | "ko"
  | "ru";

export interface WhatsAppStrings {
  common: {
    you: string;
    today: string;
    yesterday: string;
    online: string;
    offline: string;
    lastSeen: string;
    typing: string;
    recording: string;
  };
  chat: {
    messageDeleted: string;
    messageEdited: string;
    forwarded: string;
    photo: string;
    video: string;
    voice: string;
    document: string;
    contact: string;
    location: string;
    sticker: string;
    gif: string;
  };
  time: {
    am: string;
    pm: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
  };
  status: {
    sending: string;
    sent: string;
    delivered: string;
    read: string;
    failed: string;
  };
  actions: {
    reply: string;
    forward: string;
    copy: string;
    delete: string;
    edit: string;
    react: string;
  };
  groups: {
    memberAdded: string;
    memberRemoved: string;
    memberLeft: string;
    adminChanged: string;
    groupCreated: string;
    descriptionChanged: string;
  };
  calls: {
    missedCall: string;
    voiceCall: string;
    videoCall: string;
    callEnded: string;
    callDeclined: string;
  };
}

const en: WhatsAppStrings = {
  common: {
    you: "You",
    today: "Today",
    yesterday: "Yesterday",
    online: "online",
    offline: "offline",
    lastSeen: "last seen",
    typing: "typing...",
    recording: "recording...",
  },
  chat: {
    messageDeleted: "This message was deleted",
    messageEdited: "Edited",
    forwarded: "Forwarded",
    photo: "Photo",
    video: "Video",
    voice: "Voice message",
    document: "Document",
    contact: "Contact",
    location: "Location",
    sticker: "Sticker",
    gif: "GIF",
  },
  time: {
    am: "AM",
    pm: "PM",
    justNow: "just now",
    minutesAgo: "min ago",
    hoursAgo: "hours ago",
  },
  status: {
    sending: "Sending...",
    sent: "Sent",
    delivered: "Delivered",
    read: "Read",
    failed: "Failed",
  },
  actions: {
    reply: "Reply",
    forward: "Forward",
    copy: "Copy",
    delete: "Delete",
    edit: "Edit",
    react: "React",
  },
  groups: {
    memberAdded: "{actor} added {member}",
    memberRemoved: "{actor} removed {member}",
    memberLeft: "{member} left",
    adminChanged: "{actor} made {member} an admin",
    groupCreated: "{actor} created this group",
    descriptionChanged: "{actor} changed the group description",
  },
  calls: {
    missedCall: "Missed call",
    voiceCall: "Voice call",
    videoCall: "Video call",
    callEnded: "Call ended",
    callDeclined: "Call declined",
  },
};

const es: WhatsAppStrings = {
  common: {
    you: "Tú",
    today: "Hoy",
    yesterday: "Ayer",
    online: "en línea",
    offline: "desconectado",
    lastSeen: "últ. vez",
    typing: "escribiendo...",
    recording: "grabando...",
  },
  chat: {
    messageDeleted: "Este mensaje fue eliminado",
    messageEdited: "Editado",
    forwarded: "Reenviado",
    photo: "Foto",
    video: "Video",
    voice: "Mensaje de voz",
    document: "Documento",
    contact: "Contacto",
    location: "Ubicación",
    sticker: "Sticker",
    gif: "GIF",
  },
  time: {
    am: "AM",
    pm: "PM",
    justNow: "ahora",
    minutesAgo: "min",
    hoursAgo: "horas",
  },
  status: {
    sending: "Enviando...",
    sent: "Enviado",
    delivered: "Entregado",
    read: "Leído",
    failed: "Error",
  },
  actions: {
    reply: "Responder",
    forward: "Reenviar",
    copy: "Copiar",
    delete: "Eliminar",
    edit: "Editar",
    react: "Reaccionar",
  },
  groups: {
    memberAdded: "{actor} agregó a {member}",
    memberRemoved: "{actor} eliminó a {member}",
    memberLeft: "{member} salió",
    adminChanged: "{actor} hizo administrador a {member}",
    groupCreated: "{actor} creó este grupo",
    descriptionChanged: "{actor} cambió la descripción del grupo",
  },
  calls: {
    missedCall: "Llamada perdida",
    voiceCall: "Llamada de voz",
    videoCall: "Videollamada",
    callEnded: "Llamada finalizada",
    callDeclined: "Llamada rechazada",
  },
};

const translations: Record<Locale, WhatsAppStrings> = {
  en,
  es,
  pt: en,
  fr: en,
  de: en,
  it: en,
  ar: en,
  hi: en,
  zh: en,
  ja: en,
  ko: en,
  ru: en,
};

export function getStrings(locale: Locale = "en"): WhatsAppStrings {
  return translations[locale] || translations.en;
}

export function interpolate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`);
}

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<WhatsAppStrings>;

export function t(
  key: string,
  locale: Locale = "en",
  values?: Record<string, string>,
): string {
  const strings = getStrings(locale);
  const parts = key.split(".");

  let result: unknown = strings;
  for (const part of parts) {
    if (typeof result === "object" && result !== null && part in result) {
      result = (result as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof result !== "string") {
    return key;
  }

  return values ? interpolate(result, values) : result;
}
