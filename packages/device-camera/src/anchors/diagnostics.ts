export interface AnchorDiagnosticsSnapshot {
  fallbackCount: number;
  unresolvedCount: number;
  perAnchorFallbackCount: Record<string, number>;
  perAnchorUnresolvedCount: Record<string, number>;
}

const diagnostics: AnchorDiagnosticsSnapshot = {
  fallbackCount: 0,
  unresolvedCount: 0,
  perAnchorFallbackCount: {},
  perAnchorUnresolvedCount: {},
};

export function recordFallback(anchorId: string): void {
  diagnostics.fallbackCount += 1;
  diagnostics.perAnchorFallbackCount[anchorId] =
    (diagnostics.perAnchorFallbackCount[anchorId] ?? 0) + 1;
}

export function recordUnresolved(anchorId: string): void {
  diagnostics.unresolvedCount += 1;
  diagnostics.perAnchorUnresolvedCount[anchorId] =
    (diagnostics.perAnchorUnresolvedCount[anchorId] ?? 0) + 1;
}

export function getAnchorDiagnostics(): AnchorDiagnosticsSnapshot {
  return {
    fallbackCount: diagnostics.fallbackCount,
    unresolvedCount: diagnostics.unresolvedCount,
    perAnchorFallbackCount: { ...diagnostics.perAnchorFallbackCount },
    perAnchorUnresolvedCount: { ...diagnostics.perAnchorUnresolvedCount },
  };
}

export function resetAnchorDiagnostics(): void {
  diagnostics.fallbackCount = 0;
  diagnostics.unresolvedCount = 0;
  diagnostics.perAnchorFallbackCount = {};
  diagnostics.perAnchorUnresolvedCount = {};
}
