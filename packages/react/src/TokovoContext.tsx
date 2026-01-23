import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { WorldState, DeviceState, LayoutState } from "@tokovo/core";

interface TokovoContextValue {
  world: WorldState;
  deviceId: string;
  appId: string;
  t: number;
  layout: LayoutState | undefined;
  platform: string;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const TokovoContext = createContext<TokovoContextValue | null>(null);

interface TokovoProviderProps {
  children: ReactNode;
  world: WorldState;
  deviceId: string;
  appId: string;
  t: number;
  layout?: LayoutState;
  platform?: string;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function TokovoProvider({
  children,
  world,
  deviceId,
  appId,
  t,
  layout,
  platform = "ios",
  safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 },
}: TokovoProviderProps) {
  const value = useMemo(
    () => ({
      world,
      deviceId,
      appId,
      t,
      layout,
      platform,
      safeAreaInsets,
    }),
    [world, deviceId, appId, t, layout, platform, safeAreaInsets],
  );

  return (
    <TokovoContext.Provider value={value}>{children}</TokovoContext.Provider>
  );
}

function useTokovoContext(): TokovoContextValue {
  const context = useContext(TokovoContext);
  if (!context) {
    throw new Error("useTokovo hooks must be used within a TokovoProvider");
  }
  return context;
}

export function useWorld(): WorldState {
  return useTokovoContext().world;
}

export function useDevice(): DeviceState {
  const { world, deviceId } = useTokovoContext();
  const device = world.devices[deviceId];
  if (!device) {
    throw new Error(`Device ${deviceId} not found in world state`);
  }
  return device;
}

export function useAppState<T = unknown>(): T {
  const { world, appId } = useTokovoContext();
  return world.appState?.[appId] as T;
}

export function useLayout<T = unknown>(): T | undefined {
  return useTokovoContext().layout as T | undefined;
}

export function useTime(): number {
  return useTokovoContext().t;
}

export function usePlatform(): string {
  return useTokovoContext().platform;
}

export function useDeviceId(): string {
  return useTokovoContext().deviceId;
}

export function useAppId(): string {
  return useTokovoContext().appId;
}

export function useSafeAreaInsets() {
  return useTokovoContext().safeAreaInsets;
}

export function useConversation<T extends { id: string } = { id: string }>(
  conversationId: string,
): T | undefined {
  const appState = useAppState<{ conversations?: T[] }>();
  return appState?.conversations?.find((c) => c.id === conversationId);
}

export function useActiveConversation<
  T extends { id: string } = { id: string },
>(): T | undefined {
  const appState = useAppState<{
    activeConversationId?: string;
    conversations?: T[];
  }>();
  if (!appState?.activeConversationId) return undefined;
  return appState.conversations?.find(
    (c) => c.id === appState.activeConversationId,
  );
}

export { TokovoContext };
