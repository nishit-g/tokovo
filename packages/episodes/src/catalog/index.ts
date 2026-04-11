import type {
  EpisodeCatalogType,
  EpisodeDefinition,
  EpisodeMeta,
} from "../types/episode-definition.js";

export interface EpisodeMetaPatch extends Partial<EpisodeMeta> {
  catalogType?: EpisodeCatalogType;
}

function mergeTags(
  current: readonly string[] | undefined,
  next: readonly string[] | undefined,
): string[] | undefined {
  if (!current?.length && !next?.length) {
    return undefined;
  }

  return Array.from(new Set([...(current ?? []), ...(next ?? [])]));
}

export function withEpisodeMeta(
  definition: EpisodeDefinition,
  patch: EpisodeMetaPatch,
): EpisodeDefinition {
  const mergedMeta: EpisodeMeta = {
    ...definition.meta,
    ...patch,
    tags: mergeTags(definition.meta.tags, patch.tags),
  };

  return {
    ...definition,
    meta: mergedMeta,
  };
}
