import React from "react";
import type { DeviceRegistries } from "./registries/bundle";

const DeviceRegistryContext = React.createContext<DeviceRegistries | null>(null);

export function DeviceRegistryProvider({
  registries,
  children,
}: {
  registries: DeviceRegistries;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <DeviceRegistryContext.Provider value={registries}>
      {children}
    </DeviceRegistryContext.Provider>
  );
}

export function useDeviceRegistries(): DeviceRegistries {
  const registries = React.useContext(DeviceRegistryContext);
  if (!registries) {
    throw new Error(
      "Device registries not provided. Wrap components with DeviceRegistryProvider.",
    );
  }
  return registries;
}
