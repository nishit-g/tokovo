#!/bin/sh
set -eu

REPO_ROOT=$(cd "$(dirname "$0")/../../.." && pwd)
APP_ROOT="$REPO_ROOT/apps/video-runner"

EPISODE_ID_VALUE="${EPISODE_ID:-v2-enterprise-long-showcase}"
OUT_DIR_VALUE="${OUT_DIR:-$REPO_ROOT/out}"
OUT_FILE_VALUE="${OUT_FILE:-$OUT_DIR_VALUE/$EPISODE_ID_VALUE.mp4}"

if [ -n "${CONCURRENCY:-}" ]; then
  CONCURRENCY_VALUE="$CONCURRENCY"
else
  CONCURRENCY_VALUE="4"
fi

echo "[render:fast] episode=$EPISODE_ID_VALUE"
echo "[render:fast] out=$OUT_FILE_VALUE"
echo "[render:fast] concurrency=$CONCURRENCY_VALUE"

mkdir -p "$(dirname "$OUT_FILE_VALUE")"

cd "$APP_ROOT"

TOKOVO_RENDER_PROFILE=fast \
  pnpm exec remotion render src/index.ts "$EPISODE_ID_VALUE" "$OUT_FILE_VALUE" \
  --concurrency "$CONCURRENCY_VALUE" \
  --codec h264 \
  --x264-preset veryfast \
  --video-bitrate 8M \
  --gl angle \
  --hardware-acceleration if-possible

pnpm exec tsx scripts/write-artifact-manifest.ts "$EPISODE_ID_VALUE" "$OUT_FILE_VALUE"
