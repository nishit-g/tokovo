import { defineDeviceKit } from "../../define.js";

export const creatorPhonesV1 = defineDeviceKit({
  id: "creator-phones-v1",
  name: "Creator Phones V1",
  version: "1.0.0",
  devices: {
    main_phone: {
      profile: "iphone_16_pro",
      installedApps: ["app_whatsapp", "app_x", "app_imessage"],
      homeScreen: "grid_default",
      styleRef: "night-neon",
      wallpaper: "/wallpapers/midnight-grid.png",
      screenRecording: false,
    },
    secondary_phone: {
      profile: "iphone_15",
      installedApps: ["app_whatsapp", "app_x"],
      homeScreen: "minimal",
      styleRef: "cozy-chat",
      wallpaper: "/wallpapers/warm-grain.png",
      screenRecording: false,
    },
  },
});
