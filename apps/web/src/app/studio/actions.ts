'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { StudioPackKind } from '@tokovo/packs'
import type { StoryKitStudioConfig } from '@tokovo/creator/story-kit'
import { updateStudioEpisodeConfig, updateStudioPack } from '@/lib/studio/service'

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing form field "${key}"`)
  }
  return value
}

function optionalJson<T>(formData: FormData, key: string): T | undefined {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim().length === 0) return undefined
  return JSON.parse(value) as T
}

export async function savePackAction(formData: FormData): Promise<void> {
  const kind = requiredString(formData, 'kind') as StudioPackKind
  const packId = requiredString(formData, 'packId')
  const manifest = JSON.parse(requiredString(formData, 'manifestJson')) as Parameters<
    typeof updateStudioPack
  >[2]

  updateStudioPack(kind, packId, manifest)
  revalidatePath('/studio')
  revalidatePath('/studio/packs')
  revalidatePath(`/studio/packs/${kind}/${packId}`)
  redirect(`/studio/packs/${kind}/${packId}`)
}

export async function saveEpisodeAction(formData: FormData): Promise<void> {
  const episodeId = requiredString(formData, 'episodeId')
  const config: StoryKitStudioConfig = {
    id: requiredString(formData, 'configId'),
    title: requiredString(formData, 'title'),
    packs: {
      personas: requiredString(formData, 'personaPackId'),
      assets: requiredString(formData, 'assetPackId'),
      styles: requiredString(formData, 'styleKitId'),
      devices: requiredString(formData, 'deviceKitId'),
    },
    background: optionalJson(formData, 'backgroundJson'),
    appThemeDefaults: optionalJson(formData, 'appThemeDefaultsJson'),
    cast: JSON.parse(requiredString(formData, 'castJson')) as StoryKitStudioConfig['cast'],
    devices: JSON.parse(
      requiredString(formData, 'devicesJson'),
    ) as StoryKitStudioConfig['devices'],
    notes:
      typeof formData.get('notes') === 'string' ? (formData.get('notes') as string) : undefined,
  }

  updateStudioEpisodeConfig(episodeId, config)
  revalidatePath('/studio')
  revalidatePath('/studio/episodes')
  revalidatePath(`/studio/episodes/${episodeId}`)
  redirect(`/studio/episodes/${episodeId}`)
}
