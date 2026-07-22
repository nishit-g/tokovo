import type {
  PlatformDesignProfile,
  PlatformDesignProfileId,
} from "./contract.js";
import { BUILT_IN_PLATFORM_PROFILES } from "./profiles.js";

export class PlatformDesignRegistry {
  readonly #profiles = new Map<PlatformDesignProfileId, PlatformDesignProfile>();

  register(profile: PlatformDesignProfile): void {
    if (this.#profiles.has(profile.id)) {
      throw new Error(
        `VISUAL_PROFILE_COLLISION: platform design profile "${profile.id}" is already registered.`,
      );
    }
    this.#profiles.set(profile.id, profile);
  }

  require(id: PlatformDesignProfileId): PlatformDesignProfile {
    const profile = this.#profiles.get(id);
    if (!profile) {
      throw new Error(
        `VISUAL_PROFILE_MISSING: platform design profile "${id}" is not registered.`,
      );
    }
    return profile;
  }

  list(): readonly PlatformDesignProfile[] {
    return [...this.#profiles.values()];
  }
}

export function createPlatformDesignRegistry(
  profiles: readonly PlatformDesignProfile[] = BUILT_IN_PLATFORM_PROFILES,
): PlatformDesignRegistry {
  const registry = new PlatformDesignRegistry();
  for (const profile of profiles) registry.register(profile);
  return registry;
}

export const platformDesignRegistry = createPlatformDesignRegistry();
