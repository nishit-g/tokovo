import React from "react";
import type { PluginRegistries } from "@tokovo/core";

const RegistryContext = React.createContext<PluginRegistries | null>(null);

export function RendererRegistryProvider({
  registries,
  children,
}: {
  registries: PluginRegistries;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <RegistryContext.Provider value={registries}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRendererRegistries(): PluginRegistries {
  const registries = React.useContext(RegistryContext);
  if (!registries) {
    throw new Error(
      "Renderer registries not provided. Wrap renderers with RendererRegistryProvider.",
    );
  }
  return registries;
}
