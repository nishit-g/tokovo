import { defineAssetPack } from "../../define.js";

export const socialAssetsV1 = defineAssetPack({
  id: "social-assets-v1",
  name: "Social Assets V1",
  version: "1.0.0",
  assets: {
    avatars: {
      kabir: "/avatars/kabir.png",
      arjun: "/avatars/arjun.png",
      neha: "/avatars/neha.png",
      meme_daily: "/avatars/meme-daily.png",
    },
    wallpapers: {
      midnight_grid: "/wallpapers/midnight-grid.png",
      warm_grain: "/wallpapers/warm-grain.png",
    },
    backgrounds: {
      neon_canvas: "/backgrounds/neon-canvas.jpg",
      cozy_canvas: "/backgrounds/cozy-canvas.jpg",
    },
    media: {
      founder_whiteboard: "/media/founder-whiteboard.jpg",
      office_meme: "/media/office-meme.png",
      launch_clip: "/media/launch-clip.mp4",
    },
    maps: {
      cafe_handoff: "/maps/cafe-handoff.png",
    },
    docs: {
      gtm_plan: "/docs/gtm-plan.pdf",
      investor_update: "/docs/investor-update.pdf",
    },
    stickers: {
      panic_cat: "/stickers/panic-cat.webp",
      deal_done: "/stickers/deal-done.webp",
    },
    linkPreviewImages: {
      product_hunt: "/link-preview/product-hunt.jpg",
      blog_launch: "/link-preview/blog-launch.jpg",
    },
    profileBanners: {
      founder_dark: "/banners/founder-dark.jpg",
      startup_neon: "/banners/startup-neon.jpg",
    },
  },
});
