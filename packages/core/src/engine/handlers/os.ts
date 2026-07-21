/**
 * OS Handler - Processes OS events
 *
 * @description Handles device OS state: time, battery, network, DND.
 */

import type { WorldState, NetworkType } from "../../types.js";
import { DEFAULT_OS_STATE } from "../../types.js";
import type { OSEvent, HandlerContext } from "./types.js";

interface OSEventPayload {
  deviceId?: string;
  locale?: string;
  appearance?: "light" | "dark";
  hourCycle?: "h12" | "h24";
  lockScreenWallpaper?: string;
  time?: number;
  battery?: number;
  level?: number;
  charging?: boolean;
  rate?: number;
  network?: string;
  strength?: number;
  enabled?: boolean;
  dnd?: boolean;
  lowPowerMode?: boolean;
}

function normalizeNetworkType(network: string | undefined): NetworkType {
  if (!network) return "wifi";
  const lower = network.toLowerCase();
  if (lower === "wifi") return "wifi";
  if (lower === "5g") return "5G";
  if (lower === "4g") return "4G";
  if (lower === "lte") return "LTE";
  if (lower === "3g") return "3G";
  if (lower === "e") return "E";
  if (lower === "none" || lower === "no-service" || lower === "cellular")
    return "no-service";
  return "wifi";
}

export function processOSEvent(
  draft: WorldState,
  event: OSEvent,
  _ctx: HandlerContext,
): void {
  const payload = event as OSEvent & OSEventPayload;
  const deviceId = payload.deviceId || Object.keys(draft.devices)[0];
  const device = draft.devices[deviceId];
  if (!device) return;

  if (!device.os) {
    device.os = { ...DEFAULT_OS_STATE };
  }

  switch (event.type) {
    case "SET_STATE": {
      if (payload.locale !== undefined) device.os.locale = payload.locale;
      if (payload.appearance !== undefined) device.os.appearance = payload.appearance;
      if (payload.hourCycle !== undefined) device.os.hourCycle = payload.hourCycle;
      if (payload.lockScreenWallpaper !== undefined) {
        device.os.lockScreenWallpaper = payload.lockScreenWallpaper;
      }
      if (payload.time !== undefined) device.os.clock = payload.time;
      if (payload.battery !== undefined) {
        device.os.battery = Math.max(0, Math.min(100, payload.battery));
      }
      if (payload.charging !== undefined) device.os.charging = payload.charging;
      if (payload.network !== undefined) {
        const normalizedNetwork = normalizeNetworkType(payload.network);
        device.os.network = normalizedNetwork;
        if (payload.strength !== undefined) {
          if (normalizedNetwork === "wifi") device.os.wifiStrength = payload.strength;
          else device.os.cellStrength = payload.strength;
        }
      }
      if (payload.dnd !== undefined) device.os.dnd = payload.dnd;
      if (payload.lowPowerMode !== undefined) device.os.lowPowerMode = payload.lowPowerMode;
      break;
    }

    case "SET_TIME":
      device.os.clock = payload.time ?? device.os.clock ?? 0;
      break;

    case "SET_BATTERY":
      device.os.battery = Math.max(0, Math.min(100, payload.level ?? 100));
      if (payload.charging !== undefined) {
        device.os.charging = payload.charging;
      }
      break;

    case "DRAIN_BATTERY": {
      const fps = _ctx.fps ?? 30;
      const drain = (payload.rate ?? 0) / fps;
      device.os.battery = Math.max(0, device.os.battery - drain);
      break;
    }

    case "SET_NETWORK": {
      const normalizedNetwork = normalizeNetworkType(payload.network);
      device.os.network = normalizedNetwork;
      if (payload.strength !== undefined) {
        if (normalizedNetwork === "wifi") {
          device.os.wifiStrength = payload.strength;
        } else {
          device.os.cellStrength = payload.strength;
        }
      }
      break;
    }

    case "SET_DND":
      device.os.dnd = payload.enabled ?? false;
      break;

    case "SET_LOW_POWER":
      device.os.lowPowerMode = payload.enabled ?? false;
      break;
  }
}
