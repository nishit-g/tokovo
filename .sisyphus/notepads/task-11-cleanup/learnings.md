## 2026-01-26T11:10:58Z Pre-Task-11: Remove UIThemeTokens Props - COMPLETE

### Files Updated
- MessageContent.tsx: Removed UIThemeTokens import, removed tokens props from interfaces
- MessageList.tsx: Removed UIThemeTokens import, removed tokens prop from interface

### Verification
- grep UIThemeTokens MessageContent.tsx: 0 results
- grep UIThemeTokens MessageList.tsx: 0 results
- pnpm tsc --noEmit: ✓ Success

### Why
These props were never passed or used. Dead code from old theming system.
Components use CSS variables (--wa-text-primary) or hardcoded styles instead.
