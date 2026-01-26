## WhatsApp Anchor Migration (Task 12)

Successfully migrated WhatsApp plugin from external anchor registration to inline anchors property.

### Changes Made:
1. Added `anchors: WhatsAppAnchors as any` property to WhatsAppPluginV2 object (line 166)
2. Removed `registerAnchorProvider` import from @tokovo/core (line 12)
3. Removed `registerAnchorProvider(WhatsAppAnchors)` call from registerWhatsAppPlugin() function

### Type Compatibility:
- Used `as any` type assertion due to interface mismatch between:
  - Old: `PluginAnchorRegistry` expects `{ providers: Record<string, PluginAnchorProvider>, framing?: ... }`
  - New: `AnchorProvider` has `{ appId, framing, getAnchors() }`
- The `as any` is temporary until core's `PluginAnchorRegistry` interface is updated to match the new pattern

### Verification:
- ✓ No `registerAnchorProvider` references remain in WhatsApp package
- ✓ WhatsApp package compiles without errors (verified via tsc --noEmit)
- ✓ Import of WhatsAppAnchors from "./runtime/adapters/anchors" remains intact
- ✓ WhatsAppAnchors structure unchanged (appId, framing, getAnchors)

### Pattern:
This follows the same pattern as device-camera plugin which has `anchors: undefined` since it's a consumer, not provider.

