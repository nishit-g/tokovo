import type {
  CameraContext,
  CameraEvent,
  CameraEventType,
  MessageEventPayload,
} from "./types.js";

const BURST_THRESHOLD_MS = 2000;
const FAST_RHYTHM_THRESHOLD_MS = 1500;
const SLOW_RHYTHM_THRESHOLD_MS = 5000;

export class CameraContextBuilder implements CameraContext {
  private readonly _events: readonly CameraEvent[];
  private readonly _fps: number;
  private readonly _eventIndex: Map<string, number>;
  private readonly _burstCache: Map<string, boolean>;
  private readonly _turnStartCache: Map<string, boolean>;

  constructor(events: readonly CameraEvent[], fps: number = 30) {
    this._events = events;
    this._fps = fps;
    this._eventIndex = new Map(events.map((e, i) => [e.id, i]));
    this._burstCache = new Map();
    this._turnStartCache = new Map();
  }

  get allEvents(): readonly CameraEvent[] {
    return this._events;
  }

  get fps(): number {
    return this._fps;
  }

  isBurstContinuation(event: CameraEvent): boolean {
    const cached = this._burstCache.get(event.id);
    if (cached !== undefined) return cached;

    const prev = this.getPreviousEvent(event, event.type);
    if (!prev) {
      this._burstCache.set(event.id, false);
      return false;
    }

    const isBurst =
      this.getSender(event) === this.getSender(prev) &&
      event.timestamp - prev.timestamp < this._framesToMs(BURST_THRESHOLD_MS);

    this._burstCache.set(event.id, isBurst);
    return isBurst;
  }

  isTurnStart(event: CameraEvent): boolean {
    const cached = this._turnStartCache.get(event.id);
    if (cached !== undefined) return cached;

    const isStart = !this.isBurstContinuation(event);
    this._turnStartCache.set(event.id, isStart);
    return isStart;
  }

  getBurstIndex(event: CameraEvent): number {
    if (!this.isBurstContinuation(event)) return 0;

    let index = 0;
    let current: CameraEvent | null = event;

    while (current && this.isBurstContinuation(current)) {
      index++;
      current = this.getPreviousEvent(current, current.type);
    }

    return index;
  }

  getPreviousEvent(
    event: CameraEvent,
    type?: CameraEventType,
  ): CameraEvent | null {
    const index = this._eventIndex.get(event.id);
    if (index === undefined || index === 0) return null;

    for (let i = index - 1; i >= 0; i--) {
      const prev = this._events[i];
      if (!type || prev.type === type) {
        return prev;
      }
    }

    return null;
  }

  getNextEvent(event: CameraEvent, type?: CameraEventType): CameraEvent | null {
    const index = this._eventIndex.get(event.id);
    if (index === undefined) return null;

    for (let i = index + 1; i < this._events.length; i++) {
      const next = this._events[i];
      if (!type || next.type === type) {
        return next;
      }
    }

    return null;
  }

  getEventsBetween(start: number, end: number): readonly CameraEvent[] {
    return this._events.filter(
      (e) => e.timestamp >= start && e.timestamp <= end,
    );
  }

  getConversationRhythm(): "fast" | "medium" | "slow" {
    if (this._events.length < 2) return "medium";

    const gaps = [];
    for (let i = 1; i < this._events.length; i++) {
      gaps.push(this._events[i].timestamp - this._events[i - 1].timestamp);
    }

    const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const avgGapMs = this._framesToMs(avgGap);

    if (avgGapMs < FAST_RHYTHM_THRESHOLD_MS) return "fast";
    if (avgGapMs > SLOW_RHYTHM_THRESHOLD_MS) return "slow";
    return "medium";
  }

  getSender(event: CameraEvent): string | null {
    if (event.type === "MESSAGE_RECEIVED" || event.type === "MESSAGE_SENT") {
      const payload = event.payload as MessageEventPayload;
      return payload.from;
    }
    return null;
  }

  getTimeSincePrevious(event: CameraEvent): number {
    const prev = this.getPreviousEvent(event);
    if (!prev) return 0;
    return event.timestamp - prev.timestamp;
  }

  getTimeUntilNext(event: CameraEvent): number {
    const next = this.getNextEvent(event);
    if (!next) return Infinity;
    return next.timestamp - event.timestamp;
  }

  private _framesToMs(frames: number): number {
    return (frames / this._fps) * 1000;
  }
}
