import type { StoryKitStudioConfig } from "../story-kit/index.js";

export const storyKitCrossoverShowcaseConfig = {
  id: "story-kit-crossover-showcase",
  title: "Story Kit Crossover Showcase",
  packs: {
    personas: "startup-chaos",
    assets: "social-assets-v1",
    styles: "night-neon",
    devices: "creator-phones-v1",
  },
  background: { type: "image", src: "/backgrounds/neon-canvas.jpg" },
  cast: {
    me: { persona: "builder", device: "main_phone" },
    founder: { persona: "founder", device: "main_phone" },
    meme: { persona: "meme_account", device: "main_phone" },
    vc: { persona: "investor", device: "secondary_phone" },
  },
  devices: {
    main_phone: {
      app: "app_whatsapp",
      styleOverrides: {
        appThemes: {
          app_whatsapp: "whatsapp-ghibli",
          app_x: "dark",
        },
      },
      profile: "iphone16",
      installedApps: ["app_whatsapp", "app_x"],
    },
  },
  notes:
    "Canonical crossover example. Studio edits shared cast and single-device setup; creative flow stays in the episode file.",
} satisfies StoryKitStudioConfig;
