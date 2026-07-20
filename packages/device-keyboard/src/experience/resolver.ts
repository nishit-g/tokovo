import {
  normalizeInputLocale,
  type InputAppearance,
  type InputPlatform,
  type InputPresentationStrategy,
  type InputThemeId,
  type InputThemeProjection,
  type ResolvedInputLocale,
} from "../contract/index.js";
import { getInputPresentationStrategy } from "../presentation/index.js";
import { getInputTheme } from "../theme/index.js";

export interface InputExperienceInput {
  platform: InputPlatform;
  appearance: InputAppearance;
  locale: string;
  themeId?: InputThemeId;
}

export interface InputExperience {
  version: "1";
  platform: InputPlatform;
  appearance: InputAppearance;
  locale: ResolvedInputLocale;
  themeId: InputThemeId;
  theme: InputThemeProjection;
  presentation: InputPresentationStrategy;
  capabilities: {
    supportsDarkMode: true;
    supportsBidi: true;
    supportsImeComposition: true;
    supportsGraphemeEditing: true;
  };
}

export function resolveInputExperience(
  input: InputExperienceInput,
): InputExperience {
  const locale = normalizeInputLocale(input.locale);
  const themeId = input.themeId ?? "system";
  return {
    version: "1",
    platform: input.platform,
    appearance: input.appearance,
    locale,
    themeId,
    theme: getInputTheme(input.platform, input.appearance, themeId),
    presentation: getInputPresentationStrategy(input.platform),
    capabilities: {
      supportsDarkMode: true,
      supportsBidi: true,
      supportsImeComposition: true,
      supportsGraphemeEditing: true,
    },
  };
}
