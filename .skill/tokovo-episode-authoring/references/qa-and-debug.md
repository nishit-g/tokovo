# QA and Debugging

## Video Runner Debugging
- Register plugins in `apps/video-runner/src/runtime.ts`.
- Check renderer logs for missing plugins or eventKinds.

## Quick Smoke Checks
- Run `pnpm --filter video-runner test` (smoke suite is your canary).
- Use the v2 baselines as starting points:
  - `v2-enterprise-long-showcase`
  - `v2-overlay-baseline`
  - `v2-whatsapp-group-roast-baseline`
  - `v2-x-roast-thread-baseline`
