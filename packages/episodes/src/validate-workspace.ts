import { prepareTrackEpisode } from '@tokovo/compiler'
import { WhatsAppPlugin } from '@tokovo/apps-whatsapp'
import { XPlugin } from '@tokovo/apps-x'
import { LinkedInPlugin } from '@tokovo/apps-linkedin'
import { SnapchatPlugin } from '@tokovo/apps-snapchat'
import { TeamsPlugin } from '@tokovo/apps-teams'
import { TypewriterPlugin } from '@tokovo/apps-typewriter'
import { IMessagePlugin } from '@tokovo/apps-imessage'
import productionEpisodes from './production/index.js'
import showcaseEpisodes from './showcases/index.js'
import testEpisodes from './tests/index.js'
import { createEpisodeRegistry } from './registry/index.js'
import { validateEpisodeForRegistry } from './registry/episode-registry.js'
import v2Episodes from './v2/index.js'

const plugins = [
  WhatsAppPlugin,
  XPlugin,
  LinkedInPlugin,
  SnapchatPlugin,
  TeamsPlugin,
  TypewriterPlugin,
  IMessagePlugin,
] as Parameters<typeof prepareTrackEpisode>[1]

function main(): void {
  const registry = createEpisodeRegistry()
  const catalogs = [
    ...productionEpisodes,
    ...showcaseEpisodes,
    ...testEpisodes,
    ...v2Episodes,
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
    `Validated ${registry.count()} episode definitions across production, showcase, test, and v2 catalogs.\n`,
  )
}

main()
