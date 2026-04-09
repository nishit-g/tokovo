import { createPackRegistry } from "../registry.js";
import { socialAssetsV1 } from "./assets/social-assets-v1.js";
import { creatorPhonesV1 } from "./devices/creator-phones-v1.js";
import { startupChaosPersonaPack } from "./personas/startup-chaos.js";
import { cozyChatStyleKit } from "./styles/cozy-chat.js";
import { nightNeonStyleKit } from "./styles/night-neon.js";

export {
  startupChaosPersonaPack,
  socialAssetsV1,
  creatorPhonesV1,
  nightNeonStyleKit,
  cozyChatStyleKit,
};

export const starterPackRegistry = createPackRegistry({
  personaPacks: [startupChaosPersonaPack],
  assetPacks: [socialAssetsV1],
  styleKits: [nightNeonStyleKit, cozyChatStyleKit],
  deviceKits: [creatorPhonesV1],
});
