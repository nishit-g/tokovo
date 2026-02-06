import { TrackRegistry } from "./TrackRegistry.js";

export function useTrackRegistry() {
  return TrackRegistry.getAll();
}
