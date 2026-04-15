import type { ScopedLogger } from "@tokovo/core";
import type { PluginManagerClass, TokovoRegistries } from "@tokovo/react";
import type { DeviceRegistries } from "@tokovo/devices";

import { tokovoRuntimeManifest as rendererRuntimeManifest } from "@tokovo/renderer";
import { tokovoRuntimeManifest as whatsappRuntimeManifest } from "@tokovo/apps-whatsapp/plugin";
import { tokovoRuntimeManifest as xRuntimeManifest } from "@tokovo/apps-x/plugin";
import { tokovoRuntimeManifest as iMessageRuntimeManifest } from "@tokovo/apps-imessage/plugin";
import { tokovoRuntimeManifest as linkedInRuntimeManifest } from "@tokovo/apps-linkedin/plugin";
import { tokovoRuntimeManifest as instagramRuntimeManifest } from "@tokovo/apps-instagram/plugin";
import { tokovoRuntimeManifest as typewriterRuntimeManifest } from "@tokovo/apps-typewriter/plugin";
import { tokovoRuntimeManifest as snapchatRuntimeManifest } from "@tokovo/apps-snapchat/plugin";
import { tokovoRuntimeManifest as teamsRuntimeManifest } from "@tokovo/apps-teams/plugin";
import { tokovoRuntimeManifest as devicesRuntimeManifest } from "@tokovo/devices";
import { tokovoRuntimeManifest as notificationRuntimeManifest } from "@tokovo/device-notifications";
import { tokovoRuntimeManifest as cameraRuntimeManifest } from "@tokovo/device-camera";
import { tokovoRuntimeManifest as keyboardRuntimeManifest } from "@tokovo/device-keyboard";
import { tokovoRuntimeManifest as overlayRuntimeManifest } from "@tokovo/overlay";

export type TokovoRuntimeRegistrationInput = {
  tokovoRegistries: TokovoRegistries;
  deviceRegistries: DeviceRegistries;
  pluginManager: PluginManagerClass;
  logger: ScopedLogger;
};

type TokovoRuntimePluginDescriptor = {
  id: string;
  scope: "app" | "device" | "engine" | "renderer";
  register(input: TokovoRuntimeRegistrationInput): void;
};

function withLoggedRegistration(
  descriptor: TokovoRuntimePluginDescriptor,
): TokovoRuntimePluginDescriptor {
  return {
    ...descriptor,
    register(input) {
      input.logger.debug("Registering runtime manifest entry", {
        event: "runtime.plugins.entry",
        pluginId: descriptor.id,
        scope: descriptor.scope,
      });
      descriptor.register(input);
    },
  };
}

export const TOKOVO_RUNTIME_PLUGIN_MANIFEST: readonly TokovoRuntimePluginDescriptor[] = [
  ...devicesRuntimeManifest.map(withLoggedRegistration),
  ...whatsappRuntimeManifest.map(withLoggedRegistration),
  ...xRuntimeManifest.map(withLoggedRegistration),
  ...iMessageRuntimeManifest.map(withLoggedRegistration),
  ...linkedInRuntimeManifest.map(withLoggedRegistration),
  ...instagramRuntimeManifest.map(withLoggedRegistration),
  ...typewriterRuntimeManifest.map(withLoggedRegistration),
  ...snapchatRuntimeManifest.map(withLoggedRegistration),
  ...teamsRuntimeManifest.map(withLoggedRegistration),
  ...notificationRuntimeManifest.map(withLoggedRegistration),
  ...cameraRuntimeManifest.map(withLoggedRegistration),
  ...keyboardRuntimeManifest.map(withLoggedRegistration),
  ...overlayRuntimeManifest.map(withLoggedRegistration),
  ...rendererRuntimeManifest.map(withLoggedRegistration),
];

export function registerTokovoRuntimeManifest(
  input: TokovoRuntimeRegistrationInput,
): void {
  for (const descriptor of TOKOVO_RUNTIME_PLUGIN_MANIFEST) {
    descriptor.register(input);
  }
}

export function getRuntimeManifestEntryIds(): string[] {
  return TOKOVO_RUNTIME_PLUGIN_MANIFEST.map((descriptor) => descriptor.id);
}

export type TokovoRuntimePluginManifest = typeof TOKOVO_RUNTIME_PLUGIN_MANIFEST;
