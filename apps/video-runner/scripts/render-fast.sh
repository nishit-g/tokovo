#!/bin/sh
set -eu

REPO_ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
APP_ROOT="$REPO_ROOT/apps/video-runner"

EPISODE_ID_VALUE="${EPISODE_ID:-v2-creator-series-showcase}"
CAMERA_PLAN_ID_VALUE="${CAMERA_PLAN_ID:-}"
OUT_DIR_VALUE="${OUT_DIR:-$REPO_ROOT/out}"
OUT_FILE_VALUE="${OUT_FILE:-$OUT_DIR_VALUE/$EPISODE_ID_VALUE.mp4}"

if [ -n "${CONCURRENCY:-}" ]; then
  CONCURRENCY_VALUE="$CONCURRENCY"
else
  CONCURRENCY_VALUE="4"
fi

echo "[render:fast] episode=$EPISODE_ID_VALUE"
[ -z "$CAMERA_PLAN_ID_VALUE" ] || echo "[render:fast] camera-plan=$CAMERA_PLAN_ID_VALUE"
echo "[render:fast] out=$OUT_FILE_VALUE"
echo "[render:fast] concurrency=$CONCURRENCY_VALUE"

mkdir -p "$(dirname "$OUT_FILE_VALUE")"

if [ "${TOKOVO_SKIP_WORKSPACE_BUILD:-0}" != "1" ]; then
  echo "[render:fast] syncing workspace build output"
  cd "$REPO_ROOT"
  pnpm --filter 'video-runner^...' build
fi

cd "$APP_ROOT"

INPUT_PROPS=$(node -e '
const [episodeId, cameraPlanId] = process.argv.slice(1);
process.stdout.write(JSON.stringify({
  episodeId,
  ...(cameraPlanId ? { cameraPlanId } : {}),
  cameraProjectionMode: "preview",
}));
' "$EPISODE_ID_VALUE" "$CAMERA_PLAN_ID_VALUE")

TOKOVO_RENDER_PROFILE=fast \
  pnpm exec remotion render src/index.ts "$EPISODE_ID_VALUE" "$OUT_FILE_VALUE" \
  --props "$INPUT_PROPS" \
  --concurrency "$CONCURRENCY_VALUE" \
  --codec h264 \
  --x264-preset veryfast \
  --video-bitrate 8M \
  --gl angle \
  --hardware-acceleration if-possible

pnpm exec tsx scripts/write-artifact-manifest.ts \
  "$EPISODE_ID_VALUE" \
  "$OUT_FILE_VALUE" \
  "$CAMERA_PLAN_ID_VALUE" \
  preview
