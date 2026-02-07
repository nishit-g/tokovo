import { Config } from "@remotion/cli/config";
import os from "node:os";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Bundle caching speeds up subsequent renders a lot.
Config.setCachingEnabled(true);

// Fast local render profile (opt-in): tuned for MacBook speed.
// Enable via: `TOKOVO_RENDER_PROFILE=fast ...`
if (process.env.TOKOVO_RENDER_PROFILE === "fast") {
  // For GPU-heavy UI (shadows/blur/gradients), ANGLE can be significantly faster on macOS.
  // Remotion docs note a possible memory leak, so we keep this opt-in.
  Config.setChromiumOpenGlRenderer("angle");

  // Use hardware-accelerated encoding on macOS if available.
  Config.setHardwareAcceleration("if-possible");

  // Encoding: prioritize speed while keeping output reasonable.
  Config.setCodec("h264");
  Config.setX264Preset("veryfast");
  // Hardware acceleration ignores CRF; bitrate controls file size/quality.
  Config.setVideoBitrate("8M");

  // Max out concurrency for local speed; override with `--concurrency` if needed.
  // Using all cores will slow down the rest of the system during renders.
  Config.setConcurrency(os.cpus().length);
}
