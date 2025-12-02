import { produce } from "immer";
import { TimelineEvent, WorldState, DeviceState } from "./types";

export type DeviceReducer = (state: Record<string, DeviceState>, event: TimelineEvent) => Record<string, DeviceState>;
export type AppReducer = (draft: WorldState, event: TimelineEvent) => void;

export const ReducerRegistry = {
    deviceReducer: null as DeviceReducer | null,
    appReducers: {} as Record<string, AppReducer>,

    registerDeviceReducer(reducer: DeviceReducer) {
        this.deviceReducer = reducer;
    },
    registerAppReducer(appId: string, reducer: AppReducer) {
        this.appReducers[appId] = reducer;
    }
};

export function replay(initial: WorldState, events: TimelineEvent[], t: number): WorldState {
    const relevant = events.filter(e => e.at <= t);

    return relevant.reduce((state, event) => {
        return produce(state, draft => {
            if (event.kind === "DEVICE") {
                if (ReducerRegistry.deviceReducer) {
                    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
                }
            }
            if (event.kind === "APP") {
                const reducer = ReducerRegistry.appReducers[event.appId];
                reducer?.(draft, event);
            }
            if (event.kind === "CAMERA") {
                draft.camera = event.view;
            }
        });
    }, initial);
}
