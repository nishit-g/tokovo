'use client'

import { useState } from 'react'
import type {
  CastEntry,
  StoryDeviceOverride,
  StoryKitStudioConfig,
} from '@tokovo/creator/story-kit'
import type {
  AssetBucketName,
  AssetPack,
  DeviceKit,
  PersonaPack,
  StyleKit,
  StudioPackKind,
} from '@tokovo/packs'
import { StudioCallout } from '@/components/studio/StudioChrome'

type KeyValueRow = {
  id: string
  key: string
  value: string
}

type AppStyleRow = {
  id: string
  appId: string
  valueJson: string
}

type EditableCastRow = {
  id: string
  role: string
  persona: string
  device: string
  name: string
  handle: string
  bio: string
  voice: string
  traits: string
  avatar: string
  appThemes: KeyValueRow[]
  appVisualModes: KeyValueRow[]
  advancedJson: string
}

type EditableDeviceRow = {
  id: string
  deviceId: string
  app: string
  profile: string
  installedApps: string
  homeScreen: string
  styleRef: string
  wallpaper: string
  screenRecording: boolean
  appThemes: KeyValueRow[]
  appVisualModes: KeyValueRow[]
  advancedJson: string
}

type EditablePersonaRow = {
  id: string
  personaId: string
  name: string
  handle: string
  bio: string
  avatar: string
  voice: string
  traits: string
  verified: boolean
  followerCount: string
  advancedJson: string
}

type EditableAssetBucket = Record<AssetBucketName, KeyValueRow[]>

type EditableStyleDeviceDefault = {
  id: string
  deviceId: string
  profile: string
  wallpaper: string
  homeScreen: string
  screenRecording: boolean
}

type EditableDeviceKitRow = {
  id: string
  deviceId: string
  profile: string
  installedApps: string
  homeScreen: string
  styleRef: string
  wallpaper: string
  screenRecording: boolean
}

function rowId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`
}

function mapToRows(value: Readonly<Record<string, string>> | undefined, prefix: string): KeyValueRow[] {
  return Object.entries(value ?? {}).map(([key, entryValue], index) => ({
    id: rowId(prefix, index),
    key,
    value: entryValue,
  }))
}

function appStylesToRows(
  value: Readonly<Record<string, Readonly<Record<string, string | number | boolean>>>> | undefined,
  prefix: string,
): AppStyleRow[] {
  return Object.entries(value ?? {}).map(([appId, style], index) => ({
    id: rowId(prefix, index),
    appId,
    valueJson: JSON.stringify(style, null, 2),
  }))
}

function rowsToMap(rows: KeyValueRow[]): Record<string, string> | undefined {
  const entries = rows
    .map((row) => [row.key.trim(), row.value.trim()] as const)
    .filter(([key, value]) => key.length > 0 && value.length > 0)
  if (entries.length === 0) return undefined
  return Object.fromEntries(entries)
}

function parseJsonObject(
  raw: string,
  label: string,
): { value?: Record<string, unknown>; error?: string } {
  if (!raw.trim()) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { error: `${label} must be a JSON object.` }
    }
    return { value: parsed as Record<string, unknown> }
  } catch {
    return { error: `${label} contains invalid JSON.` }
  }
}

function parseStyleRows(rows: AppStyleRow[]): {
  value?: Record<string, Record<string, string | number | boolean>>
  errors: string[]
} {
  const errors: string[] = []
  const entries: [string, Record<string, string | number | boolean>][] = []

  for (const row of rows) {
    const appId = row.appId.trim()
    if (!appId && !row.valueJson.trim()) continue
    if (!appId) {
      errors.push('App style rows need an app id.')
      continue
    }
    try {
      const parsed = JSON.parse(row.valueJson) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        errors.push(`App style "${appId}" must be a JSON object.`)
        continue
      }
      entries.push([appId, parsed as Record<string, string | number | boolean>])
    } catch {
      errors.push(`App style "${appId}" contains invalid JSON.`)
    }
  }

  return {
    value: entries.length > 0 ? Object.fromEntries(entries) : undefined,
    errors,
  }
}

function splitCsv(value: string): string[] | undefined {
  const items = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
  return items.length > 0 ? items : undefined
}

function compactObject<T extends Record<string, unknown>>(value: T): Partial<T> | undefined {
  const entries = Object.entries(value).filter(([, entryValue]) => {
    if (entryValue === undefined) return false
    if (typeof entryValue === 'string') return entryValue.trim().length > 0
    if (Array.isArray(entryValue)) return entryValue.length > 0
    return true
  })
  if (entries.length === 0) return undefined
  return Object.fromEntries(entries) as Partial<T>
}

function formSectionTitle(title: string, detail: string) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-sm leading-6 text-slate-600">{detail}</div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  type?: 'text' | 'number'
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-0"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  minHeight = 120,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  minHeight?: number
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ minHeight }}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-0"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly string[]
}) {
  return (
    <label className="block">
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-900 focus:ring-0"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-sm font-medium text-slate-950">{label}</div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
      />
    </label>
  )
}

function KeyValueEditor({
  title,
  rows,
  onChange,
  addLabel = 'Add row',
  keyLabel = 'Key',
  valueLabel = 'Value',
}: {
  title: string
  rows: KeyValueRow[]
  onChange: (rows: KeyValueRow[]) => void
  addLabel?: string
  keyLabel?: string
  valueLabel?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-950">{title}</div>
        <button
          type="button"
          onClick={() =>
            onChange([...rows, { id: rowId('kv', rows.length), key: '', value: '' }])
          }
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="text-sm text-slate-500">No entries yet.</div>
        ) : (
          rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <InputField
                label={`${keyLabel} ${index + 1}`}
                value={row.key}
                onChange={(value) =>
                  onChange(rows.map((entry) => (entry.id === row.id ? { ...entry, key: value } : entry)))
                }
              />
              <InputField
                label={`${valueLabel} ${index + 1}`}
                value={row.value}
                onChange={(value) =>
                  onChange(rows.map((entry) => (entry.id === row.id ? { ...entry, value } : entry)))
                }
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onChange(rows.filter((entry) => entry.id !== row.id))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AppStyleEditor({
  rows,
  onChange,
}: {
  rows: AppStyleRow[]
  onChange: (rows: AppStyleRow[]) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-950">App styles</div>
        <button
          type="button"
          onClick={() => onChange([...rows, { id: rowId('style', rows.length), appId: '', valueJson: '{}' }])}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          Add style override
        </button>
      </div>
      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="text-sm text-slate-500">No app styles configured.</div>
        ) : (
          rows.map((row, index) => (
            <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <InputField
                  label={`App id ${index + 1}`}
                  value={row.appId}
                  onChange={(value) =>
                    onChange(rows.map((entry) => (entry.id === row.id ? { ...entry, appId: value } : entry)))
                  }
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => onChange(rows.filter((entry) => entry.id !== row.id))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <TextAreaField
                  label="Style JSON"
                  value={row.valueJson}
                  onChange={(value) =>
                    onChange(rows.map((entry) => (entry.id === row.id ? { ...entry, valueJson: value } : entry)))
                  }
                  minHeight={120}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function episodeCastRowFromConfig(role: string, entry: CastEntry, index: number): EditableCastRow {
  const advanced: Record<string, unknown> = {}
  if (entry.appOverrides) advanced.appOverrides = entry.appOverrides
  if (entry.styleOverrides?.appStyles) {
    advanced.styleOverrides = { appStyles: entry.styleOverrides.appStyles }
  }
  return {
    id: rowId('cast', index),
    role,
    persona: entry.persona,
    device: entry.device ?? '',
    name: entry.overrides?.name ?? '',
    handle: entry.overrides?.handle ?? '',
    bio: entry.overrides?.bio ?? '',
    voice: entry.overrides?.voice ?? '',
    traits: (entry.overrides?.traits ?? []).join(', '),
    avatar: entry.assetOverrides?.avatar ?? '',
    appThemes: mapToRows(entry.styleOverrides?.appThemes, `cast-theme-${index}`),
    appVisualModes: mapToRows(entry.styleOverrides?.appVisualModes, `cast-visual-${index}`),
    advancedJson: Object.keys(advanced).length > 0 ? JSON.stringify(advanced, null, 2) : '',
  }
}

function episodeDeviceRowFromConfig(
  deviceId: string,
  entry: StoryDeviceOverride,
  index: number,
): EditableDeviceRow {
  const advanced: Record<string, unknown> = {}
  if (entry.styleOverrides?.appStyles) {
    advanced.styleOverrides = { appStyles: entry.styleOverrides.appStyles }
  }
  return {
    id: rowId('device', index),
    deviceId,
    app: entry.app ?? '',
    profile: entry.profile ?? '',
    installedApps: (entry.installedApps ?? []).join(', '),
    homeScreen: typeof entry.homeScreen === 'string' ? entry.homeScreen : '',
    styleRef: entry.styleRef ?? '',
    wallpaper: entry.wallpaper ?? '',
    screenRecording: Boolean(entry.screenRecording),
    appThemes: mapToRows(entry.styleOverrides?.appThemes, `device-theme-${index}`),
    appVisualModes: mapToRows(entry.styleOverrides?.appVisualModes, `device-visual-${index}`),
    advancedJson: Object.keys(advanced).length > 0 ? JSON.stringify(advanced, null, 2) : '',
  }
}

export function StudioEpisodeSetupEditor({
  config,
  packOptions,
  personaIds,
  avatarAliases,
  deviceIds,
  appIds,
}: {
  config: StoryKitStudioConfig
  packOptions: {
    personas: readonly string[]
    assets: readonly string[]
    styles: readonly string[]
    devices: readonly string[]
  }
  personaIds: readonly string[]
  avatarAliases: readonly string[]
  deviceIds: readonly string[]
  appIds: readonly string[]
}) {
  const [configId, setConfigId] = useState(config.id)
  const [title, setTitle] = useState(config.title)
  const [personaPackId, setPersonaPackId] = useState(config.packs.personas ?? '')
  const [assetPackId, setAssetPackId] = useState(config.packs.assets ?? '')
  const [styleKitId, setStyleKitId] = useState(config.packs.styles ?? '')
  const [deviceKitId, setDeviceKitId] = useState(config.packs.devices ?? '')
  const [backgroundType, setBackgroundType] = useState(
    config.background && typeof config.background === 'object' && 'type' in config.background
      ? String(config.background.type ?? '')
      : 'image',
  )
  const [backgroundSrc, setBackgroundSrc] = useState(
    config.background && typeof config.background === 'object' && 'src' in config.background
      ? String(config.background.src ?? '')
      : '',
  )
  const [themeDefaults, setThemeDefaults] = useState(
    mapToRows(config.appThemeDefaults, 'episode-theme'),
  )
  const [castRows, setCastRows] = useState(
    Object.entries(config.cast).map(([role, entry], index) => episodeCastRowFromConfig(role, entry, index)),
  )
  const [deviceRows, setDeviceRows] = useState(
    Object.entries(config.devices).map(([deviceId, entry], index) =>
      episodeDeviceRowFromConfig(deviceId, entry, index),
    ),
  )
  const [notes, setNotes] = useState(config.notes ?? '')

  const errors: string[] = []

  const castEntries: [string, CastEntry][] = []
  for (const row of castRows) {
    const role = row.role.trim()
    const persona = row.persona.trim()
    if (!role && !persona) continue
    if (!role || !persona) {
      errors.push('Each cast row needs both a role and a persona.')
      continue
    }
    const parsedAdvanced = parseJsonObject(row.advancedJson, `Advanced cast JSON for ${role}`)
    if (parsedAdvanced.error) errors.push(parsedAdvanced.error)

    const overrides = compactObject({
      name: row.name,
      handle: row.handle,
      bio: row.bio,
      voice: row.voice,
      traits: splitCsv(row.traits),
    })
    const styleOverrides: Record<string, unknown> = {}
    const appThemes = rowsToMap(row.appThemes)
    if (appThemes) styleOverrides.appThemes = appThemes
    const appVisualModes = rowsToMap(row.appVisualModes)
    if (appVisualModes) styleOverrides.appVisualModes = appVisualModes

    const entry: CastEntry = {
      persona,
      ...(row.device.trim() ? { device: row.device.trim() } : {}),
      ...(overrides ? { overrides } : {}),
      ...(row.avatar.trim() ? { assetOverrides: { avatar: row.avatar.trim() } } : {}),
      ...(Object.keys(styleOverrides).length > 0 ? { styleOverrides } : {}),
    }

    if (parsedAdvanced.value) {
      const merged = {
        ...entry,
        ...parsedAdvanced.value,
        styleOverrides: {
          ...(entry.styleOverrides ?? {}),
          ...((parsedAdvanced.value.styleOverrides as Record<string, unknown> | undefined) ?? {}),
        },
      }
      castEntries.push([role, merged as CastEntry])
    } else {
      castEntries.push([role, entry])
    }
  }

  const deviceEntries: [string, StoryDeviceOverride][] = []
  for (const row of deviceRows) {
    const deviceId = row.deviceId.trim()
    if (!deviceId) continue
    const parsedAdvanced = parseJsonObject(row.advancedJson, `Advanced device JSON for ${deviceId}`)
    if (parsedAdvanced.error) errors.push(parsedAdvanced.error)

    const styleOverrides: Record<string, unknown> = {}
    const appThemes = rowsToMap(row.appThemes)
    if (appThemes) styleOverrides.appThemes = appThemes
    const appVisualModes = rowsToMap(row.appVisualModes)
    if (appVisualModes) styleOverrides.appVisualModes = appVisualModes

    const entry: StoryDeviceOverride = {
      ...(row.app.trim() ? { app: row.app.trim() } : {}),
      ...(row.profile.trim() ? { profile: row.profile.trim() } : {}),
      ...(splitCsv(row.installedApps) ? { installedApps: splitCsv(row.installedApps) } : {}),
      ...(row.homeScreen.trim()
        ? { homeScreen: row.homeScreen.trim() as unknown as StoryDeviceOverride['homeScreen'] }
        : {}),
      ...(row.styleRef.trim() ? { styleRef: row.styleRef.trim() } : {}),
      ...(row.wallpaper.trim() ? { wallpaper: row.wallpaper.trim() } : {}),
      screenRecording: row.screenRecording,
      ...(Object.keys(styleOverrides).length > 0 ? { styleOverrides } : {}),
    }

    if (parsedAdvanced.value) {
      const merged = {
        ...entry,
        ...parsedAdvanced.value,
        styleOverrides: {
          ...(entry.styleOverrides ?? {}),
          ...((parsedAdvanced.value.styleOverrides as Record<string, unknown> | undefined) ?? {}),
        },
      }
      deviceEntries.push([deviceId, merged as StoryDeviceOverride])
    } else {
      deviceEntries.push([deviceId, entry])
    }
  }

  const background =
    backgroundSrc.trim().length > 0
      ? ({ type: backgroundType.trim() || 'image', src: backgroundSrc.trim() } as StoryKitStudioConfig['background'])
      : undefined

  const castJson = JSON.stringify(Object.fromEntries(castEntries), null, 2)
  const devicesJson = JSON.stringify(Object.fromEntries(deviceEntries), null, 2)
  const backgroundJson = background ? JSON.stringify(background, null, 2) : ''
  const appThemeDefaultsJson = JSON.stringify(rowsToMap(themeDefaults) ?? {}, null, 2)

  return (
    <div className="space-y-6">
      {errors.length > 0 ? (
        <StudioCallout tone="amber">
          {errors.join(' ')}
        </StudioCallout>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="episodeId" value={config.id} />
        <InputField label="Config id" value={configId} onChange={setConfigId} />
        <input type="hidden" name="configId" value={configId} />
        <InputField label="Title" value={title} onChange={setTitle} />
        <input type="hidden" name="title" value={title} />
        <SelectField label="Persona pack" value={personaPackId} onChange={setPersonaPackId} options={packOptions.personas} />
        <input type="hidden" name="personaPackId" value={personaPackId} />
        <SelectField label="Asset pack" value={assetPackId} onChange={setAssetPackId} options={packOptions.assets} />
        <input type="hidden" name="assetPackId" value={assetPackId} />
        <SelectField label="Style kit" value={styleKitId} onChange={setStyleKitId} options={packOptions.styles} />
        <input type="hidden" name="styleKitId" value={styleKitId} />
        <SelectField label="Device kit" value={deviceKitId} onChange={setDeviceKitId} options={packOptions.devices} />
        <input type="hidden" name="deviceKitId" value={deviceKitId} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {formSectionTitle('Background', 'Keep this structured for the common image-backed episode case.')}
            <div className="grid gap-4">
              <InputField label="Background type" value={backgroundType} onChange={setBackgroundType} />
              <InputField label="Background src" value={backgroundSrc} onChange={setBackgroundSrc} />
            </div>
            <input type="hidden" name="backgroundJson" value={backgroundJson} />
          </div>

          <KeyValueEditor
            title="App theme defaults"
            rows={themeDefaults}
            onChange={setThemeDefaults}
            addLabel="Add default"
            keyLabel="App id"
            valueLabel="Theme"
          />
          <input type="hidden" name="appThemeDefaultsJson" value={appThemeDefaultsJson} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {formSectionTitle('Notes', 'Operator-facing notes for this setup sidecar.')}
            <TextAreaField label="Notes" value={notes} onChange={setNotes} minHeight={120} />
            <input type="hidden" name="notes" value={notes} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {formSectionTitle('Cast directory', 'Edit roles, persona bindings, human-readable overrides, and avatar assignments without touching JSON.')}
            <div className="space-y-4">
              {castRows.map((row, index) => (
                <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-950">Actor {index + 1}</div>
                    <button
                      type="button"
                      onClick={() => setCastRows(castRows.filter((entry) => entry.id !== row.id))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                    >
                      Remove actor
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Role"
                      value={row.role}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, role: value } : entry)))
                      }
                    />
                    <SelectField
                      label="Persona"
                      value={row.persona}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, persona: value } : entry)))
                      }
                      options={personaIds}
                    />
                    <SelectField
                      label="Assigned device"
                      value={row.device}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, device: value } : entry)))
                      }
                      options={['', ...deviceIds]}
                    />
                    <SelectField
                      label="Avatar asset"
                      value={row.avatar}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, avatar: value } : entry)))
                      }
                      options={['', ...avatarAliases]}
                    />
                    <InputField
                      label="Name override"
                      value={row.name}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, name: value } : entry)))
                      }
                    />
                    <InputField
                      label="Handle override"
                      value={row.handle}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, handle: value } : entry)))
                      }
                    />
                    <InputField
                      label="Voice"
                      value={row.voice}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, voice: value } : entry)))
                      }
                    />
                    <InputField
                      label="Traits"
                      value={row.traits}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, traits: value } : entry)))
                      }
                      placeholder="comma, separated, values"
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Bio override"
                      value={row.bio}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, bio: value } : entry)))
                      }
                      minHeight={100}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <KeyValueEditor
                      title="App themes"
                      rows={row.appThemes}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, appThemes: value } : entry)))
                      }
                      keyLabel="App id"
                      valueLabel="Theme"
                    />
                    <KeyValueEditor
                      title="Visual modes"
                      rows={row.appVisualModes}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, appVisualModes: value } : entry)))
                      }
                      keyLabel="App id"
                      valueLabel="Mode"
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Advanced JSON"
                      value={row.advancedJson}
                      onChange={(value) =>
                        setCastRows(castRows.map((entry) => (entry.id === row.id ? { ...entry, advancedJson: value } : entry)))
                      }
                      minHeight={120}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setCastRows([
                  ...castRows,
                  {
                    id: rowId('cast', castRows.length),
                    role: '',
                    persona: personaIds[0] ?? '',
                    device: '',
                    name: '',
                    handle: '',
                    bio: '',
                    voice: '',
                    traits: '',
                    avatar: '',
                    appThemes: [],
                    appVisualModes: [],
                    advancedJson: '',
                  },
                ])
              }
              className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Add actor
            </button>
            <input type="hidden" name="castJson" value={castJson} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {formSectionTitle('Device setup', 'Logical devices stay structured here so episodes stop hand-assembling render setup repeatedly.')}
            <div className="space-y-4">
              {deviceRows.map((row, index) => (
                <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-950">Device {index + 1}</div>
                    <button
                      type="button"
                      onClick={() => setDeviceRows(deviceRows.filter((entry) => entry.id !== row.id))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                    >
                      Remove device
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Device id"
                      value={row.deviceId}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, deviceId: value } : entry)))
                      }
                    />
                    <SelectField
                      label="Primary app"
                      value={row.app}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, app: value } : entry)))
                      }
                      options={['', ...appIds]}
                    />
                    <InputField
                      label="Profile"
                      value={row.profile}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, profile: value } : entry)))
                      }
                    />
                    <InputField
                      label="Installed apps"
                      value={row.installedApps}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, installedApps: value } : entry)))
                      }
                      placeholder="app_whatsapp, app_x"
                    />
                    <InputField
                      label="Home screen"
                      value={row.homeScreen}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, homeScreen: value } : entry)))
                      }
                    />
                    <InputField
                      label="Style ref"
                      value={row.styleRef}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, styleRef: value } : entry)))
                      }
                    />
                    <InputField
                      label="Wallpaper"
                      value={row.wallpaper}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, wallpaper: value } : entry)))
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <ToggleField
                      label="Screen recording"
                      checked={row.screenRecording}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, screenRecording: value } : entry)))
                      }
                    />
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <KeyValueEditor
                      title="App themes"
                      rows={row.appThemes}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, appThemes: value } : entry)))
                      }
                      keyLabel="App id"
                      valueLabel="Theme"
                    />
                    <KeyValueEditor
                      title="Visual modes"
                      rows={row.appVisualModes}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, appVisualModes: value } : entry)))
                      }
                      keyLabel="App id"
                      valueLabel="Mode"
                    />
                  </div>

                  <div className="mt-4">
                    <TextAreaField
                      label="Advanced JSON"
                      value={row.advancedJson}
                      onChange={(value) =>
                        setDeviceRows(deviceRows.map((entry) => (entry.id === row.id ? { ...entry, advancedJson: value } : entry)))
                      }
                      minHeight={120}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setDeviceRows([
                  ...deviceRows,
                  {
                    id: rowId('device', deviceRows.length),
                    deviceId: '',
                    app: '',
                    profile: '',
                    installedApps: '',
                    homeScreen: '',
                    styleRef: '',
                    wallpaper: '',
                    screenRecording: false,
                    appThemes: [],
                    appVisualModes: [],
                    advancedJson: '',
                  },
                ])
              }
              className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Add device
            </button>
            <input type="hidden" name="devicesJson" value={devicesJson} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={errors.length > 0}
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Save Episode Setup
      </button>
    </div>
  )
}

function personaRowsFromManifest(manifest: PersonaPack): EditablePersonaRow[] {
  return Object.values(manifest.personas).map((persona, index) => ({
    id: rowId('persona', index),
    personaId: persona.id,
    name: persona.name,
    handle: persona.handle,
    bio: persona.bio,
    avatar: persona.avatar,
    voice: persona.voice ?? '',
    traits: (persona.traits ?? []).join(', '),
    verified: Boolean((persona.defaultAppMetadata?.app_x as { verified?: boolean } | undefined)?.verified),
    followerCount: String(
      (persona.defaultAppMetadata?.app_x as { followerCount?: number } | undefined)?.followerCount ?? '',
    ),
    advancedJson: '',
  }))
}

export function StudioPackManifestEditor({
  kind,
  manifest,
}: {
  kind: StudioPackKind
  manifest: PersonaPack | AssetPack | StyleKit | DeviceKit
}) {
  const [packId, setPackId] = useState(manifest.id)
  const [name, setName] = useState(manifest.name)
  const [version, setVersion] = useState(manifest.version ?? '')

  const [personaRows, setPersonaRows] = useState(
    kind === 'personas' ? personaRowsFromManifest(manifest as PersonaPack) : [],
  )
  const [assetRows, setAssetRows] = useState<EditableAssetBucket>(
    kind === 'assets'
      ? {
          avatars: mapToRows((manifest as AssetPack).assets.avatars, 'asset-avatars'),
          wallpapers: mapToRows((manifest as AssetPack).assets.wallpapers, 'asset-wallpapers'),
          backgrounds: mapToRows((manifest as AssetPack).assets.backgrounds, 'asset-backgrounds'),
          media: mapToRows((manifest as AssetPack).assets.media, 'asset-media'),
          maps: mapToRows((manifest as AssetPack).assets.maps, 'asset-maps'),
          docs: mapToRows((manifest as AssetPack).assets.docs, 'asset-docs'),
          stickers: mapToRows((manifest as AssetPack).assets.stickers, 'asset-stickers'),
          linkPreviewImages: mapToRows(
            (manifest as AssetPack).assets.linkPreviewImages,
            'asset-links',
          ),
          profileBanners: mapToRows(
            (manifest as AssetPack).assets.profileBanners,
            'asset-banners',
          ),
        }
      : {
          avatars: [],
          wallpapers: [],
          backgrounds: [],
          media: [],
          maps: [],
          docs: [],
          stickers: [],
          linkPreviewImages: [],
          profileBanners: [],
        },
  )
  const [styleBackground, setStyleBackground] = useState(
    kind === 'styles' ? String((manifest as StyleKit).background ?? '') : '',
  )
  const [styleDeviceDefaults, setStyleDeviceDefaults] = useState(
    kind === 'styles'
      ? Object.entries((manifest as StyleKit).deviceDefaults ?? {}).map(([deviceId, entry], index) => ({
          id: rowId('style-device', index),
          deviceId,
          profile: entry.profile ?? '',
          wallpaper: entry.wallpaper ?? '',
          homeScreen: typeof entry.homeScreen === 'string' ? entry.homeScreen : '',
          screenRecording: Boolean(entry.screenRecording),
        }))
      : [],
  )
  const [styleThemes, setStyleThemes] = useState(
    kind === 'styles' ? mapToRows((manifest as StyleKit).appThemes, 'style-theme') : [],
  )
  const [styleVisualModes, setStyleVisualModes] = useState(
    kind === 'styles' ? mapToRows((manifest as StyleKit).appVisualModes, 'style-visual') : [],
  )
  const [styleAppStyles, setStyleAppStyles] = useState(
    kind === 'styles' ? appStylesToRows((manifest as StyleKit).appStyles, 'style-app') : [],
  )
  const [deviceKitRows, setDeviceKitRows] = useState(
    kind === 'devices'
      ? Object.entries((manifest as DeviceKit).devices).map(([deviceId, entry], index) => ({
          id: rowId('device-kit', index),
          deviceId,
          profile: entry.profile,
          installedApps: (entry.installedApps ?? []).join(', '),
          homeScreen: typeof entry.homeScreen === 'string' ? entry.homeScreen : '',
          styleRef: entry.styleRef ?? '',
          wallpaper: entry.wallpaper ?? '',
          screenRecording: Boolean(entry.screenRecording),
        }))
      : [],
  )

  const errors: string[] = []

  let manifestValue: PersonaPack | AssetPack | StyleKit | DeviceKit

  if (kind === 'personas') {
    const personas = Object.fromEntries(
      personaRows
        .filter((row) => row.personaId.trim())
        .map((row) => {
          const advanced = parseJsonObject(row.advancedJson, `Advanced persona JSON for ${row.personaId}`)
          if (advanced.error) errors.push(advanced.error)
          const appXMetadata = compactObject({
            verified: row.verified,
            followerCount: row.followerCount.trim() ? Number(row.followerCount) : undefined,
          })
          const persona = {
            id: row.personaId.trim(),
            name: row.name.trim(),
            handle: row.handle.trim(),
            bio: row.bio.trim(),
            avatar: row.avatar.trim(),
            ...(row.voice.trim() ? { voice: row.voice.trim() } : {}),
            ...(splitCsv(row.traits) ? { traits: splitCsv(row.traits) } : {}),
            ...(appXMetadata
              ? {
                  defaultAppMetadata: {
                    app_x: appXMetadata,
                  },
                }
              : {}),
            ...(advanced.value ?? {}),
          }
          return [row.personaId.trim(), persona]
        }),
    ) as PersonaPack['personas']
    manifestValue = {
      id: packId.trim(),
      name: name.trim(),
      ...(version.trim() ? { version: version.trim() } : {}),
      personas,
    }
  } else if (kind === 'assets') {
    manifestValue = {
      id: packId.trim(),
      name: name.trim(),
      ...(version.trim() ? { version: version.trim() } : {}),
      assets: {
        avatars: rowsToMap(assetRows.avatars) ?? {},
        wallpapers: rowsToMap(assetRows.wallpapers) ?? {},
        backgrounds: rowsToMap(assetRows.backgrounds) ?? {},
        media: rowsToMap(assetRows.media) ?? {},
        maps: rowsToMap(assetRows.maps) ?? {},
        docs: rowsToMap(assetRows.docs) ?? {},
        stickers: rowsToMap(assetRows.stickers) ?? {},
        linkPreviewImages: rowsToMap(assetRows.linkPreviewImages) ?? {},
        profileBanners: rowsToMap(assetRows.profileBanners) ?? {},
      },
    }
  } else if (kind === 'styles') {
    const appStyles = parseStyleRows(styleAppStyles)
    errors.push(...appStyles.errors)
    const deviceDefaultsEntries = styleDeviceDefaults
      .filter((row) => row.deviceId.trim())
      .map((row) => {
        const deviceValue = compactObject({
          profile: row.profile,
          wallpaper: row.wallpaper,
          homeScreen: row.homeScreen as unknown,
          screenRecording: row.screenRecording,
        })
        if (!deviceValue) return undefined
        return [row.deviceId.trim(), deviceValue] as const
      })
      .filter(Boolean) as readonly (readonly [string, NonNullable<ReturnType<typeof compactObject>>])[]
    manifestValue = {
      id: packId.trim(),
      name: name.trim(),
      ...(version.trim() ? { version: version.trim() } : {}),
      ...(styleBackground.trim() ? { background: styleBackground.trim() } : {}),
      deviceDefaults: Object.fromEntries(deviceDefaultsEntries) as unknown as StyleKit['deviceDefaults'],
      ...(rowsToMap(styleThemes) ? { appThemes: rowsToMap(styleThemes) } : {}),
      ...(rowsToMap(styleVisualModes) ? { appVisualModes: rowsToMap(styleVisualModes) } : {}),
      ...(appStyles.value ? { appStyles: appStyles.value } : {}),
    }
  } else {
    const deviceEntriesForKit = deviceKitRows
      .filter((row) => row.deviceId.trim())
      .map((row) => {
        const deviceValue = compactObject({
          profile: row.profile,
          installedApps: splitCsv(row.installedApps),
          homeScreen: row.homeScreen as unknown,
          styleRef: row.styleRef,
          wallpaper: row.wallpaper,
          screenRecording: row.screenRecording,
        })
        if (!deviceValue) return undefined
        return [row.deviceId.trim(), deviceValue] as const
      })
      .filter(Boolean) as readonly (readonly [string, NonNullable<ReturnType<typeof compactObject>>])[]
    manifestValue = {
      id: packId.trim(),
      name: name.trim(),
      ...(version.trim() ? { version: version.trim() } : {}),
      devices: Object.fromEntries(deviceEntriesForKit) as unknown as DeviceKit['devices'],
    }
  }

  return (
    <div className="space-y-6">
      {errors.length > 0 ? <StudioCallout tone="amber">{errors.join(' ')}</StudioCallout> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <InputField label="Pack id" value={packId} onChange={setPackId} />
        <InputField label="Name" value={name} onChange={setName} />
        <InputField label="Version" value={version} onChange={setVersion} />
      </div>

      {kind === 'personas' ? (
        <div className="space-y-4">
          {personaRows.map((row, index) => (
            <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-950">Persona {index + 1}</div>
                <button
                  type="button"
                  onClick={() => setPersonaRows(personaRows.filter((entry) => entry.id !== row.id))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                >
                  Remove persona
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField label="Persona id" value={row.personaId} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, personaId: value } : entry))} />
                <InputField label="Name" value={row.name} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, name: value } : entry))} />
                <InputField label="Handle" value={row.handle} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, handle: value } : entry))} />
                <InputField label="Avatar path" value={row.avatar} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, avatar: value } : entry))} />
                <InputField label="Voice" value={row.voice} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, voice: value } : entry))} />
                <InputField label="Traits" value={row.traits} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, traits: value } : entry))} placeholder="comma, separated, traits" />
                <InputField label="Follower count" value={row.followerCount} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, followerCount: value } : entry))} type="number" />
              </div>
              <div className="mt-4">
                <TextAreaField label="Bio" value={row.bio} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, bio: value } : entry))} minHeight={100} />
              </div>
              <div className="mt-4">
                <ToggleField label="Verified on X" checked={row.verified} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, verified: value } : entry))} />
              </div>
              <div className="mt-4">
                <TextAreaField label="Advanced JSON" value={row.advancedJson} onChange={(value) => setPersonaRows(personaRows.map((entry) => entry.id === row.id ? { ...entry, advancedJson: value } : entry))} minHeight={120} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setPersonaRows([
                ...personaRows,
                {
                  id: rowId('persona', personaRows.length),
                  personaId: '',
                  name: '',
                  handle: '',
                  bio: '',
                  avatar: '',
                  voice: '',
                  traits: '',
                  verified: false,
                  followerCount: '',
                  advancedJson: '',
                },
              ])
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Add persona
          </button>
        </div>
      ) : null}

      {kind === 'assets' ? (
        <div className="space-y-4">
          {(Object.keys(assetRows) as AssetBucketName[]).map((bucket) => (
            <KeyValueEditor
              key={bucket}
              title={bucket}
              rows={assetRows[bucket]}
              onChange={(rows) => setAssetRows({ ...assetRows, [bucket]: rows })}
              addLabel={`Add ${bucket}`}
              keyLabel="Alias"
              valueLabel="Path"
            />
          ))}
        </div>
      ) : null}

      {kind === 'styles' ? (
        <div className="space-y-4">
          <InputField label="Background path" value={styleBackground} onChange={setStyleBackground} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {formSectionTitle('Device defaults', 'Override wallpaper, profile, or home-screen defaults per logical device.')}
            <div className="space-y-4">
              {styleDeviceDefaults.map((row, index) => (
                <div key={row.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-950">Device default {index + 1}</div>
                    <button
                      type="button"
                      onClick={() => setStyleDeviceDefaults(styleDeviceDefaults.filter((entry) => entry.id !== row.id))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField label="Device id" value={row.deviceId} onChange={(value) => setStyleDeviceDefaults(styleDeviceDefaults.map((entry) => entry.id === row.id ? { ...entry, deviceId: value } : entry))} />
                    <InputField label="Profile" value={row.profile} onChange={(value) => setStyleDeviceDefaults(styleDeviceDefaults.map((entry) => entry.id === row.id ? { ...entry, profile: value } : entry))} />
                    <InputField label="Wallpaper" value={row.wallpaper} onChange={(value) => setStyleDeviceDefaults(styleDeviceDefaults.map((entry) => entry.id === row.id ? { ...entry, wallpaper: value } : entry))} />
                    <InputField label="Home screen" value={row.homeScreen} onChange={(value) => setStyleDeviceDefaults(styleDeviceDefaults.map((entry) => entry.id === row.id ? { ...entry, homeScreen: value } : entry))} />
                  </div>
                  <div className="mt-4">
                    <ToggleField label="Screen recording" checked={row.screenRecording} onChange={(value) => setStyleDeviceDefaults(styleDeviceDefaults.map((entry) => entry.id === row.id ? { ...entry, screenRecording: value } : entry))} />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setStyleDeviceDefaults([
                  ...styleDeviceDefaults,
                  { id: rowId('style-device', styleDeviceDefaults.length), deviceId: '', profile: '', wallpaper: '', homeScreen: '', screenRecording: false },
                ])
              }
              className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Add device default
            </button>
          </div>
          <KeyValueEditor title="App themes" rows={styleThemes} onChange={setStyleThemes} keyLabel="App id" valueLabel="Theme" />
          <KeyValueEditor title="Visual modes" rows={styleVisualModes} onChange={setStyleVisualModes} keyLabel="App id" valueLabel="Mode" />
          <AppStyleEditor rows={styleAppStyles} onChange={setStyleAppStyles} />
        </div>
      ) : null}

      {kind === 'devices' ? (
        <div className="space-y-4">
          {deviceKitRows.map((row, index) => (
            <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-950">Device {index + 1}</div>
                <button
                  type="button"
                  onClick={() => setDeviceKitRows(deviceKitRows.filter((entry) => entry.id !== row.id))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-200 hover:text-red-600"
                >
                  Remove device
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField label="Device id" value={row.deviceId} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, deviceId: value } : entry))} />
                <InputField label="Profile" value={row.profile} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, profile: value } : entry))} />
                <InputField label="Installed apps" value={row.installedApps} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, installedApps: value } : entry))} placeholder="app_whatsapp, app_x" />
                <InputField label="Home screen" value={row.homeScreen} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, homeScreen: value } : entry))} />
                <InputField label="Style ref" value={row.styleRef} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, styleRef: value } : entry))} />
                <InputField label="Wallpaper" value={row.wallpaper} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, wallpaper: value } : entry))} />
              </div>
              <div className="mt-4">
                <ToggleField label="Screen recording" checked={row.screenRecording} onChange={(value) => setDeviceKitRows(deviceKitRows.map((entry) => entry.id === row.id ? { ...entry, screenRecording: value } : entry))} />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setDeviceKitRows([
                ...deviceKitRows,
                {
                  id: rowId('device-kit', deviceKitRows.length),
                  deviceId: '',
                  profile: '',
                  installedApps: '',
                  homeScreen: '',
                  styleRef: '',
                  wallpaper: '',
                  screenRecording: false,
                },
              ])
            }
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Add device
          </button>
        </div>
      ) : null}

      <input type="hidden" name="manifestJson" value={JSON.stringify(manifestValue, null, 2)} />
      <button
        type="submit"
        disabled={errors.length > 0}
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Save Pack
      </button>
    </div>
  )
}
