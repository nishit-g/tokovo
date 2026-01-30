export interface RenderTrackDefinition {
  name: string;
  zIndex: number;
  color?: string;
  Component: unknown;
  filterEvents: (events: unknown[]) => unknown[];
}

class TrackRegistryClass {
  private tracks = new Map<string, RenderTrackDefinition>();

  register(track: RenderTrackDefinition): void {
    if (this.tracks.has(track.name)) {
      console.warn(`Track "${track.name}" is already registered. Overwriting.`);
    }
    this.tracks.set(track.name, track);
  }

  getAll(): RenderTrackDefinition[] {
    return Array.from(this.tracks.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  get(name: string): RenderTrackDefinition | undefined {
    return this.tracks.get(name);
  }

  has(name: string): boolean {
    return this.tracks.has(name);
  }

  clear(): void {
    this.tracks.clear();
  }

  remove(name: string): boolean {
    return this.tracks.delete(name);
  }
}

export const TrackRegistry = new TrackRegistryClass();
export type { TrackRegistryClass };
