import * as PIXI from "pixi.js";
import { Live2DModel } from "pixi-live2d-display/cubism4";

declare global {
  interface Window {
    PIXI?: typeof PIXI;
  }
}

if (typeof window !== "undefined") {
  window.PIXI = PIXI;
}

if (typeof Live2DModel.registerTicker === "function") {
  Live2DModel.registerTicker((PIXI as any).Ticker);
}

export { PIXI, Live2DModel };
