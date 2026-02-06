import { VoiceManifest, VoiceSegment } from "../types/manifest.js";

export interface VoicePlayEvent {
  kind: "voice";
  type: "play";
  at: number;
  payload: {
    segmentId: string;
    speed?: number;
    volume?: number;
  };
}

export interface VoiceTrackOptions {
  manifest: VoiceManifest;
  audioUrl: string;
}

export class VoiceTrackBuilder {
  private fps: number;
  private manifest: VoiceManifest;
  private audioUrl: string;
  private events: VoicePlayEvent[] = [];
  private segmentMap: Map<string, VoiceSegment>;

  constructor(fps: number, options: VoiceTrackOptions) {
    this.fps = fps;
    this.manifest = options.manifest;
    this.audioUrl = options.audioUrl;
    this.segmentMap = new Map(options.manifest.segments.map((s) => [s.id, s]));
  }

  private parseTime(time: string | number): number {
    if (typeof time === "number") return time;

    if (time.endsWith("s")) {
      return Math.round(parseFloat(time) * this.fps);
    }
    if (time.endsWith("ms")) {
      return Math.round((parseFloat(time) / 1000) * this.fps);
    }
    if (time.endsWith("f")) {
      return parseInt(time, 10);
    }
    return Math.round(parseFloat(time) * this.fps);
  }

  at(time: string | number): VoicePointBuilder {
    const frame = this.parseTime(time);
    return new VoicePointBuilder(this, frame);
  }

  playAll(startTime: string | number = 0): this {
    let currentFrame = this.parseTime(startTime);

    for (const segment of this.manifest.segments) {
      this.events.push({
        kind: "voice",
        type: "play",
        at: currentFrame,
        payload: { segmentId: segment.id },
      });
      currentFrame += Math.round((segment.durationMs / 1000) * this.fps);
    }

    return this;
  }

  addEvent(event: VoicePlayEvent): void {
    this.events.push(event);
  }

  getEvents(): VoicePlayEvent[] {
    return [...this.events];
  }

  getManifest(): VoiceManifest {
    return this.manifest;
  }

  getAudioUrl(): string {
    return this.audioUrl;
  }

  getSegment(id: string): VoiceSegment | undefined {
    return this.segmentMap.get(id);
  }

  getTotalDurationFrames(): number {
    return Math.ceil((this.manifest.durationMs / 1000) * this.fps);
  }
}

class VoicePointBuilder {
  constructor(
    private builder: VoiceTrackBuilder,
    private frame: number,
  ) {}

  play(
    segmentId: string,
    options?: { speed?: number; volume?: number },
  ): VoiceTrackBuilder {
    const segment = this.builder.getSegment(segmentId);
    if (!segment) {
      throw new Error(`Unknown segment: ${segmentId}`);
    }

    this.builder.addEvent({
      kind: "voice",
      type: "play",
      at: this.frame,
      payload: {
        segmentId,
        speed: options?.speed,
        volume: options?.volume,
      },
    });

    return this.builder;
  }
}

export function createVoiceTrack(
  fps: number,
  options: VoiceTrackOptions,
): VoiceTrackBuilder {
  return new VoiceTrackBuilder(fps, options);
}
