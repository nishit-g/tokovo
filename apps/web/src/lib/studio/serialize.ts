import type {
  AssetPack,
  DeviceKit,
  PersonaPack,
  StyleKit,
  StudioPackKind,
  StudioPackSourceDescriptor,
} from '@tokovo/packs'
import type { StoryKitStudioConfig } from '@tokovo/creator/story-kit'

function indent(depth: number): string {
  return '  '.repeat(depth)
}

function renderString(value: string): string {
  return JSON.stringify(value)
}

function renderKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
}

export function toTsLiteral(value: unknown, depth = 0): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return renderString(value)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[\n${value
      .map((item) => `${indent(depth + 1)}${toTsLiteral(item, depth + 1)}`)
      .join(',\n')}\n${indent(depth)}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, entryValue]) => entryValue !== undefined,
    )
    if (entries.length === 0) return '{}'
    return `{\n${entries
      .map(
        ([key, entryValue]) =>
          `${indent(depth + 1)}${renderKey(key)}: ${toTsLiteral(entryValue, depth + 1)}`,
      )
      .join(',\n')}\n${indent(depth)}}`
  }
  return JSON.stringify(value)
}

type PackManifest = PersonaPack | AssetPack | StyleKit | DeviceKit

function renderPackImport(kind: StudioPackKind): string {
  switch (kind) {
    case 'personas':
      return 'definePersonaPack'
    case 'assets':
      return 'defineAssetPack'
    case 'styles':
      return 'defineStyleKit'
    case 'devices':
      return 'defineDeviceKit'
  }
}

export function renderPackSource(
  descriptor: StudioPackSourceDescriptor,
  manifest: PackManifest,
): string {
  const fnName = renderPackImport(descriptor.kind)
  return `import { ${fnName} } from "../../define.js";

export const ${descriptor.exportName} = ${fnName}(${toTsLiteral(manifest, 0)});
`
}

export function renderStoryKitSetupSource(
  exportName: string,
  config: StoryKitStudioConfig,
): string {
  return `import type { StoryKitStudioConfig } from "../story-kit/index.js";

export const ${exportName} = ${toTsLiteral(config, 0)} satisfies StoryKitStudioConfig;
`
}
