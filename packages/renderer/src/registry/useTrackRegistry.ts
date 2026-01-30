import { TrackRegistry } from "./TrackRegistry";

export function useTrackRegistry() {
  return TrackRegistry.getAll();
}
