import React, { createContext, useContext } from "react";
import type { XExperience } from "./contract.js";

const Context = createContext<XExperience | null>(null);

export const XExperienceProvider: React.FC<{
  experience: XExperience;
  children: React.ReactNode;
}> = ({ experience, children }) => (
  <Context.Provider value={experience}>{children}</Context.Provider>
);

export function useXExperience(): XExperience {
  const experience = useContext(Context);
  if (!experience) throw new Error("X_EXPERIENCE_MISSING: screen rendered outside XExperienceProvider");
  return experience;
}
