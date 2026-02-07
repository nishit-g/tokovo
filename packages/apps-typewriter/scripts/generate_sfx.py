#!/usr/bin/env python3

"""
Generate offline typewriter SFX matching the old WebAudio MVP:
- key: low thud + high click
- space: heavier thud
- bell: long ding
- carriage: zip
- backspace/punct: short click variants
- room: low hum/hiss bed

Writes to: apps/video-runner/public/sounds/plugins/typewriter/
"""

from __future__ import annotations

import math
import struct
import wave
from dataclasses import dataclass
from pathlib import Path
from random import Random
from typing import Iterable, List


SR = 44100


def clamp(x: float, lo: float, hi: float) -> float:
    return lo if x < lo else hi if x > hi else x


def write_wav(path: Path, samples: Iterable[float], sr: int = SR) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = bytearray()
    for s in samples:
        s = clamp(float(s), -1.0, 1.0)
        data += struct.pack("<h", int(s * 32767.0))
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(data)


def exp_env(n: int, start: float, end: float) -> List[float]:
    # Avoid log(0)
    start = max(1e-6, start)
    end = max(1e-6, end)
    ratio = end / start
    out = []
    for i in range(n):
        p = i / max(1, n - 1)
        out.append(start * (ratio ** p))
    return out


def lin_env(n: int, start: float, end: float) -> List[float]:
    out = []
    for i in range(n):
        p = i / max(1, n - 1)
        out.append(start + (end - start) * p)
    return out


def osc_var_freq(
    kind: str,
    f0: float,
    f1: float,
    dur_s: float,
    env: List[float],
    ramp: str = "exp",
) -> List[float]:
    n = int(dur_s * SR)
    if len(env) != n:
        raise ValueError("env length mismatch")

    phase = 0.0
    out = []
    for i in range(n):
        p = i / max(1, n - 1)
        if ramp == "exp":
            f = f0 * ((f1 / f0) ** p)
        else:
            f = f0 + (f1 - f0) * p
        phase += 2.0 * math.pi * f / SR
        frac = (phase / (2.0 * math.pi)) % 1.0
        if kind == "sine":
            s = math.sin(phase)
        elif kind == "saw":
            s = 2.0 * frac - 1.0
        elif kind == "triangle":
            s = 2.0 * abs(2.0 * frac - 1.0) - 1.0
        else:
            raise ValueError("unknown osc kind")
        out.append(s * env[i])
    return out


def white_noise(dur_s: float, seed: int) -> List[float]:
    n = int(dur_s * SR)
    rnd = Random(seed)
    return [(rnd.random() * 2.0 - 1.0) for _ in range(n)]


def highpass_1p(x: List[float], cutoff_hz: float) -> List[float]:
    # First-order high-pass filter: y[n] = a*(y[n-1] + x[n] - x[n-1])
    dt = 1.0 / SR
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    a = rc / (rc + dt)
    y = []
    prev_y = 0.0
    prev_x = 0.0
    for xn in x:
        yn = a * (prev_y + xn - prev_x)
        y.append(yn)
        prev_y = yn
        prev_x = xn
    return y


def mix(*tracks: List[float]) -> List[float]:
    n = max((len(t) for t in tracks), default=0)
    out = [0.0] * n
    for t in tracks:
        for i, s in enumerate(t):
            out[i] += s
    # Normalize slightly to avoid clipping
    peak = max((abs(s) for s in out), default=1.0)
    if peak > 0.98:
        scale = 0.98 / peak
        out = [s * scale for s in out]
    return out


def pad_to(track: List[float], n: int) -> List[float]:
    if len(track) >= n:
        return track
    return track + [0.0] * (n - len(track))


def key_sound(seed: int = 1) -> List[float]:
    # Crisp key click with minimal overlap at ~25-35 cps.
    # MVP was 50ms; shorten to keep fast typing from sounding like "bursts".
    dur = 0.032
    n = int(dur * SR)
    thud_env = exp_env(n, 0.55, 0.01)
    thud = osc_var_freq("triangle", 165.0, 55.0, dur, thud_env, ramp="exp")

    # High frequency mechanical noise
    noise = white_noise(dur, seed=seed)
    noise = highpass_1p(noise, 1150.0)
    click_env = exp_env(n, 0.38, 0.01)
    click = [noise[i] * click_env[i] for i in range(n)]

    return mix(thud, click)


def space_sound() -> List[float]:
    # Slightly longer / heavier than a key.
    dur = 0.06
    n = int(dur * SR)
    env = exp_env(n, 0.62, 0.01)
    return osc_var_freq("sine", 110.0, 24.0, dur, env, ramp="exp")


def bell_sound() -> List[float]:
    # Bell with long decay (kept long, but a bit tighter than MVP).
    dur = 1.2
    n = int(dur * SR)
    env = exp_env(n, 0.28, 0.001)
    return osc_var_freq("sine", 1200.0, 1200.0, dur, env, ramp="lin")


def carriage_sound() -> List[float]:
    # Carriage return zip
    dur = 0.26
    n = int(dur * SR)
    env = lin_env(n, 0.1, 0.0)
    return osc_var_freq("saw", 200.0, 400.0, dur, env, ramp="lin")


def punct_sound(seed: int = 2) -> List[float]:
    # Slightly sharper click than key
    base = key_sound(seed=seed)
    return [s * 0.92 for s in base]


def backspace_sound(seed: int = 3) -> List[float]:
    # Quick click-only (highpassed noise) + tiny thud
    dur = 0.045
    n = int(dur * SR)
    noise = white_noise(dur, seed=seed)
    noise = highpass_1p(noise, 950.0)
    env = exp_env(n, 0.34, 0.01)
    click = [noise[i] * env[i] for i in range(n)]
    thud_env = exp_env(n, 0.18, 0.01)
    thud = osc_var_freq("triangle", 175.0, 70.0, dur, thud_env, ramp="exp")
    return mix(click, thud)


def room_sound(seed: int = 4) -> List[float]:
    dur = 10.0
    n = int(dur * SR)
    rnd = Random(seed)
    out = []
    for i in range(n):
        t = i / SR
        hum = math.sin(2.0 * math.pi * 60.0 * t) * 0.012
        hiss = (rnd.random() * 2.0 - 1.0) * 0.018
        out.append(hum + hiss)
    return out


def main() -> None:
    # scripts/ -> apps-typewriter/ -> packages/ -> repo root
    repo_root = Path(__file__).resolve().parents[3]
    outdir = repo_root / "apps" / "video-runner" / "public" / "sounds" / "plugins" / "typewriter"

    key = key_sound(seed=11)
    space = space_sound()
    punct = punct_sound(seed=12)
    bell = bell_sound()
    carriage = carriage_sound()
    backspace = backspace_sound(seed=13)
    room = room_sound(seed=14)

    def soften(track: List[float], gain: float) -> List[float]:
        return [s * gain for s in track]

    write_wav(outdir / "key.wav", key)
    write_wav(outdir / "key_soft.wav", soften(key, 0.65))
    write_wav(outdir / "space.wav", space)
    write_wav(outdir / "space_soft.wav", soften(space, 0.65))
    write_wav(outdir / "punct.wav", punct)
    write_wav(outdir / "punct_soft.wav", soften(punct, 0.65))
    write_wav(outdir / "bell.wav", bell)
    write_wav(outdir / "bell_soft.wav", soften(bell, 0.75))
    write_wav(outdir / "carriage.wav", carriage)
    write_wav(outdir / "carriage_soft.wav", soften(carriage, 0.7))
    write_wav(outdir / "backspace.wav", backspace)
    write_wav(outdir / "backspace_soft.wav", soften(backspace, 0.7))
    write_wav(outdir / "room.wav", room)

    print("wrote", sorted([p.name for p in outdir.glob("*.wav")]))


if __name__ == "__main__":
    main()
