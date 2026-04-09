import { describe, expect, it } from 'vitest'
import { getStudioEpisodeDetail, getStudioPackDetail, listStudioEpisodes, listStudioPacks } from './service'
import { renderPackSource, renderStoryKitSetupSource } from './serialize'

describe('studio service', () => {
  it('lists starter packs and story-kit episodes', () => {
    const packs = listStudioPacks()
    const episodes = listStudioEpisodes()

    expect(packs.some((pack) => pack.id === 'startup-chaos')).toBe(true)
    expect(episodes.some((episode) => episode.id === 'mega-x')).toBe(true)
  })

  it('resolves pack detail with validation output', () => {
    const detail = getStudioPackDetail('personas', 'startup-chaos')
    expect(detail.name).toBe('Startup Chaos')
    expect(detail.exportName).toBe('startupChaosPersonaPack')
    expect(detail.validationErrors.every((error) => error.includes('Missing avatar file'))).toBe(
      true,
    )
  })

  it('resolves story-kit episode previews', () => {
    const detail = getStudioEpisodeDetail('mega-x')
    expect(detail.preview.actors.some((actor) => actor.role === 'founder')).toBe(true)
    expect(detail.preview.devices.some((device) => device.id === 'main_phone')).toBe(true)
  })

  it('renders canonical TS sources for packs and story-kit setup files', () => {
    const packDetail = getStudioPackDetail('assets', 'social-assets-v1')
    const episodeDetail = getStudioEpisodeDetail('mega-x')

    expect(renderPackSource(packDetail, packDetail.manifest)).toContain(
      'export const socialAssetsV1 = defineAssetPack(',
    )
    expect(
      renderStoryKitSetupSource(episodeDetail.exportName, episodeDetail.config),
    ).toContain('satisfies StoryKitStudioConfig')
  })
})
