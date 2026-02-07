/* eslint-disable no-console */
/**
 * Procedural SFX generator (no samples).
 *
 * Goal: ship a legally-safe baseline SFX pack (device + WhatsApp + iMessage + core built-ins)
 * by synthesizing deterministic WAV files in-repo.
 *
 * Output root:
 *   apps/video-runner/public/sounds/
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_ROOT = path.join(ROOT, "apps/video-runner/public/sounds");
const SAMPLE_RATE = 44100;

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function clamp11(x) {
  return Math.max(-1, Math.min(1, x));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function writeWav16Mono(filePath, samples) {
  const numSamples = samples.length;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = clamp11(samples[i]);
    const int16 = Math.round(s * 32767);
    buffer.writeInt16LE(int16, offset);
    offset += 2;
  }

  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, buffer);
}

function secondsToSamples(seconds) {
  return Math.max(1, Math.floor(seconds * SAMPLE_RATE));
}

function envExp(t, decay) {
  // t in [0..1]
  return Math.exp(-decay * t);
}

function sine(t, freq) {
  return Math.sin(2 * Math.PI * freq * t);
}

function chirp(t, f0, f1, dur) {
  const k = (f1 - f0) / Math.max(1e-6, dur);
  const phase = 2 * Math.PI * (f0 * t + 0.5 * k * t * t);
  return Math.sin(phase);
}

function makeNoise(seed = 1) {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    // [-1..1]
    return ((s >>> 0) / 0xffffffff) * 2 - 1;
  };
}

function addFadeInOut(samples, fadeInMs = 2, fadeOutMs = 12) {
  const fadeInN = Math.min(samples.length, Math.floor((fadeInMs / 1000) * SAMPLE_RATE));
  const fadeOutN = Math.min(samples.length, Math.floor((fadeOutMs / 1000) * SAMPLE_RATE));
  for (let i = 0; i < fadeInN; i++) {
    const g = i / Math.max(1, fadeInN);
    samples[i] *= g;
  }
  for (let i = 0; i < fadeOutN; i++) {
    const idx = samples.length - 1 - i;
    const g = (fadeOutN - i) / Math.max(1, fadeOutN);
    samples[idx] *= g;
  }
}

function normalizePeak(samples, peak = 0.95) {
  let max = 0;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  if (max < 1e-6) return;
  const g = peak / max;
  for (let i = 0; i < samples.length; i++) samples[i] *= g;
}

// -----------------------------------------------------------------------------
// SFX recipes
// -----------------------------------------------------------------------------

function sfxTap({ dur = 0.04, seed = 7, toneHz = 2400, noise = 0.35 } = {}) {
  const n = secondsToSamples(dur);
  const rnd = makeNoise(seed);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 14);
    const click = (rnd() * noise + sine(t, toneHz) * 0.45) * e;
    out[i] = click;
  }
  addFadeInOut(out, 1, 10);
  normalizePeak(out, 0.85);
  return out;
}

function sfxKeyboardClick() {
  return sfxTap({ dur: 0.03, seed: 11, toneHz: 3200, noise: 0.22 });
}

function sfxLock() {
  const dur = 0.12;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 6);
    out[i] =
      (chirp(t, 520, 260, dur) * 0.55 + chirp(t, 260, 180, dur) * 0.18) * e;
  }
  addFadeInOut(out, 2, 22);
  normalizePeak(out, 0.9);
  return out;
}

function sfxUnlock() {
  const dur = 0.14;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  const click = sfxTap({ dur: 0.03, seed: 21, toneHz: 2800, noise: 0.18 });
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 6);
    const whoop = chirp(t, 240, 620, dur) * 0.55 * e;
    const c = i < click.length ? click[i] * 0.45 : 0;
    out[i] = whoop + c;
  }
  addFadeInOut(out, 2, 22);
  normalizePeak(out, 0.92);
  return out;
}

function sfxNotification({ soft = false } = {}) {
  const dur = soft ? 0.12 : 0.18;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);

  const notes = soft ? [660, 990] : [880, 1320, 1760];
  const noteDur = dur / notes.length;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const idx = Math.min(notes.length - 1, Math.floor(t / noteDur));
    const localT = t - idx * noteDur;
    const e = envExp(localT / noteDur, soft ? 7 : 9);
    const f = notes[idx];
    const s = sine(localT, f) * (soft ? 0.38 : 0.55) * e;
    out[i] += s;
  }

  addFadeInOut(out, 2, 25);
  normalizePeak(out, soft ? 0.65 : 0.9);
  return out;
}

function sfxShutter() {
  const dur = 0.22;
  const n = secondsToSamples(dur);
  const rnd = makeNoise(123);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 10);
    const body = (rnd() * 0.22 + sine(t, 1600) * 0.25) * e;
    const snap = x < 0.08 ? sine(t, 3200) * 0.6 * envExp(x / 0.08, 9) : 0;
    out[i] = body + snap;
  }
  addFadeInOut(out, 1, 30);
  normalizePeak(out, 0.9);
  return out;
}

function sfxCharging() {
  const dur = 0.28;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 4.8);
    out[i] =
      (chirp(t, 440, 940, dur) * 0.5 + sine(t, 1760) * 0.08) * e;
  }
  addFadeInOut(out, 2, 40);
  normalizePeak(out, 0.85);
  return out;
}

function sfxCallEnd() {
  const dur = 0.26;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 6.5);
    out[i] = (chirp(t, 900, 420, dur) * 0.55) * e;
  }
  addFadeInOut(out, 2, 30);
  normalizePeak(out, 0.9);
  return out;
}

function sfxRingtone() {
  const dur = 2.4;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  // Simple, non-melodic pulsed two-tone. (Not similar to any real ringtone.)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const cycle = t % 0.6;
    const on = cycle < 0.22 ? 1 : 0;
    const a = on ? envExp(cycle / 0.22, 2.2) : 0;
    out[i] =
      (sine(t, 520) * 0.24 + sine(t, 780) * 0.16) * a;
  }
  addFadeInOut(out, 8, 60);
  normalizePeak(out, 0.75);
  return out;
}

function sfxTypingLoop({ seed = 99, bpm = 360, amp = 0.18 } = {}) {
  const dur = 0.8; // loop-friendly chunk
  const n = secondsToSamples(dur);
  const rnd = makeNoise(seed);
  const out = new Float32Array(n);
  const cps = (bpm / 60); // clicks per second

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const phase = (t * cps) % 1;
    const hit = phase < 0.08 ? envExp(phase / 0.08, 10) : 0;
    const tone = sine(t, 2600) * 0.4 + sine(t, 3400) * 0.2;
    const noise = rnd() * 0.3;
    out[i] = (tone + noise) * hit * amp;
  }

  // Force seamless loop: ensure endpoints are quiet
  addFadeInOut(out, 12, 12);
  normalizePeak(out, 0.55);
  return out;
}

function sfxWhoosh({ dur = 0.22, seed = 333 } = {}) {
  const n = secondsToSamples(dur);
  const rnd = makeNoise(seed);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    const e = envExp(x, 3.8);
    const n1 = rnd() * 0.22;
    const n2 = rnd() * 0.08;
    out[i] = (n1 * (1 - x) + n2 * x) * e;
  }
  addFadeInOut(out, 2, 30);
  normalizePeak(out, 0.65);
  return out;
}

function sfxStinger({ kind = "suspense" } = {}) {
  const dur = kind === "dramatic" ? 1.2 : 0.9;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  const f0 = kind === "dramatic" ? 180 : 220;
  const f1 = kind === "dramatic" ? 90 : 140;

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, kind === "dramatic" ? 1.8 : 2.6);
    const base = chirp(t, f0, f1, dur) * 0.65;
    const harm = chirp(t, f0 * 2, f1 * 1.6, dur) * 0.18;
    const grit = Math.sin(2 * Math.PI * 40 * t) * 0.06;
    out[i] = (base + harm + grit) * e;
  }
  addFadeInOut(out, 8, 120);
  normalizePeak(out, 0.85);
  return out;
}

function sfxWhatsAppIn() {
  // Brighter, slightly longer than a tap.
  const base = sfxNotification({ soft: true });
  const t = sfxTap({ dur: 0.03, seed: 44, toneHz: 3100, noise: 0.2 });
  const n = Math.max(base.length, t.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = (base[i] ?? 0) * 0.9 + (t[i] ?? 0) * 0.6;
  }
  normalizePeak(out, 0.9);
  return out;
}

function sfxWhatsAppOut() {
  return sfxTap({ dur: 0.035, seed: 55, toneHz: 2100, noise: 0.18 });
}

function sfxPttStart() {
  return sfxTap({ dur: 0.05, seed: 77, toneHz: 1700, noise: 0.22 });
}

function sfxPttSend() {
  const a = sfxTap({ dur: 0.04, seed: 88, toneHz: 2600, noise: 0.18 });
  const b = sfxWhoosh({ dur: 0.14, seed: 89 });
  const n = Math.max(a.length, b.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = (a[i] ?? 0) * 0.8 + (b[i] ?? 0) * 0.55;
  normalizePeak(out, 0.9);
  return out;
}

function sfxPttCancel() {
  // Short, slightly "down" sound.
  const dur = 0.12;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const e = envExp(x, 7);
    out[i] = chirp(t, 520, 240, dur) * 0.55 * e;
  }
  addFadeInOut(out, 2, 30);
  normalizePeak(out, 0.85);
  return out;
}

function sfxCallOutgoing() {
  // A short "connecting" blip.
  const dur = 0.55;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const pulse = (Math.sin(2 * Math.PI * 2.8 * t) > 0 ? 1 : 0) * 0.7;
    const e = envExp(x, 1.7);
    out[i] = (sine(t, 740) * 0.18 + sine(t, 1120) * 0.09) * pulse * e;
  }
  addFadeInOut(out, 10, 80);
  normalizePeak(out, 0.7);
  return out;
}

function sfxScreenshot() {
  // Shutter + tiny sparkle.
  const a = sfxShutter();
  const dur = 0.22;
  const n = secondsToSamples(dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] ?? 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const x = i / (n - 1);
    const sparkle = x > 0.45 ? sine(t, 5200) * 0.12 * envExp((x - 0.45) / 0.55, 12) : 0;
    out[i] += sparkle;
  }
  addFadeInOut(out, 1, 30);
  normalizePeak(out, 0.9);
  return out;
}

// -----------------------------------------------------------------------------
// Manifest (soundId -> relative path under public/sounds)
// -----------------------------------------------------------------------------

const files = [
  // Core built-ins (SoundRegistry built-ins)
  { rel: "generated/core/notification.wav", synth: () => sfxNotification({ soft: false }) },
  { rel: "generated/core/notification-soft.wav", synth: () => sfxNotification({ soft: true }) },
  { rel: "generated/core/ringtone.wav", synth: () => sfxRingtone() },
  { rel: "generated/core/call-end.wav", synth: () => sfxCallEnd() },
  { rel: "generated/core/camera-shutter.wav", synth: () => sfxShutter() },
  { rel: "generated/core/screenshot.wav", synth: () => sfxScreenshot() },
  { rel: "generated/core/lock.wav", synth: () => sfxLock() },
  { rel: "generated/core/unlock.wav", synth: () => sfxUnlock() },
  { rel: "generated/core/tap.wav", synth: () => sfxTap() },
  { rel: "generated/core/keyboard-click.wav", synth: () => sfxKeyboardClick() },
  { rel: "generated/core/suspense.wav", synth: () => sfxStinger({ kind: "suspense" }) },
  { rel: "generated/core/dramatic.wav", synth: () => sfxStinger({ kind: "dramatic" }) },

  // Device OS (iOS)
  { rel: "os/ios/notification.wav", synth: () => sfxNotification({ soft: true }) },
  { rel: "os/ios/lock.wav", synth: () => sfxLock() },
  { rel: "os/ios/unlock.wav", synth: () => sfxUnlock() },
  { rel: "os/ios/screenshot.wav", synth: () => sfxScreenshot() },
  { rel: "os/ios/charging.wav", synth: () => sfxCharging() },
  { rel: "os/ios/keyboard.wav", synth: () => sfxKeyboardClick() },

  // Device OS (Android) - still wav for simplicity & determinism.
  { rel: "os/android/notification.wav", synth: () => sfxNotification({ soft: true }) },
  { rel: "os/android/lock.wav", synth: () => sfxLock() },
  { rel: "os/android/unlock.wav", synth: () => sfxUnlock() },
  { rel: "os/android/keyboard.wav", synth: () => sfxKeyboardClick() },

  // WhatsApp plugin sounds
  { rel: "plugins/whatsapp/sent.wav", synth: () => sfxWhatsAppOut() },
  { rel: "plugins/whatsapp/received.wav", synth: () => sfxWhatsAppIn() },
  { rel: "plugins/whatsapp/typing_loop.wav", synth: () => sfxTypingLoop({ seed: 901, bpm: 420, amp: 0.2 }) },
  { rel: "plugins/whatsapp/call_ringtone.wav", synth: () => sfxRingtone() },
  { rel: "plugins/whatsapp/call_outgoing.wav", synth: () => sfxCallOutgoing() },
  { rel: "plugins/whatsapp/call_end.wav", synth: () => sfxCallEnd() },
  { rel: "plugins/whatsapp/ptt_start.wav", synth: () => sfxPttStart() },
  { rel: "plugins/whatsapp/ptt_send.wav", synth: () => sfxPttSend() },
  { rel: "plugins/whatsapp/ptt_cancel.wav", synth: () => sfxPttCancel() },

  // iMessage plugin sounds
  { rel: "plugins/imessage/sent.wav", synth: () => sfxTap({ dur: 0.035, seed: 404, toneHz: 2300, noise: 0.15 }) },
  { rel: "plugins/imessage/received.wav", synth: () => sfxNotification({ soft: true }) },
  { rel: "plugins/imessage/typing_loop.wav", synth: () => sfxTypingLoop({ seed: 777, bpm: 380, amp: 0.18 }) },
];

function main() {
  console.log(`[sfx] writing ${files.length} wav files to: ${OUT_ROOT}`);
  let wrote = 0;
  for (const f of files) {
    const outPath = path.join(OUT_ROOT, f.rel);
    const samples = f.synth();
    writeWav16Mono(outPath, samples);
    wrote++;
  }

  const readmePath = path.join(OUT_ROOT, "generated/README.md");
  mkdirp(path.dirname(readmePath));
  fs.writeFileSync(
    readmePath,
    [
      "# Generated SFX (Procedural)",
      "",
      "These sound effects are procedurally generated in-repo (no third-party samples).",
      "",
      "- Generator: `scripts/generate-procedural-sfx.mjs`",
      `- Sample rate: ${SAMPLE_RATE} Hz, mono, 16-bit PCM WAV`,
      "",
      "If you change the generator recipes, re-run the script to regenerate the WAVs.",
      "",
    ].join("\n"),
  );

  const licensesPath = path.join(ROOT, "ASSET_LICENSES.md");
  const licenseBlock = [
    "## Audio (Procedural SFX)",
    "",
    "- Location: `apps/video-runner/public/sounds/**`",
    "- Source: procedurally generated in-repo (no samples)",
    "- Generator: `scripts/generate-procedural-sfx.mjs`",
    "",
  ].join("\n");

  // Append once (idempotent-ish)
  const existing = fs.existsSync(licensesPath)
    ? fs.readFileSync(licensesPath, "utf8")
    : "";
  if (!existing.includes("## Audio (Procedural SFX)")) {
    fs.writeFileSync(
      licensesPath,
      (existing.trimEnd() + "\n\n" + licenseBlock).trimStart(),
    );
  }

  console.log(`[sfx] done. wrote=${wrote}`);
}

main();

