import fs from 'node:fs'
import {
  starterPackRegistry,
  starterPackRegistrySourceDescriptors,
  startupChaosPersonaPack,
  socialAssetsV1,
  creatorPhonesV1,
  nightNeonStyleKit,
  cozyChatStyleKit,
  defineAssetPack,
  defineDeviceKit,
  definePersonaPack,
  defineStyleKit,
  type AssetPack,
  type DeviceKit,
  type PersonaPack,
  type StudioPackKind,
  type StudioPackSourceDescriptor,
  type StyleKit,
} from '@tokovo/packs'
import {
  KNOWN_APP_IDS,
  resolveStoryKit,
  type ResolvedActor,
  type ResolvedDevice,
  type StoryKitConfig,
  type StoryKitStudioConfig,
} from '@tokovo/creator/story-kit'
import {
  type StudioStoryKitEpisodeDescriptor,
  studioStoryKitEpisodes,
} from '@tokovo/episodes/studio'
import { resolvePublicAssetPath, resolveRepoPath } from './repo'
import { renderPackSource, renderStoryKitSetupSource } from './serialize'

type PackManifest = PersonaPack | AssetPack | StyleKit | DeviceKit

const packManifests = {
  personas: {
    'startup-chaos': startupChaosPersonaPack,
  },
  assets: {
    'social-assets-v1': socialAssetsV1,
  },
  styles: {
    'night-neon': nightNeonStyleKit,
    'cozy-chat': cozyChatStyleKit,
  },
  devices: {
    'creator-phones-v1': creatorPhonesV1,
  },
} as const

function readSource(relativePath: string): string {
  return fs.readFileSync(resolveRepoPath(relativePath), 'utf8')
}

function evaluateTsObject<T>(literal: string): T {
  return Function(`"use strict"; return (${literal});`)() as T
}

function parsePackManifestFromSource(relativePath: string): PackManifest {
  const source = readSource(relativePath)
  const match = source.match(/define[A-Za-z]+\(([\s\S]*?)\);\s*$/)
  if (!match) {
    throw new Error(`Unable to parse pack manifest from ${relativePath}`)
  }
  return evaluateTsObject<PackManifest>(match[1].trim())
}

function parseStoryKitConfigFromSource(relativePath: string): StoryKitStudioConfig {
  const source = readSource(relativePath)
  const match = source.match(/export const [A-Za-z0-9_]+ = ([\s\S]*?) satisfies StoryKitStudioConfig;\s*$/)
  if (!match) {
    throw new Error(`Unable to parse story-kit setup from ${relativePath}`)
  }
  return evaluateTsObject<StoryKitStudioConfig>(match[1].trim())
}

export interface StudioPackSummary {
  kind: StudioPackKind
  id: string
  name: string
  version?: string
  relativeSourcePath: string
}

export interface StudioPackDetail extends StudioPackSummary {
  exportName: string
  manifest: PackManifest
  validationErrors: readonly string[]
}

export interface StudioResolvedPreview {
  warnings: readonly string[]
  actors: ResolvedActor[]
  devices: ResolvedDevice[]
}

export interface StudioEpisodeDetail {
  id: string
  title: string
  relativeEpisodePath: string
  relativeSetupPath: string
  exportName: string
  config: StoryKitStudioConfig
  preview: StudioResolvedPreview
}

export interface StudioEpisodeEditorOptions {
  personaIds: readonly string[]
  avatarAliases: readonly string[]
  deviceIds: readonly string[]
  appIds: readonly string[]
}

function packDescriptor(kind: StudioPackKind, id: string): StudioPackSourceDescriptor {
  const descriptor = starterPackRegistrySourceDescriptors.find(
    (entry) => entry.kind === kind && entry.id === id,
  )
  if (!descriptor) {
    throw new Error(`Unknown Studio pack descriptor for ${kind}:${id}`)
  }
  return descriptor
}

function getPackManifest(kind: StudioPackKind, id: string): PackManifest {
  const descriptor = packDescriptor(kind, id)
  try {
    return parsePackManifestFromSource(descriptor.relativeSourcePath)
  } catch {
    const collection = packManifests[kind] as Record<string, PackManifest>
    const manifest = collection[id]
    if (!manifest) {
      throw new Error(`Unknown ${kind} pack "${id}"`)
    }
    return manifest
  }
}

function validateAssetPaths(manifest: PackManifest): readonly string[] {
  if (!('assets' in manifest)) return []
  const errors: string[] = []
  for (const [bucket, entries] of Object.entries(manifest.assets)) {
    for (const [alias, value] of Object.entries(entries)) {
      const resolved = resolvePublicAssetPath(value)
      if (!resolved) {
        errors.push(`Missing asset file for ${bucket}:${alias} -> ${value}`)
      }
    }
  }
  return errors
}

function validatePersonaPack(manifest: PersonaPack): readonly string[] {
  const errors: string[] = []
  for (const [id, persona] of Object.entries(manifest.personas)) {
    if (persona.id !== id) {
      errors.push(`Persona key "${id}" must match persona.id "${persona.id}"`)
    }
    if (!resolvePublicAssetPath(persona.avatar)) {
      errors.push(`Missing avatar file for persona "${id}" -> ${persona.avatar}`)
    }
  }
  return errors
}

function validateStyleKit(manifest: StyleKit): readonly string[] {
  const errors: string[] = []
  if (manifest.background && manifest.background.startsWith('/')) {
    if (!resolvePublicAssetPath(manifest.background)) {
      errors.push(`Missing background file -> ${manifest.background}`)
    }
  }
  for (const [deviceId, defaults] of Object.entries(manifest.deviceDefaults ?? {})) {
    if (defaults.wallpaper && !resolvePublicAssetPath(defaults.wallpaper)) {
      errors.push(`Missing wallpaper for device default "${deviceId}" -> ${defaults.wallpaper}`)
    }
  }
  return errors
}

function validateDeviceKit(manifest: DeviceKit): readonly string[] {
  const errors: string[] = []
  for (const [deviceId, device] of Object.entries(manifest.devices)) {
    if (device.wallpaper && !resolvePublicAssetPath(device.wallpaper)) {
      errors.push(`Missing wallpaper for device "${deviceId}" -> ${device.wallpaper}`)
    }
  }
  return errors
}

function validatePackManifest(manifest: PackManifest): readonly string[] {
  if ('personas' in manifest) return validatePersonaPack(manifest)
  if ('assets' in manifest) return validateAssetPaths(manifest)
  if ('deviceDefaults' in manifest || 'appThemes' in manifest) return validateStyleKit(manifest)
  if ('devices' in manifest) return validateDeviceKit(manifest)
  return []
}

function toStoryKitConfig(config: StoryKitStudioConfig): StoryKitConfig {
  return {
    personaPackId: config.packs.personas,
    assetPackId: config.packs.assets,
    styleKitId: config.packs.styles,
    deviceKitId: config.packs.devices,
    background: config.background,
    appThemeDefaults: config.appThemeDefaults,
    cast: config.cast,
    devices: config.devices,
  }
}

function resolveStudioPreview(config: StoryKitStudioConfig): StudioResolvedPreview {
  const resolved = resolveStoryKit({
    config: toStoryKitConfig(config),
    registry: starterPackRegistry,
  })
  return {
    warnings: resolved.warnings,
    actors: Object.values(resolved.actors),
    devices: Object.values(resolved.devices),
  }
}

function episodeDescriptor(id: string): StudioStoryKitEpisodeDescriptor {
  const descriptor = studioStoryKitEpisodes.find((entry) => entry.id === id)
  if (!descriptor) {
    throw new Error(`Unknown Studio story-kit episode "${id}"`)
  }
  return descriptor
}

function getEpisodeConfig(descriptor: StudioStoryKitEpisodeDescriptor): StoryKitStudioConfig {
  try {
    return parseStoryKitConfigFromSource(descriptor.relativeSetupPath)
  } catch {
    return descriptor.config
  }
}

export function listStudioPacks(): StudioPackSummary[] {
  return starterPackRegistrySourceDescriptors.map((descriptor) => {
    const manifest = getPackManifest(descriptor.kind, descriptor.id)
    return {
      kind: descriptor.kind,
      id: descriptor.id,
      name: manifest.name,
      version: manifest.version,
      relativeSourcePath: descriptor.relativeSourcePath,
    }
  })
}

export function listStudioPacksByKind(kind: StudioPackKind): StudioPackSummary[] {
  return listStudioPacks().filter((pack) => pack.kind === kind)
}

export function getStudioPackDetail(kind: StudioPackKind, id: string): StudioPackDetail {
  const descriptor = packDescriptor(kind, id)
  const manifest = getPackManifest(kind, id)
  return {
    kind,
    id,
    name: manifest.name,
    version: manifest.version,
    relativeSourcePath: descriptor.relativeSourcePath,
    exportName: descriptor.exportName,
    manifest,
    validationErrors: validatePackManifest(manifest),
  }
}

function normalizePackManifest(kind: StudioPackKind, manifest: PackManifest): PackManifest {
  switch (kind) {
    case 'personas':
      return definePersonaPack(manifest as PersonaPack)
    case 'assets':
      return defineAssetPack(manifest as AssetPack)
    case 'styles':
      return defineStyleKit(manifest as StyleKit)
    case 'devices':
      return defineDeviceKit(manifest as DeviceKit)
  }
}

export function updateStudioPack(
  kind: StudioPackKind,
  id: string,
  manifest: PackManifest,
): StudioPackDetail {
  const descriptor = packDescriptor(kind, id)
  const normalized = normalizePackManifest(kind, manifest)
  const targetPath = resolveRepoPath(descriptor.relativeSourcePath)
  fs.writeFileSync(targetPath, renderPackSource(descriptor, normalized))
  return {
    kind,
    id: normalized.id,
    name: normalized.name,
    version: normalized.version,
    relativeSourcePath: descriptor.relativeSourcePath,
    exportName: descriptor.exportName,
    manifest: normalized,
    validationErrors: validatePackManifest(normalized),
  }
}

export function listStudioEpisodes(): Pick<
  StudioEpisodeDetail,
  'id' | 'title' | 'relativeEpisodePath' | 'relativeSetupPath'
>[] {
  return studioStoryKitEpisodes.map((descriptor) => ({
    id: descriptor.id,
    title: descriptor.title,
    relativeEpisodePath: descriptor.relativeEpisodePath,
    relativeSetupPath: descriptor.relativeSetupPath,
  }))
}

export function getStudioEpisodeDetail(id: string): StudioEpisodeDetail {
  const descriptor = episodeDescriptor(id)
  const config = getEpisodeConfig(descriptor)
  return {
    id: descriptor.id,
    title: descriptor.title,
    relativeEpisodePath: descriptor.relativeEpisodePath,
    relativeSetupPath: descriptor.relativeSetupPath,
    exportName: descriptor.exportName,
    config,
    preview: resolveStudioPreview(config),
  }
}

export function getStudioEpisodeEditorOptions(
  config: StoryKitStudioConfig,
): StudioEpisodeEditorOptions {
  const personaPack = config.packs.personas ? (getPackManifest('personas', config.packs.personas) as PersonaPack) : undefined
  const assetPack = config.packs.assets ? (getPackManifest('assets', config.packs.assets) as AssetPack) : undefined
  const devicePack = config.packs.devices ? (getPackManifest('devices', config.packs.devices) as DeviceKit) : undefined

  return {
    personaIds: personaPack ? Object.keys(personaPack.personas) : [],
    avatarAliases: assetPack ? Object.keys(assetPack.assets.avatars).map((alias) => `avatars:${alias}`) : [],
    deviceIds: devicePack ? Object.keys(devicePack.devices) : [],
    appIds: Array.from(KNOWN_APP_IDS).sort(),
  }
}

export function updateStudioEpisodeConfig(
  id: string,
  config: StoryKitStudioConfig,
): StudioEpisodeDetail {
  const descriptor = episodeDescriptor(id)
  const targetPath = resolveRepoPath(descriptor.relativeSetupPath)
  fs.writeFileSync(targetPath, renderStoryKitSetupSource(descriptor.exportName, config))
  return {
    id: config.id,
    title: config.title,
    relativeEpisodePath: descriptor.relativeEpisodePath,
    relativeSetupPath: descriptor.relativeSetupPath,
    exportName: descriptor.exportName,
    config,
    preview: resolveStudioPreview(config),
  }
}

export function listStudioPackOptions(): {
  personas: readonly string[]
  assets: readonly string[]
  styles: readonly string[]
  devices: readonly string[]
} {
  return {
    personas: starterPackRegistry.listPersonaPackIds(),
    assets: starterPackRegistry.listAssetPackIds(),
    styles: starterPackRegistry.listStyleKitIds(),
    devices: starterPackRegistry.listDeviceKitIds(),
  }
}
