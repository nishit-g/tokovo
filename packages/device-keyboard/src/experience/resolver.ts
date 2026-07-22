import {
  normalizeInputLocale,
  type InputAppearance,
  type InputPlatform,
  type InputPresentationStrategy,
  type InputThemeProjection,
  type ResolvedInputLocale,
} from "../contract/index.js";
import type { PlatformDesignProfileId, VisualPreferences } from "@tokovo/visual-system";
import { getInputPresentationStrategy } from "../presentation/index.js";
import { getInputTheme } from "../theme/index.js";

export interface InputExperienceInput {
  platform: InputPlatform;
  appearance: InputAppearance;
  locale: string;
  platformProfileId?: PlatformDesignProfileId;
  preferences?: Partial<VisualPreferences>;
}

export interface InputExperience {
  version: "1";
  platform: InputPlatform;
  appearance: InputAppearance;
  locale: ResolvedInputLocale;
  platformProfileId: PlatformDesignProfileId;
  theme: InputThemeProjection;
  presentation: InputPresentationStrategy;
  capabilities: {
    supportsDarkMode: true;
    supportsBidi: true;
    supportsImeComposition: true;
    supportsGraphemeEditing: true;
  };
}

export function resolveInputExperience(input: InputExperienceInput): InputExperience {
  const locale = normalizeInputLocale(input.locale);
  const platformProfileId =
    input.platformProfileId ??
    (input.platform === "android" ? "android:material3@1" : "ios:liquid-glass@1");
  return {
    version: "1",
    platform: input.platform,
    appearance: input.appearance,
    locale,
    platformProfileId,
    theme: getInputTheme(
      input.platform,
      input.appearance,
      platformProfileId,
      input.locale,
      input.preferences,
    ),
    presentation: getInputPresentationStrategy(input.platform),
    capabilities: {
      supportsDarkMode: true,
      supportsBidi: true,
      supportsImeComposition: true,
      supportsGraphemeEditing: true,
    },
  };
}
