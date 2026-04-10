import { prepareTrackEpisode } from '@tokovo/compiler'
import { WhatsAppPlugin } from '@tokovo/apps-whatsapp'
import { XPlugin } from '@tokovo/apps-x'
import { LinkedInPlugin } from '@tokovo/apps-linkedin'
import { InstagramPlugin } from '@tokovo/apps-instagram'
import { SnapchatPlugin } from '@tokovo/apps-snapchat'
import { TeamsPlugin } from '@tokovo/apps-teams'
import { TypewriterPlugin } from '@tokovo/apps-typewriter'
import { IMessagePlugin } from '@tokovo/apps-imessage'
import storyEpisodes from './stories/index.js'
import appShowcaseEpisodes from './showcases/apps/index.js'
import systemShowcaseEpisodes from './showcases/system/index.js'
import {
  legacyProductionEpisodes,
  legacyShowcaseEpisodes,
} from './legacy/index.js'
import testEpisodes from './tests/index.js'
import { createEpisodeRegistry } from './registry/index.js'
import { validateEpisodeForRegistry } from './registry/episode-registry.js'
import v2Episodes from './v2/index.js'

const plugins = [
  WhatsAppPlugin,
  XPlugin,
  LinkedInPlugin,
  InstagramPlugin,
  SnapchatPlugin,
  TeamsPlugin,
  TypewriterPlugin,
  IMessagePlugin,
] as Parameters<typeof prepareTrackEpisode>[1]

function main(): void {
  const includeLegacy = process.env.TOKOVO_VALIDATE_INCLUDE_LEGACY === '1'
  const registry = createEpisodeRegistry()
  const catalogs = [
    ...storyEpisodes,
    ...appShowcaseEpisodes,
    ...systemShowcaseEpisodes,
    ...testEpisodes,
    ...v2Episodes,
    ...(includeLegacy
      ? [...legacyProductionEpisodes, ...legacyShowcaseEpisodes]
      : []),
  ]

  for (const episode of catalogs) {
    registry.register(validateEpisodeForRegistry(episode))
  }

  for (const episode of registry.all()) {
    const ir = episode.build()
    prepareTrackEpisode(ir, plugins, {
      log: false,
      validate: true,
    })
  }

  process.stdout.write(
    `Validated ${registry.count()} episode definitions across stories, app showcases, system showcases, tests, v2${includeLegacy ? ', and legacy' : ''} catalogs.\n`,
  )
}

main()
