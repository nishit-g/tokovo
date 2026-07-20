import React, { createContext, useContext } from "react";
import { resolveWhatsAppExperience } from "./resolver.js";
import type { WhatsAppExperience } from "./contract.js";

const defaultExperience = resolveWhatsAppExperience({
  platform: "ios",
  appearance: "light",
  locale: "en-US",
});

const ExperienceContext = createContext<WhatsAppExperience>(defaultExperience);

export function WhatsAppExperienceProvider({
  experience,
  children,
}: {
  experience: WhatsAppExperience;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <ExperienceContext.Provider value={experience}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useWhatsAppExperience(): WhatsAppExperience {
  return useContext(ExperienceContext);
}

export function useTheme(): WhatsAppExperience["theme"] {
  return useWhatsAppExperience().theme;
}

export function useWhatsAppPresentation(): WhatsAppExperience["presentation"] {
  return useWhatsAppExperience().presentation;
}

export function useWhatsAppLocale(): Pick<
  WhatsAppExperience,
  "locale" | "direction" | "t"
> {
  const { locale, direction, t } = useWhatsAppExperience();
  return { locale, direction, t };
}
