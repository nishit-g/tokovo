import { prepareTrackEpisode } from '@tokovo/compiler'
import {
  createEpisodeRegistryForProfiles,
  createTokovoRuntime,
  resolveCatalogProfile,
  type TokovoCatalogProfile,
} from './runtime-bootstrap.js'

function resolveValidationProfiles(): TokovoCatalogProfile[] {
  return [
    resolveCatalogProfile(
    process.env.TOKOVO_EPISODE_CATALOG_PROFILE,
    'studio',
  ),
  ]
}

function main(): void {
  const profiles = resolveValidationProfiles()
  const runtime = createTokovoRuntime('studio')
  const registry = createEpisodeRegistryForProfiles(profiles)

  for (const episode of registry.all()) {
    const ir = episode.build()
    const plugins = episode.config.apps.map((appId) => {
      const plugin = runtime.pluginManager.get(appId)
      if (!plugin) {
        throw new Error(`Missing plugin for appId "${appId}"`)
      }
      return plugin
    })

    prepareTrackEpisode(ir, plugins, {
      log: false,
      validate: true,
    })
  }

  process.stdout.write(
    `Validated ${registry.count()} episode definitions across ${profiles.join(', ')} catalog profiles.\n`,
  )
}

main()
