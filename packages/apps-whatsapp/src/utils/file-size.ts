export function parseFileSizeToBytes(
  value: string | number | undefined,
): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const raw = String(value).trim();
  if (!raw) return undefined;

  const match = raw.match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (!match) return undefined;

  const amount = Number.parseFloat(match[1]);
  if (!Number.isFinite(amount)) return undefined;

  const unitRaw = (match[2] || "B").toUpperCase();
  const unit =
    unitRaw === "BYTE" || unitRaw === "BYTES" ? "B" : unitRaw;

  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    KIB: 1024,
    MB: 1024 ** 2,
    MIB: 1024 ** 2,
    GB: 1024 ** 3,
    GIB: 1024 ** 3,
    TB: 1024 ** 4,
    TIB: 1024 ** 4,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) return amount;

  return Math.round(amount * multiplier);
}

export function formatFileSize(
  value: string | number | undefined,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return undefined;

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const precision =
    size >= 100 || unitIndex === 0 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}
