import type {
  CinematicSubjectProjection,
  CinematicSubjectProvider,
} from "../types/cinematic-subject.js";
import type { WorldState } from "../types/world-state.js";
import { projectWorldForDevice } from "../utils/app-state.js";

export class CinematicSubjectRegistryClass {
  readonly #providers = new Map<string, CinematicSubjectProvider>();

  register(provider: CinematicSubjectProvider): void {
    if (this.#providers.has(provider.ownerId)) {
      throw new Error(
        `Cinematic subject provider "${provider.ownerId}" is already registered.`,
      );
    }
    this.#providers.set(provider.ownerId, provider);
  }

  unregister(ownerId: string): boolean {
    return this.#providers.delete(ownerId);
  }

  get(ownerId: string): CinematicSubjectProvider | undefined {
    return this.#providers.get(ownerId);
  }

  list(): readonly string[] {
    return [...this.#providers.keys()].sort();
  }

  project(
    ownerId: string,
    world: WorldState,
    layout: unknown,
    deviceId: string,
  ): readonly CinematicSubjectProjection[] {
    const provider = this.#providers.get(ownerId);
    if (!provider) {
      throw new Error(
        `Cinematic subject provider "${ownerId}" is not registered.`,
      );
    }
    return provider.project(
      projectWorldForDevice(world, deviceId),
      layout,
      deviceId,
    );
  }
}

export function createCinematicSubjectRegistry(): CinematicSubjectRegistryClass {
  return new CinematicSubjectRegistryClass();
}
