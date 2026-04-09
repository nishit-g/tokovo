import { defineStyleKit } from "../../define.js";

export const cozyChatStyleKit = defineStyleKit({
  id: "cozy-chat",
  name: "Cozy Chat",
  version: "1.0.0",
  background: "/backgrounds/cozy-canvas.jpg",
  deviceDefaults: {
    main_phone: {
      wallpaper: "/wallpapers/warm-grain.png",
      homeScreen: "minimal",
      screenRecording: false,
    },
    secondary_phone: {
      wallpaper: "/wallpapers/warm-grain.png",
      homeScreen: "minimal",
      screenRecording: false,
    },
  },
  appThemes: {
    app_whatsapp: "light",
    app_imessage: "light",
  },
  appVisualModes: {
    app_whatsapp: "story",
    app_imessage: "clean",
  },
  appStyles: {
    app_whatsapp: {
      bubbleRoundness: "soft",
      messageSpacing: "airy",
    },
  },
});
