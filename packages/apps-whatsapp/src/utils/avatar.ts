/**
 * Avatar utilities.
 *
 * Local deterministic SVG fallbacks are used instead of network lookups so
 * renders stay reproducible and offline-safe.
 */

const PALETTE = [
  { bg: "#F3E8FF", fg: "#6D28D9", accent: "#E9D5FF" },
  { bg: "#DBEAFE", fg: "#1D4ED8", accent: "#BFDBFE" },
  { bg: "#DCFCE7", fg: "#15803D", accent: "#BBF7D0" },
  { bg: "#FEF3C7", fg: "#B45309", accent: "#FDE68A" },
  { bg: "#FCE7F3", fg: "#BE185D", accent: "#FBCFE8" },
  { bg: "#FFE4E6", fg: "#BE123C", accent: "#FECDD3" },
  { bg: "#E0F2FE", fg: "#0369A1", accent: "#BAE6FD" },
  { bg: "#ECFCCB", fg: "#4D7C0F", accent: "#D9F99D" },
] as const;

function normalizeName(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  return cleaned.length > 0 ? cleaned : "User";
}

function initialsFromName(name: string): string {
  const parts = normalizeName(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return initials || "U";
}

function hashName(name: string): number {
  let hash = 0;
  for (const char of normalizeName(name)) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

export function generateAvatarUrl(name: string, size = 128): string {
  const cleanName = normalizeName(name);
  const hash = hashName(cleanName);
  const palette = PALETTE[hash % PALETTE.length];
  const initials = initialsFromName(cleanName);
  const ringShift = hash % 24;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="${cleanName}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.bg}" />
          <stop offset="100%" stop-color="${palette.accent}" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="64" fill="url(#bg)" />
      <circle cx="100" cy="28" r="20" fill="${palette.accent}" opacity="0.7" />
      <circle cx="24" cy="104" r="30" fill="${palette.accent}" opacity="0.55" />
      <path d="M18 ${48 + ringShift}C34 ${24 + ringShift} 54 ${20 + ringShift} 74 ${30 + ringShift}C94 ${40 + ringShift} 106 ${56 + ringShift} 112 ${74 + ringShift}" fill="none" stroke="${palette.fg}" stroke-opacity="0.14" stroke-width="10" stroke-linecap="round"/>
      <text x="64" y="72" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" font-size="42" font-weight="700" fill="${palette.fg}">
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function isLocalPath(path: string | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("http");
}

export function resolveAvatarWithFallback(
  avatarUrl: string | undefined,
  contactName: string,
): string {
  if (!avatarUrl || isLocalPath(avatarUrl)) {
    return generateAvatarUrl(contactName);
  }

  return avatarUrl;
}
