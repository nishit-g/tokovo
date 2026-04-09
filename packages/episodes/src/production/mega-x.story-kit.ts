import type { StoryKitStudioConfig } from "../story-kit/index.js";

export const megaXStoryKitConfig = {
  id: "mega-x",
  title: "Mega X",
  packs: {
    personas: "startup-chaos",
    assets: "social-assets-v1",
    styles: "night-neon",
    devices: "creator-phones-v1",
  },
  cast: {
    me: { persona: "builder", device: "main_phone" },
    founder: { persona: "founder", device: "main_phone" },
    meme: { persona: "meme_account", device: "main_phone" },
    vc: { persona: "investor", device: "main_phone" },
  },
  devices: {
    main_phone: {
      app: "app_x",
      styleOverrides: {
        appThemes: {
          app_x: "dark",
        },
      },
    },
  },
  notes:
    "Canonical X story-kit example. Studio owns packs/cast/device setup; timeline stays in mega-x.episode.ts.",
} satisfies StoryKitStudioConfig;
