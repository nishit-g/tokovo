## [2026-01-26T11:13:42Z] Pre-Task-11: Remove Strategy Registration - COMPLETE

### Changes
- Removed 5 strategy imports from plugin.ts (lines 177-181)
- Removed 4 UIStrategyRegistry.register() calls from registerWhatsAppPlugin() (lines 189-192)

### Verification
- grep UIStrategyRegistry plugin.ts: 0 results
- pnpm tsc --noEmit: Success
- Plugin registration still functional (PluginManager.register preserved)
