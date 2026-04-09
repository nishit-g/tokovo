import type { StudioPackSourceDescriptor } from "./types.js";

export const starterPackRegistrySourceDescriptors: readonly StudioPackSourceDescriptor[] = [
  {
    kind: "personas",
    id: "startup-chaos",
    name: "Startup Chaos",
    exportName: "startupChaosPersonaPack",
    relativeSourcePath: "packages/packs/src/starter/personas/startup-chaos.ts",
  },
  {
    kind: "assets",
    id: "social-assets-v1",
    name: "Social Assets V1",
    exportName: "socialAssetsV1",
    relativeSourcePath: "packages/packs/src/starter/assets/social-assets-v1.ts",
  },
  {
    kind: "styles",
    id: "night-neon",
    name: "Night Neon",
    exportName: "nightNeonStyleKit",
    relativeSourcePath: "packages/packs/src/starter/styles/night-neon.ts",
  },
  {
    kind: "styles",
    id: "cozy-chat",
    name: "Cozy Chat",
    exportName: "cozyChatStyleKit",
    relativeSourcePath: "packages/packs/src/starter/styles/cozy-chat.ts",
  },
  {
    kind: "devices",
    id: "creator-phones-v1",
    name: "Creator Phones V1",
    exportName: "creatorPhonesV1",
    relativeSourcePath: "packages/packs/src/starter/devices/creator-phones-v1.ts",
  },
] as const;
