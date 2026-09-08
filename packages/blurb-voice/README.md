# @tokovo/blurb-voice

Deterministic procedural character voices for Tokovo performers.

The package converts authored intent into original nonsense syllables, renders
mono PCM16 WAV audio, and emits a matching energy envelope for mouth animation.
It has no provider, browser, React, Remotion, or runtime network dependency.

## Chat direction, not message dubbing

The phone presents the literal words. Blurb voices provide the emotional
interpretation. Do not vocalize every incoming bubble, keyboard tap, send sound,
or notification.

Author the dramatic job:

| Chat moment                    | Intent                  | What viewers should hear            |
| ------------------------------ | ----------------------- | ----------------------------------- |
| Controlled blame               | `controlled-accusation` | clipped rhythm and a falling finish |
| Someone tries to stop a reveal | `urgent-warning`        | short, interrupting urgency         |
| The culprit realizes the error | `caught-panic`          | elastic burst with unstable pitch   |
| A bad excuse is being composed | `nervous-justification` | breathier, rising uncertainty       |
| Consequences finally land      | `bad-news-realization`  | slower rhythm and downward weight   |
| Authority reframes the failure | `smug-reframe`          | relaxed control with a slight lift  |
| A risky question is typed      | `hesitant-question`     | soft attack and unresolved rise     |
| The punchline verdict lands    | `deadpan-verdict`       | a tiny phrase surrounded by silence |

Each intent supplies emotion, intensity, length, phrase ending, recommended
silence, prominence, and interruption behavior. Every value remains
individually overridable by the episode director.

## Reusable character actors

A character owns the stable identity:

- voice body and timbre;
- recurring lexicon and phrase variants;
- baseline expressiveness;
- cadence, pitch motif, warmth, coarticulation, and signature attacks.

Each line supplies the changing situation:

```ts
const script = createCharacterScript(
  "mint-launch-mistake",
  MINT_SPRITE_CHARACTER,
  [
    {
      id: "done",
      message: "Done!",
      act: "confirm",
      tone: "excited",
      context: { stakes: 0.3, audience: "private" },
    },
    {
      id: "everyone",
      message: "Wait. Everyone?",
      act: "realize",
      tone: "confused",
      context: { stakes: 0.9, audience: "public" },
    },
    {
      id: "wrong-draft",
      message: "I used the wrong draft.",
      act: "confess",
      tone: "sad",
      context: { stakes: 0.8, audience: "group" },
    },
  ],
);
```

The message influences phrase size and deterministic variant selection. The
speech act chooses semantic vocabulary and timing. Tone changes prosody without
changing identity. Stakes and audience alter intensity; public mistakes read
as more socially exposed than private ones. Identical inputs always resolve to
the same performance.

## Listen to the first cast

```bash
mise exec -- pnpm --filter @tokovo/blurb-voice blurb:demo
mise exec -- pnpm --filter @tokovo/blurb-voice blurb:chat-demo
mise exec -- pnpm --filter @tokovo/blurb-voice blurb:micro-demo
```

The command writes:

```text
packages/blurb-voice/generated/tokovo-cast-listening-sheet/
  tokovo-cast-listening-sheet.wav
  tokovo-cast-listening-sheet.json
  stems/
    1-teal-controlled.wav
    2-coral-caught.wav
    ...
```

Generated listening tests stay out of git. Episode-ready audio should be copied
to `packages/assets/public/voice` only after approval and provenance review.

## Authoring

```ts
import { generateBlurbScript, TOKOVO_CAST_VOICES } from "@tokovo/blurb-voice";

const result = generateBlurbScript({
  id: "apology-pilot",
  voices: {
    coral: TOKOVO_CAST_VOICES["coral-intern"],
  },
  utterances: [
    {
      id: "caught",
      performer: "coral",
      text: "Wait, that file went live?",
      intent: "caught-panic",
      emotion: "panic",
      intensity: 0.86,
      length: "medium",
    },
  ],
});
```

`text` guides duration and punctuation but is never spoken. A seeded inventory
selects nonsense syllables, while the performer preset and emotion control
pitch, vowel formants, rhythm, breath, roughness, attacks, and electronic tone.

## Perceptual identity

Each cast preset combines several cues instead of using pitch as a shortcut:

- a performer-specific phonotactic inventory;
- a repeating phrase-level pitch motif;
- controlled versus elastic cadence;
- characteristic hesitation frequency;
- formant scale, warmth, breath, roughness, and spectral tilt;
- short onset chirps that attract attention without becoming a constant robot
  tone.

Questions, exclamations, and authored final contours shape phrase endings.
Mouth poses use hysteresis and step-limited movement so noisy energy changes do
not create visual chatter.

Version 2 adds moving vowel formants, consonant-specific plosive, fricative,
nasal and glide attacks, correlated pitch drift, onset scoops, amplitude
microvariation, and performer-specific coarticulation. These prevent the
syllables from behaving like isolated oscillator notes.

## Three-message character test

`mint-sprite` demonstrates the minimum useful language-learning loop:

1. `mibi-mibi` — eager confirmation;
2. `bwo-tik` — delayed realization and danger;
3. `mwa-nono` — tiny guilty confession.

The pattern uses short turns for processing fluency, repetition for character
recognition, contrast for emotional readability, and a slower final button for
comic timing. Exact `lexemes` are authored when a recurring sound matters;
ordinary lines can continue using seeded selection from the performer's
inventory.

## Determinism

The generator uses a seeded PRNG and a pure TypeScript synthesis path. Under the
repository's pinned Node toolchain, identical script data produces identical
PCM, WAV bytes, segment timings, syllables, and mouth envelopes.
