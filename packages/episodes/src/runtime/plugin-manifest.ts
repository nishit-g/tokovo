import type { ScopedLogger } from "@tokovo/core";
import type { PluginManagerClass, TokovoRegistries } from "@tokovo/react";
import type { DeviceRegistries } from "@tokovo/devices";

import { rendererOsAnchorsRuntimeEntry } from "@tokovo/renderer";
import { whatsappRuntimeEntry } from "@tokovo/apps-whatsapp/plugin";
import { xRuntimeEntry } from "@tokovo/apps-x/plugin";
import { iMessageRuntimeEntry } from "@tokovo/apps-imessage/plugin";
import { linkedInRuntimeEntry } from "@tokovo/apps-linkedin/plugin";
import { instagramRuntimeEntry } from "@tokovo/apps-instagram/plugin";
import { typewriterRuntimeEntry } from "@tokovo/apps-typewriter/plugin";
import { snapchatRuntimeEntry } from "@tokovo/apps-snapchat/plugin";
import { teamsRuntimeEntry } from "@tokovo/apps-teams/plugin";
import { devicesRuntimeEntry } from "@tokovo/devices";
import { notificationRuntimeEntry } from "@tokovo/device-notifications";
import { cameraRuntimeEntry } from "@tokovo/device-camera";
import { keyboardRuntimeEntry } from "@tokovo/device-keyboard";
import { overlayRuntimeEntry } from "@tokovo/overlay";

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
  withLoggedRegistration(devicesRuntimeEntry),
  withLoggedRegistration(whatsappRuntimeEntry),
  withLoggedRegistration(xRuntimeEntry),
  withLoggedRegistration(iMessageRuntimeEntry),
  withLoggedRegistration(linkedInRuntimeEntry),
  withLoggedRegistration(instagramRuntimeEntry),
  withLoggedRegistration(typewriterRuntimeEntry),
  withLoggedRegistration(snapchatRuntimeEntry),
  withLoggedRegistration(teamsRuntimeEntry),
  withLoggedRegistration(notificationRuntimeEntry),
  withLoggedRegistration(cameraRuntimeEntry),
  withLoggedRegistration(keyboardRuntimeEntry),
  withLoggedRegistration(overlayRuntimeEntry),
  withLoggedRegistration(rendererOsAnchorsRuntimeEntry),
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
