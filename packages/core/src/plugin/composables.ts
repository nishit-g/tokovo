import type { Platform } from "../tokens";
import type {
  WorldState,
  RuntimeEvent,
  LayoutContext,
  LayoutState,
} from "../types";
import type {
  PluginReducer,
  PluginViews,
  PluginViewComponent,
  PluginLayoutStrategy,
  PluginAnchorRegistry,
  PluginAnchorProvider,
  PluginAutoSoundRule,
  PluginNotificationAdapter,
  PluginFormattedNotification,
} from "../types/plugin-contract";
import type { Notification } from "../types/notification";

export interface ReducerCapability<AppId extends string = string> {
  readonly _type: "reducer";
  readonly appId: AppId;
  readonly reducer: PluginReducer<AppId>;
  readonly eventKinds?: readonly string[];
}

export interface ViewsCapability<AppId extends string = string> {
  readonly _type: "views";
  readonly appId: AppId;
  readonly views: PluginViews;
}

export interface AnchorsCapability<AppId extends string = string> {
  readonly _type: "anchors";
  readonly appId: AppId;
  readonly providers: Record<string, PluginAnchorProvider>;
  readonly framing?: Record<string, AnchorFramingConfig>;
}

export interface AnchorFramingConfig {
  anchorPoint?: { x: number; y: number };
  paddingPx?: number;
  targetFill?: number;
}

export interface LayoutsCapability<AppId extends string = string> {
  readonly _type: "layouts";
  readonly appId: AppId;
  readonly layouts: PluginLayoutDefinition[];
}

export interface PluginLayoutDefinition {
  viewKind: string;
  platforms?: Platform[];
  computeLayout: (ctx: LayoutContext) => LayoutState;
}

export interface AudioCapability<AppId extends string = string> {
  readonly _type: "audio";
  readonly appId: AppId;
  readonly rules: PluginAutoSoundRule[];
  readonly sounds?: Record<string, string>;
}

export interface NotificationsCapability<AppId extends string = string> {
  readonly _type: "notifications";
  readonly appId: AppId;
  readonly adapter: PluginNotificationAdapter;
}

export interface InitialStateCapability<
  AppId extends string = string,
  TState = unknown,
> {
  readonly _type: "initialState";
  readonly appId: AppId;
  readonly createState: () => TState;
}

export type PluginCapability<AppId extends string = string> =
  | ReducerCapability<AppId>
  | ViewsCapability<AppId>
  | AnchorsCapability<AppId>
  | LayoutsCapability<AppId>
  | AudioCapability<AppId>
  | NotificationsCapability<AppId>
  | InitialStateCapability<AppId>;

export function defineReducer<AppId extends string>(
  appId: AppId,
  reducer: PluginReducer<AppId>,
  eventKinds?: readonly string[],
): ReducerCapability<AppId> {
  return {
    _type: "reducer",
    appId,
    reducer,
    eventKinds,
  };
}

export function defineViews<AppId extends string>(
  appId: AppId,
  views: PluginViews,
): ViewsCapability<AppId> {
  return {
    _type: "views",
    appId,
    views,
  };
}

export function defineAnchors<AppId extends string>(
  appId: AppId,
  providers: Record<string, PluginAnchorProvider>,
  framing?: Record<string, AnchorFramingConfig>,
): AnchorsCapability<AppId> {
  return {
    _type: "anchors",
    appId,
    providers,
    framing,
  };
}

export function defineLayouts<AppId extends string>(
  appId: AppId,
  layouts: PluginLayoutDefinition[],
): LayoutsCapability<AppId> {
  return {
    _type: "layouts",
    appId,
    layouts,
  };
}

export function defineAudioRules<AppId extends string>(
  appId: AppId,
  rules: PluginAutoSoundRule[],
  sounds?: Record<string, string>,
): AudioCapability<AppId> {
  return {
    _type: "audio",
    appId,
    rules,
    sounds,
  };
}

export function defineNotificationAdapter<AppId extends string>(
  appId: AppId,
  format: (notification: Notification) => PluginFormattedNotification,
): NotificationsCapability<AppId> {
  return {
    _type: "notifications",
    appId,
    adapter: { format },
  };
}

export function defineInitialState<AppId extends string, TState>(
  appId: AppId,
  createState: () => TState,
): InitialStateCapability<AppId, TState> {
  return {
    _type: "initialState",
    appId,
    createState,
  };
}

export interface ComposedPlugin<AppId extends string = string> {
  id: AppId;
  version: string;
  displayName: string;
  capabilities: PluginCapability<AppId>[];
}

export function composePlugin<AppId extends string>(
  id: AppId,
  version: string,
  displayName: string,
  capabilities: PluginCapability<AppId>[],
): ComposedPlugin<AppId> {
  return {
    id,
    version,
    displayName,
    capabilities,
  };
}

export function getCapability<T extends PluginCapability["_type"]>(
  capabilities: PluginCapability[],
  type: T,
): Extract<PluginCapability, { _type: T }> | undefined {
  return capabilities.find((c) => c._type === type) as
    | Extract<PluginCapability, { _type: T }>
    | undefined;
}

export function hasCapability(
  capabilities: PluginCapability[],
  type: PluginCapability["_type"],
): boolean {
  return capabilities.some((c) => c._type === type);
}
