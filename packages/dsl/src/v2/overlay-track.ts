/**
 * Overlay Track Builder (v2) - Creator-first story primitives
 *
 * @description Emits OVERLAY events that render above devices:
 * hook, caption, receipts, reaction gifs, cliffhangers.
 */

import type {
  OverlayPayloads,
  OverlayTrackEvent,
  OverlayVariant,
  TrackEvent,
} from "@tokovo/ir";
import { parseTimeToFrames } from "./utils/time.js";

type GetDeclarationOrder = () => number;

export class OverlayPointBuilder {
  constructor(
    private _frame: number,
    private _events: TrackEvent[],
    private _getOrder: GetDeclarationOrder,
  ) {}

  private show(
    variant: OverlayVariant,
    payload: Omit<OverlayPayloads["SHOW"], "variant">,
  ): string {
    const id =
      payload.id ?? `ov_${variant}_${this._frame}_${this._events.length}`;
    const event: OverlayTrackEvent = {
      at: this._frame,
      kind: "OVERLAY",
      type: "SHOW",
      payload: { ...payload, id, variant },
      _declarationOrder: this._getOrder(),
    };
    this._events.push(event);
    return id;
  }

  hook(
    text: string,
    options?: Omit<OverlayPayloads["SHOW"], "variant" | "text">,
  ): string {
    return this.show("hook", { ...options, text });
  }

  caption(
    text: string,
    options?: Omit<OverlayPayloads["SHOW"], "variant" | "text">,
  ): string {
    return this.show("caption", { ...options, text });
  }

  receipt(
    text: string,
    options?: Omit<OverlayPayloads["SHOW"], "variant" | "text">,
  ): string {
    return this.show("receipt", { ...options, text });
  }

  cliffhanger(
    text: string,
    options?: Omit<OverlayPayloads["SHOW"], "variant" | "text">,
  ): string {
    return this.show("cliffhanger", { ...options, text });
  }

  reactionGif(
    mediaSrc: string,
    options?: Omit<OverlayPayloads["SHOW"], "variant" | "mediaSrc">,
  ): string {
    return this.show("reactionGif", { ...options, mediaSrc });
  }

  hide(options: OverlayPayloads["HIDE"]): void {
    const event: OverlayTrackEvent = {
      at: this._frame,
      kind: "OVERLAY",
      type: "HIDE",
      payload: options,
      _declarationOrder: this._getOrder(),
    };
    this._events.push(event);
  }

  clear(): void {
    const event: OverlayTrackEvent = {
      at: this._frame,
      kind: "OVERLAY",
      type: "CLEAR",
      payload: {},
      _declarationOrder: this._getOrder(),
    };
    this._events.push(event);
  }
}

export class OverlayTrackBuilder {
  _events: TrackEvent[] = [];
  private _currentFrame = 0;

  constructor(
    private _fps: number,
    private _getOrder: GetDeclarationOrder,
  ) {}

  at(time: string | number): OverlayPointBuilder {
    this._currentFrame =
      typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new OverlayPointBuilder(
      this._currentFrame,
      this._events,
      this._getOrder,
    );
  }

  span(
    start: string | number,
    end: string | number,
  ): OverlayPointBuilder {
    const startFrame =
      typeof start === "number" ? start : parseTimeToFrames(start, this._fps);
    const endFrame =
      typeof end === "number" ? end : parseTimeToFrames(end, this._fps);
    const durationFrames = Math.max(0, endFrame - startFrame);

    this._currentFrame = startFrame;
    // Span convenience: SHOW calls can pass durationFrames explicitly.
    return new OverlayPointBuilder(startFrame, this._events, this._getOrder);
  }
}
