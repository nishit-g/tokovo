# V2 Baselines (Fork These)

These are canonical, maintained v2 episodes under `packages/episodes/src/v2/`.

## Device + Cross-App (Long)
- `v2-enterprise-long-showcase`
  - lockscreen -> unlock
  - app switching (WhatsApp -> X -> iMessage)
  - keyboard + camera tracking `keyboard`
  - heads-up banner + camera focus `notification_banner`
  - overlays (hook/captions/receipts)

## Device Realism (Short)
- `v2-device-baseline`
  - lockscreen notification + unlock + app switch
  - minimal typed + camera anchors

## Overlay System
- `v2-overlay-baseline`
  - hook/captions/receipts overlays
  - roast pacing over WhatsApp

## WhatsApp Roast
- `v2-whatsapp-group-roast-baseline`

## X Roast Thread
- `v2-x-roast-thread-baseline`

Smoke suite:
- `apps/video-runner/src/__tests__/v1.render-smoke.test.ts`

