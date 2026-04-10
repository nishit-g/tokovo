import type { TokovoPluginContract } from "@tokovo/core";

export const TeamsMetadata: Partial<TokovoPluginContract> & { name: string } = {
  name: "Microsoft Teams",
  themeColor: "#5b5fc7",
  icon: "/icons/teams.svg",
};
