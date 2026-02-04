import React from "react";
import type { PluginRegistries } from "@tokovo/react";
import type { DeviceRegistries } from "@tokovo/devices";
import { DeviceRegistryProvider } from "@tokovo/devices";

export interface RendererRegistries {
  plugins: PluginRegistries;
  devices: DeviceRegistries;
}

const RegistryContext = React.createContext<RendererRegistries | null>(null);

export function RendererRegistryProvider({
  registries,
  children,
}: {
  registries: RendererRegistries;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <RegistryContext.Provider value={registries}>
      <DeviceRegistryProvider registries={registries.devices}>
        {children}
      </DeviceRegistryProvider>
    </RegistryContext.Provider>
  );
}

export function useRendererRegistries(): RendererRegistries {
  const registries = React.useContext(RegistryContext);
  if (!registries) {
    throw new Error(
      "Renderer registries not provided. Wrap renderers with RendererRegistryProvider.",
    );
  }
  return registries;
}
