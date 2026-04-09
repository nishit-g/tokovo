import { defineStyleKit } from "../../define.js";

export const nightNeonStyleKit = defineStyleKit({
  id: "night-neon",
  name: "Night Neon",
  version: "1.0.0",
  background: "/backgrounds/neon-canvas.jpg",
  deviceDefaults: {
    main_phone: {
      profile: "iphone_16_pro",
      wallpaper: "/wallpapers/midnight-grid.png",
      homeScreen: "grid_default",
      screenRecording: false,
    },
  },
  appThemes: {
    app_x: "dark",
    app_whatsapp: "dark",
  },
  appVisualModes: {
    app_x: "cinematic",
    app_whatsapp: "chat-focus",
  },
  appStyles: {
    app_x: {
      contrast: "high",
      tweetDensity: "comfortable",
    },
    app_whatsapp: {
      bubbleRoundness: "classic",
      timestampWeight: "regular",
    },
  },
});
