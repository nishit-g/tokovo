# QA and Debugging

## Studio Debugging
- Register plugins in `packages/studio/src/runtime.ts`.
- Use timeline inspection to verify event order.

## Video Runner Debugging
- Register plugins in `apps/video-runner/src/runtime.ts`.
- Check renderer logs for missing plugins or eventKinds.

## Quick Smoke Checks
- Run a minimal episode with a single device and app track.
- Validate camera anchoring for key moments.
