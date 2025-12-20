/**
 * Instagram Track Event Type
 */

import type { InstagramPayloads } from "./payloads";

export interface InstagramTrackEvent<T extends keyof InstagramPayloads = keyof InstagramPayloads> {
    at: number;
    duration?: number;
    deviceId: string;
    kind: "APP";
    appId: "app_instagram";
    type: T;
    payload: InstagramPayloads[T];
    _declarationOrder: number;
}
