import type { StoryKitStudioConfig } from "../story-kit/index.js";

export const megaV2EpisodeWhatsAppStoryKitConfig = {
  id: "mega-v2-episode-whatsapp",
  title: "Mega V2 WhatsApp: Rishta Damage Control",
  packs: {
    personas: "startup-chaos",
    assets: "social-assets-v1",
    styles: "cozy-chat",
    devices: "creator-phones-v1"
  },
  background: {
    type: "image",
    src: "/backgrounds/cozy-bedroom.png"
  },
  cast: {
    me: {
      persona: "builder",
      device: "main_phone"
    },
    naina: {
      persona: "investor",
      overrides: {
        name: "Naina",
        handle: "@naina",
        bio: "Precision planner with zero patience for chaos."
      },
      assetOverrides: {
        avatar: "avatars:neha"
      }
    },
    sid: {
      persona: "founder",
      overrides: {
        name: "Sid",
        handle: "@sid",
        bio: "High confidence, low impulse control."
      },
      assetOverrides: {
        avatar: "avatars:arjun"
      }
    },
    tara: {
      persona: "investor",
      overrides: {
        name: "Tara",
        handle: "@tara",
        bio: "Runs logistics better than startups run payroll."
      },
      assetOverrides: {
        avatar: "avatars:neha"
      }
    },
    monty: {
      persona: "meme_account",
      overrides: {
        name: "Monty",
        handle: "@monty",
        bio: "Weaponized confidence with no brakes."
      },
      assetOverrides: {
        avatar: "avatars:meme_daily"
      }
    },
    aashi: {
      persona: "builder",
      overrides: {
        name: "Aashi",
        handle: "@aashi",
        bio: "Information broker and chaos correspondent."
      },
      assetOverrides: {
        avatar: "avatars:kabir"
      }
    },
    mom: {
      persona: "investor",
      overrides: {
        name: "Mom",
        handle: "@mom",
        bio: "Calm in crisis, savage in feedback."
      },
      assetOverrides: {
        avatar: "avatars:neha"
      }
    },
    bakery: {
      persona: "founder",
      overrides: {
        name: "SweetCrust Bakery",
        handle: "@sweetcrust",
        bio: "Custom cakes, immaculate logistics, dramatic receipts."
      },
      assetOverrides: {
        avatar: "avatars:arjun"
      }
    },
    hr: {
      persona: "meme_account",
      overrides: {
        name: "HR",
        handle: "@internhr",
        bio: "Corporate optimism in message form."
      },
      assetOverrides: {
        avatar: "avatars:meme_daily"
      }
    },
    rohit: {
      persona: "builder",
      overrides: {
        name: "Rohit",
        handle: "@rohit",
        bio: "Resident society updates dispatcher."
      },
      assetOverrides: {
        avatar: "avatars:kabir"
      }
    }
  },
  devices: {
    main_phone: {
      app: "app_whatsapp",
      profile: "iphone16",
      installedApps: [
        "app_whatsapp"
      ]
    }
  },
  notes: "Canonical WhatsApp production example. Studio owns packs/cast/device setup; showcase story remains code-first."
} satisfies StoryKitStudioConfig;
