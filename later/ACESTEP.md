# ACE-Step Bible (Mac GPU + Team Handoff)

This document is the single source of truth for running ACE-Step locally on macOS with Apple GPU (MPS), and for generating high-quality multilingual songs.

---

## 0) Folder Layout

Expected folders:

- `/Users/nishit.gupta/personal/ace-step/ACE-Step-1.5`
- `/Users/nishit.gupta/personal/ace-step/ace-step-skills`

---

## 1) One-Liner: Start API Server (GPU)

Run this from anywhere:

```bash
cd /Users/nishit.gupta/personal/ace-step/ACE-Step-1.5 && ACESTEP_DEVICE=mps ACESTEP_INIT_LLM=false mise exec -- .venv/bin/acestep-api --host 127.0.0.1 --port 8001
```

What this does:

- Forces Apple GPU (`mps`)
- Disables LLM init for stability/speed (`ACESTEP_INIT_LLM=false`)
- Starts API at `http://127.0.0.1:8001`

Keep this terminal running.

---

## 2) One-Liner: Health Check

```bash
curl -s http://127.0.0.1:8001/health
```

If healthy, you should see JSON with status ok.

---

## 3) One-Liner: Generate Song (Lyrics)

Open a second terminal and run:

```bash
cd /Users/nishit.gupta/personal/ace-step/ace-step-skills/skills/acestep && bash ./scripts/acestep.sh generate -c "hyperpop trap, fast punchy drums, bouncy bass, glitchy vocal chops, viral energy" -l "[Hook] Comment said delete this, so I made part two\n[Verse] You came here to roast me, now you streaming through" --duration 25 --steps 10 --batch 1 --no-thinking
```

Outputs are saved to:

- `/Users/nishit.gupta/personal/acestep_output`

---

## 4) Play Latest Output

```bash
afplay "$(ls -t /Users/nishit.gupta/personal/acestep_output/*.mp3 | head -n 1)"
```

---

## 5) Core Prompting Rules (Most Important)

For best results:

- Use **clear genre + mood + instrumentation** in caption.
- Keep caption focused: 1-2 styles, not 7 conflicting genres.
- Give lyrics in clear structure:
  - `[Intro]`
  - `[Verse]`
  - `[Pre-Chorus]`
  - `[Chorus]`
  - `[Bridge]`
- For short viral clips, keep duration `15-35s`.
- Use `--no-thinking` for speed and stability.
- Start with `--steps 8` to `--steps 12`.

Bad caption:

- `"sad happy phonk jazz metal lullaby cinematic drill"`

Better caption:

- `"melodic trap, emotional piano, heavy 808, intimate vocal, late-night mood"`

---

## 6) Multilingual Usage

### English

- Caption in English
- Lyrics in English

### Hindi / Hinglish

- Set language in config first:

```bash
cd /Users/nishit.gupta/personal/ace-step/ace-step-skills/skills/acestep
bash ./scripts/acestep.sh config --set generation.vocal_language hi
```

- Use Hindi/Hinglish lyrics directly in `-l`.

### Spanish / Japanese / Others

- Set `generation.vocal_language` to target code if supported by your workflow.
- Keep caption descriptive in English if needed, but lyrics in target language.
- Avoid switching language mid-line unless intentional.

Reset to English:

```bash
bash ./scripts/acestep.sh config --set generation.vocal_language en
```

---

## 7) Recommended Generation Presets

### A) Viral Short (15-25s)

- `--duration 20`
- `--steps 8`
- `--no-thinking`

### B) Song Teaser (30-45s)

- `--duration 35`
- `--steps 10`
- `--no-thinking`

### C) Higher Detail (slower)

- `--duration 45`
- `--steps 12`
- Remove `--no-thinking` only if LLM is enabled and stable.

---

## 8) ChatMusic-Style Formula

Use this template:

- Topic: social roast / breakup / flex / streamer drama
- Hook must be first 2 lines and repeat
- Punchy words, short lines, meme-ready phrases

Example hook skeleton:

```text
[Hook]
You said "skip this" now it’s stuck in your head
You said "he’s mid" now you quote what I said
```

---

## 9) Handing Off to Another Person

Tell them only this:

1. Start server (Section 1).
2. Health check (Section 2).
3. Generate from Section 3 command, changing only:
   - caption text after `-c`
   - lyrics text after `-l`
4. Listen using Section 4.

That’s enough for most users.

---

## 10) Troubleshooting

### Problem: `model.safetensors` missing

Fix:

```bash
cd /Users/nishit.gupta/personal/ace-step/ACE-Step-1.5
HF_HUB_DISABLE_XET=1 HF_HUB_ENABLE_HF_TRANSFER=0 mise exec -- .venv/bin/hf download ACE-Step/Ace-Step1.5 --local-dir ./checkpoints --include "acestep-v15-turbo/model.safetensors" --force-download
```

### Problem: embedding model missing

Fix:

```bash
cd /Users/nishit.gupta/personal/ace-step/ACE-Step-1.5
HF_HUB_DISABLE_XET=1 HF_HUB_ENABLE_HF_TRANSFER=0 mise exec -- .venv/bin/hf download ACE-Step/Ace-Step1.5 --local-dir ./checkpoints --include "Qwen3-Embedding-0.6B/model.safetensors" --force-download
```

### Problem: API not reachable

- Ensure server terminal is still running
- Re-check:

```bash
curl -s http://127.0.0.1:8001/health
```

### Problem: MPS/GPU issue

Quick check:

```bash
cd /Users/nishit.gupta/personal/ace-step/ACE-Step-1.5
mise exec -- .venv/bin/python -c "import torch; print(torch.__version__); print(torch.backends.mps.is_available())"
```

Need `True` for GPU mode.

---

## 11) Useful Commands Cheat Sheet

```bash
# Start API (GPU)
cd /Users/nishit.gupta/personal/ace-step/ACE-Step-1.5 && ACESTEP_DEVICE=mps ACESTEP_INIT_LLM=false mise exec -- .venv/bin/acestep-api --host 127.0.0.1 --port 8001

# Generate (skills wrapper)
cd /Users/nishit.gupta/personal/ace-step/ace-step-skills/skills/acestep && bash ./scripts/acestep.sh generate -c "your caption" -l "[Verse] your lyrics" --duration 25 --steps 10 --batch 1 --no-thinking

# List outputs
ls -lt /Users/nishit.gupta/personal/acestep_output | head

# Play latest
afplay "$(ls -t /Users/nishit.gupta/personal/acestep_output/*.mp3 | head -n 1)"
```

---

## 12) Quality Tips

- Generate 3 variants, keep best hook, regenerate with refined caption.
- Prefer one strong mood over many mixed moods.
- Keep chorus repetitive and memorable.
- If vocals sound weak: simplify lyric syllables and shorten lines.
- If beat feels flat: add instrument descriptors in caption (e.g., "sidechained bass", "snappy clap", "airy top lead").

