const KNOWN_APP_LABELS: Readonly<Record<string, string>> = {
  app_imessage: "iMessage",
  app_instagram: "Instagram",
  app_linkedin: "LinkedIn",
  app_snapchat: "Snapchat",
  app_teams: "Teams",
  app_typewriter: "Typewriter",
  app_whatsapp: "WhatsApp",
  app_x: "X",
};

export function formatNotificationAppLabel(appId: string | undefined): string {
  if (!appId) return "App";

  const knownLabel = KNOWN_APP_LABELS[appId];
  if (knownLabel) return knownLabel;

  return (
    appId
      .replace(/^app_/, "")
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" ") || "App"
  );
}
