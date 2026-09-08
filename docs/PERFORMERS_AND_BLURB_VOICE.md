# Performer Layer and Procedural Blurb Voice

Status: screen-space proof implemented; stage-native performer runtime proposed

## Problem

Tokovo can already direct deterministic phone-native stories through app state,
notifications, keyboards, camera, music, sound effects, and scheduled voice
segments. The phone currently performs most of the story by itself.

We want an original cast of chibi human/creature hybrids to act around the
phone:

- react to messages, notifications, typing, and public posts;
- look toward a phone, another performer, or a semantic app subject;
- speak in a cute, intelligible-by-emotion nonsense language;
- remain synchronized with camera movement and audio;
- preserve deterministic replay and checked-in episode authoring.

The first target is `the-apology-template-went-live`. It should prove five
meaningful reaction beats without turning every UI event into character motion.

## Product Principle

The phone carries plot information. Performers carry emotion.

Characters should not repeat every message through acting or voice. They should
clarify who has power, who caused the problem, how the situation escalates, and
where the punchline lands.

## Implemented Proof

`mint-sprite-three-message` is the first end-to-end proof. It renders an
eight-second WhatsApp scene with three escalating messages, one stable
Mint Sprite identity, three full-body reaction poses, and three independently
scheduled procedural voice segments:

| Beat | Phone event | Performer | Blurb |
| --- | --- | --- | --- |
| confidence | “You scheduled the launch post, right?” | proud | `mibi-mibi` |
| realization | “It went to the entire company.” | frozen | `bwo-tik` |
| confession | “That was the apology draft.” | guilty | `mwa-nono` |

Render it with:

```bash
EPISODE_ID=mint-sprite-three-message \
  OUT_FILE=out/mint-sprite-three-message.mp4 \
  pnpm --filter video-runner render:fast
```

The proof adds a typed `overlay.performer()` authoring primitive. It preserves
transparent full-body art and deterministic frame-based entrance timing. This
is intentionally a screen-space prototype: it proves the character, voice,
message pacing, and authoring loop, but it does not replace the stage-native
performer architecture described below.

The generated voice manifest now directly satisfies Tokovo voice playback
requirements with stable `speaker`, timing, and a fixed deterministic
`generatedAt` value. Public voice paths are resolved through Remotion's static
asset boundary before playback.

`ensemble-launch-room` expands that proof into a reusable three-character cast:

| Performer | Story function | Stable vocal fingerprint | Reaction arc |
| --- | --- | --- | --- |
| Mint Sprite | eager operator who caused the mistake | bright, elastic, quick pitch movement | proud → frozen → guilty → relieved |
| Teal Manager | producer who discovers the problem | medium-low, clipped, narrow contour | calm → suspicious → judgmental |
| Violet Founder | final authority who reframes the failure | low, slow, dry, minimal syllables | composed → interrupting → verdict |

The 26-second iPhone scene uses eight short blurbs across three identities. It
does not vocalize typing or every message. Voice is reserved for changes in
certainty, exposure, and power, while keyboard taps and WhatsApp cues preserve
the phone's native rhythm. A long silent typing hold before Violet's verdict
creates anticipation without adding dialogue.

The camera plan uses seven shots: a three-person tableau, Teal's accusation,
Mint's keyboard confession, Violet's first question, the held-breath typing
beat, the engagement payoff, and a hard-cut final verdict. Semantic WhatsApp
subjects drive the close-ups; the performers remain a screen-space prototype.

Generate the reusable cast audio and render the proof with:

```bash
pnpm --filter @tokovo/blurb-voice blurb:ensemble-demo

EPISODE_ID=ensemble-launch-room \
  OUT_FILE=out/ensemble-launch-room.mp4 \
  pnpm --filter video-runner render:fast
```

`createCastScript()` validates the cast, rejects unknown character IDs, and
keeps each line tied to a stable performer definition. The same Mint, Teal, and
Violet identities can therefore recur in later episodes while emotion,
intensity, duration, and contour change per beat.

## Proposed Solution

Build two connected systems:

1. a Tokovo performer asset and runtime system;
2. an offline procedural blurb-voice generator.

The performer system owns visual choreography. The voice system owns audio,
segment timing, and signal analysis. Episode authoring connects them through
stable performer and utterance IDs.

## Reusing the Pet Asset Workflow

The existing animated-pet workflow is useful as an asset-production and QA
foundation. It already provides several things we need:

- canonical character references;
- identity-locked animation rows;
- generated poses grounded by approved reference art;
- deterministic extraction and transparent atlas assembly;
- contact sheets and motion previews;
- explicit gaze-direction QA;
- checks for clipping, scale popping, background contamination, and identity
  drift.

The packaged pet format should not become the Tokovo runtime format. Its fixed
cell dimensions, animation names, atlas contract, and app manifest target a
different renderer.

Create a Tokovo-specific skill, tentatively named `$hatch-performer`, by adapting
the workflow and its deterministic image-processing scripts. The skill should
produce Tokovo performer assets rather than install Codex pets.

### Performer Asset Contract

A practical first version should use transparent WebP atlases with cells large
enough for a 1080x1920 render. A starting point is approximately 512x640 per
frame, subject to render tests.

Initial animation states:

- `idle`
- `speaking`
- `confused`
- `suspicious`
- `panic`
- `smug`
- `deadpan`
- `defeated`
- `celebrate`
- `look_left`
- `look_right`
- `look_down_at_phone`

Each performer also needs waveform-mouth poses:

- `closed`
- `small`
- `medium`
- `wide`

The performer manifest should declare frame geometry, animation rate, loop
behavior, foot or body registration point, face anchor, mouth anchor, and
allowed gaze targets.

```ts
interface PerformerManifest {
  id: string;
  atlasPath: string;
  frame: { width: number; height: number };
  anchors: {
    registration: { x: number; y: number };
    face: { x: number; y: number };
    mouth: { x: number; y: number };
  };
  states: Record<
    string,
    {
      row: number;
      frames: number;
      fps: number;
      loop: boolean;
    }
  >;
  mouth: {
    closed: number;
    small: number;
    medium: number;
    wide: number;
  };
}
```

Generated assets must be recorded in the repository's asset provenance and
licensing records before they become public showcase media.

## Performer Runtime

Performers must be stage nodes rather than generic overlays. A screen-space
overlay would float independently when the camera reframes or zooms the phone.

The stage contract should gain a performer source:

```ts
type StageNodeSourceIR =
  | { kind: "device"; deviceId: string }
  | { kind: "performer"; performerId: string }
  | { kind: "background" }
  | { kind: "overlay"; overlayId: string }
  | { kind: "group" };
```

This allows:

- performers behind or in front of a phone through `zIndex`;
- camera movement to affect the phone and performers together;
- semantic camera subjects such as performer face and mouth;
- intentional bottom-edge cropping;
- group framing without render-pixel guesses.

Suggested package boundaries:

```text
packages/performers
  src/types
  src/runtime
  src/dsl
  src/render
  src/assets

packages/blurb-voice
  src/presets
  src/synthesis
  src/types
  src/wav
```

Performer state must remain deterministic. Animation frames are selected from
the episode frame, authored event frame, performer manifest, and episode seed.
Do not use wall-clock time, random browser state, CSS animation, or live network
generation.

### Proposed Episode Authoring

```ts
.performers(signalCast, (cast) => {
  cast.at("0s").enter("coral", {
    placement: "bottomLeft",
    reaction: "confused",
  });

  cast.at("1.2s").speak("teal", "mira_accuse", {
    reaction: "suspicious",
    lookAt: "phone",
  });

  cast.at("3.6s").react("coral", "panic");

  cast.at("7.3s").groupReact({
    teal: "slow_turn",
    coral: "caught",
    amber: "brace",
  });

  cast.at("40.8s").speak("violet", "rename_file", {
    reaction: "deadpan",
  });
})
```

The compiler should fail loudly when a performer, animation state, placement,
voice segment, or semantic target is missing. It should also detect conflicting
states and overlapping speech for the same performer.

## Procedural Blurb Voice

### Goal

Create expressive original nonsense speech that communicates personality and
emotion without sounding like realistic dialogue or copying an existing
fictional language.

The generator should control:

- base pitch;
- pitch contour and range;
- perceived vocal size;
- speed and rhythm;
- syllable selection;
- consonant hardness;
- breathiness;
- roughness or vocal fry;
- electronic beep content;
- intensity and loudness;
- pauses, hesitation, and interruption.

### Perceptual and Psychological Direction

Pitch is not identity. Each recurring performer needs a stable multi-cue
fingerprint that viewers can learn quickly:

- a small personal phonotactic inventory;
- a repeating phrase-level pitch motif;
- characteristic cadence regularity and hesitation behavior;
- a consistent timbral profile built from formants, spectral tilt, breath,
  roughness, and warmth;
- a restrained onset transient that triggers orientation at important beats.

The familiarity comes from the repeated fingerprint. Novelty comes from
emotion, intensity, punctuation, and the occasional seeded deviation. Constant
high-frequency beeping or unpredictable pitch movement will create fatigue
rather than retention, so electronic chirps should be brief and tied to
syllable attacks.

Emotional readability should use redundant cues. Panic, for example, combines
higher register, faster cadence, wider pitch motion, shorter pauses, and
irregular hesitation. Sadness combines slower cadence, lower contour, softer
attacks, breath, and longer pauses. This makes the performance readable even
when a listener does not consciously notice any single cue.

### Chat Use-Case Rule

Do not dub the chat. Viewers need enough quiet to read the phone.

Use performer voice for a change in emotional state, power, certainty, or
social exposure. Keep keyboard taps, sends, incoming-message pings, and
notifications in the UI sound layer. Typing can receive one quiet anticipatory
murmur, but never a continuously looping voice.

For `the-apology-template-went-live`, the useful vocal beats are:

| Episode beat                    | Voice intent          | Performance purpose                         |
| ------------------------------- | --------------------- | ------------------------------------------- |
| Mira asks who uploaded the file | controlled accusation | establish authority and direct blame        |
| Dev says not to open X          | urgent warning        | interrupt the existing rhythm               |
| X is opened anyway              | caught panic          | transfer the viewer into Coral's reaction   |
| the public excuse is composed   | nervous justification | make typing feel like a bad decision        |
| the meme numbers arrive         | bad-news realization  | let consequence replace frantic energy      |
| CEO says engagement doubled     | smug reframe          | change failure into an absurd power move    |
| Coral asks if this is strategy  | hesitant question     | create uncertainty before the final button  |
| CEO says rename the file        | deadpan verdict       | land the joke with silence before and after |

The legal reveal, ordinary app navigation, notification banner, story advance,
and every intermediate chat bubble do not need character voice. Their native
UI sounds and the performers' silent reactions are more effective.

### Why Generate Offline

Core rendering must not call a speech provider or synthesize from live state.
Voice assets should be generated before rendering and checked into the asset
surface with their manifests.

The same script, parameters, generator version, and seed must produce the same
PCM bytes and timing data. A pure TypeScript PCM/WAV generator running on the
pinned Node toolchain is preferable to browser Web Audio because it is easier
to make byte-stable across renders.

### Three Possible Approaches

#### 1. Realistic TTS reading nonsense

This is easy with the existing voice provider integration, but it is not the
preferred product direction. It can sound too human, costs money per
generation, and gives less precise control over the product's vocal identity.

#### 2. Sample-bank sequencing

Record or generate a small bank of syllables for each performer, then sequence,
pitch, stretch, and layer them in code. This can sound warm and characterful,
but independent pitch and duration control requires more audio-processing
machinery.

#### 3. Code-generated source-filter synthesis

Generate a glottal source, consonant noise, vowel formants, amplitude envelopes,
pitch curves, and optional oscillator beeps directly into PCM samples. This is
fully controllable, original, cheap, and deterministic, although it needs
tuning to avoid sounding like a generic game sound.

Recommendation: begin with the standalone `@tokovo/blurb-voice` package and its
source-filter synthesis plus subtle electronic layer. Its first implementation
uses original performer-specific syllable inventories as data; recorded
syllable samples can later replace or warm the oscillator source without
changing episode authoring or the output manifest.

## Code-Generated Voice Model

### Voice Identity

Do not model gender as pitch alone. Perceived vocal character comes from a
combination of base pitch, formant scale, spectral tilt, breathiness, rhythm,
and performance.

Expose neutral acoustic controls:

```ts
interface BlurbVoice {
  id: string;
  basePitchHz: number;
  pitchRangeSemitones: number;
  formantScale: number;
  spectralTilt: number;
  breathiness: number;
  roughness: number;
  electronic: number;
  tempo: number;
}
```

Higher pitch plus higher formants tends to read as smaller or brighter. Lower
pitch plus lower formants tends to read as larger or deeper. These controls can
produce masculine, feminine, and androgynous impressions without hard-wiring
stereotypes into the engine.

Suggested cast starting points:

| Performer      | Acoustic direction                                  |
| -------------- | --------------------------------------------------- |
| Teal manager   | medium-low, clipped, controlled, narrow pitch range |
| Coral intern   | higher, quick, elastic, frequent pitch jumps        |
| Violet founder | low, slow, dry, almost no wasted syllables          |
| Amber analyst  | medium-high, hesitant, soft attacks, audible pauses |

### Speech-Like Synthesis

Generate each syllable from small deterministic components:

1. a consonant attack such as a plosive burst, nasal hum, fricative, or glide;
2. a pitched glottal source;
3. vowel resonances using two or three formant filters;
4. an ADSR-style amplitude envelope;
5. a pitch contour;
6. optional noise, tremolo, distortion, or beep oscillators.

Example vowel formants can be stored as data:

```ts
const vowels = {
  a: { f1: 800, f2: 1150, f3: 2900 },
  e: { f1: 450, f2: 2000, f3: 2800 },
  i: { f1: 300, f2: 2300, f3: 3000 },
  o: { f1: 500, f2: 900, f3: 2600 },
  u: { f1: 350, f2: 800, f3: 2400 },
};
```

The voice's `formantScale` multiplies these resonances. Pitch is calculated in
semitones:

```ts
const pitchHz = basePitchHz * 2 ** (semitones / 12);
```

The generator writes 48 kHz mono PCM16 WAV. Compression can happen later if
needed; WAV is simpler for deterministic generation and browser decoding.

### Emotion Presets

Emotion is a parameter bundle, not a separate voice.

```ts
interface BlurbPerformance {
  emotion:
    | "neutral"
    | "angry"
    | "annoyed"
    | "panic"
    | "confused"
    | "sad"
    | "smug"
    | "deadpan";
  intensity: number;
  length: "tiny" | "short" | "medium" | "long";
  finalContour?: "rise" | "fall" | "flat";
}
```

Initial behavior:

| Emotion      | Synthesis changes                                                            |
| ------------ | ---------------------------------------------------------------------------- |
| Angry        | harder attacks, faster onset, greater loudness, roughness, compressed pauses |
| Annoyed      | lower contour, short clipped syllables, narrow pitch range                   |
| Panic        | higher pitch, faster tempo, jitter, irregular micro-pauses                   |
| Confused     | final rising contour, uneven syllable lengths                                |
| Sad/defeated | lower pitch, slower tempo, falling contour, more breath                      |
| Smug         | relaxed tempo, small upward inflection, controlled ending                    |
| Deadpan      | almost flat contour, low variance, one or two short syllables                |

### Beeps and Electronic Character

The `electronic` control crossfades an oscillator layer with the vocal layer.
It can use sine, triangle, or softened square waves at harmonically related
frequencies.

Beep placement should follow syllable attacks and emphasis rather than run as a
constant robot effect. The character should still feel alive.

Examples:

- teal antenna ping on a stressed syllable;
- coral upward chirp during panic;
- violet low two-note confirmation;
- amber small hesitation beep before continuing.

### Deterministic Nonsense Language

Use an authored phoneme inventory rather than random letters:

```text
consonants: b, d, g, k, m, n, r, v, w, z
vowels: a, e, i, o, u
specials: hm, eh, tik, blu, wah
```

A seeded PRNG chooses allowed syllables and rhythm. The seed should contain the
episode ID, performer ID, and utterance ID:

```text
the-apology-template-went-live/coral/caught_01
```

Dialogue text does not need to be pronounced. It may inform duration,
punctuation, emphasis, and emotional shape while the authored `intent`
determines vocabulary and cadence.

```ts
blurb({
  id: "mira_accuse",
  performer: "teal",
  intent: "controlled_accusation",
  emotion: "annoyed",
  intensity: 0.72,
  length: "medium",
  finalContour: "fall",
});
```

## Voice Output and Existing Integration

Add a generator command such as:

```bash
pnpm --filter @tokovo/voice blurb:generate \
  packages/episodes/src/stories/the-apology-template-went-live.voice.ts
```

Generated artifacts:

```text
packages/assets/public/voice/the-apology-template-went-live-blurbs.wav
packages/assets/public/voice/the-apology-template-went-live-blurbs.json
```

The manifest should retain the existing segment fields and add optional
analysis data:

```ts
interface BlurbSegmentAnalysis {
  frameRate: number;
  energy: number[];
  emphasisFrames: number[];
}
```

The existing voice layer can schedule the segments and duck music:

```ts
.voice(apologyBlurbs, (voice) => {
  voice.at("1.2s").play("mira_accuse");
  voice.at("3.6s").play("legal_reveal");
  voice.at("7.3s").play("dev_warning");
  voice.at("40.8s").play("rename_file");
})
```

The voice package continues to own audio and timing data. The performer layer
maps segment energy onto the four waveform-mouth frames.

Energy-to-mouth mapping:

```text
0.00-0.20 -> closed
0.20-0.45 -> small
0.45-0.75 -> medium
0.75-1.00 -> wide
```

Because the energy envelope is created by the same synthesizer that writes the
audio samples, mouth motion does not require phoneme recognition or a second
analysis pass.

## First Pilot Reaction Plan

Use five reactions in `the-apology-template-went-live`:

1. Coral enters from below the phone, confused by the filename.
2. The legal placeholder appears; teal freezes and its antenna twitches.
3. "Do not open X"; the group slowly looks toward coral reaching for the phone.
4. The Instagram notification arrives; coral panic-shakes while teal performs a
   silent judgmental look.
5. "No. Rename the file"; violet delivers a tiny low blurb and coral visibly
   deflates.

Each reaction should have anticipation, a readable peak pose, and a short
settle. Do not trigger performer motion for every message.

## Implementation Slices

### Slice 1: acoustic proof

- Implement deterministic WAV writing and seeded PRNG.
- Implement two consonants, three vowels, pitch contours, formant scaling, and
  beep layering.
- Produce one coral utterance in neutral, angry, panic, high, low, bright, and
  deep variants.
- Render a listening sheet or comparison video before expanding the engine.

### Slice 2: one performer proof

- Adapt the pet-generation workflow for one coral performer.
- Generate idle, speaking, panic, caught, and defeated states.
- Add the performer manifest and a screen-space prototype renderer.
- Synchronize mouth frames to the generated energy envelope.

The screen-space renderer is acceptable only for the proof. It should not
become the final multi-camera architecture.

### Slice 3: stage-native runtime

- Add performer IR and schemas.
- Add the performer DSL and compiler lowering.
- Add performer stage-node evaluation and rendering.
- Add semantic face and mouth anchors.
- Validate missing assets, states, targets, and event conflicts.

### Slice 4: full cast and pilot

- Generate and QA all four performer atlases.
- Tune four distinct procedural voices.
- Add the five authored reaction beats.
- Render, inspect, and adjust camera framing, voice levels, reaction holds, and
  visual density.

## Success Criteria

The first version succeeds when:

- viewers can distinguish all four performers with the screen hidden;
- anger, panic, confusion, and deadpan are identifiable without subtitles;
- speech and waveform-mouth motion remain synchronized;
- camera moves preserve performer placement relative to the phone;
- the same episode input produces byte-stable voice assets and frame-stable
  animation;
- a new episode can reuse the cast through a small number of `.speak()` and
  `.react()` calls;
- no live provider, wall-clock timing, or unseeded randomness is required
  during rendering.

## Open Questions

- Should performers normally remain partially visible or enter only for
  reactions?
- Is 512x640 sufficient for close camera framing, or do we need a larger source
  cell?
- Should voice generation create one mixed file per episode or one file per
  utterance?
- How much electronic beep content remains cute before becoming robotic?
- Do captions show real message text, blurb syllables, or no voice captions?
- Should `.speak()` schedule voice automatically, or should voice and performer
  tracks remain explicitly separate with compile-time cross-validation?

Slice 1 now lives in `packages/blurb-voice`. Run its `blurb:demo` command to
generate the first cast listening sheet. The immediate product decision is
whether the four voices are sufficiently charming and distinguishable before
we connect the package to the complete performer runtime.

## Remaining Production Work

The procedural v2 engine is a performance and prototyping foundation. It is not
the final quality ceiling.

### P0: warmth and listening quality

- record or generate an original, licensed bank of 12 to 24 warm source
  syllables and nonverbal gestures per performer;
- retain the current intent, cadence, coarticulation, pitch, timing, and mouth
  analysis engine while replacing the oscillator source where useful;
- add performer breaths, scoffs, gasps, hums, tiny laughs, sighs, and cut-off
  protests because many chat reactions should not sound like speech;
- loudness-normalize and audition on phone speakers, earbuds, and laptop
  speakers rather than trusting waveform statistics alone;
- run blind tests for performer recognition, emotional recognition, cuteness,
  fatigue, and punchline timing.

### P1: language identity

- create recurring morphemes for yes, no, warning, confusion, names, and
  emphasis instead of choosing every syllable independently;
- give each performer one or two restrained signature sounds;
- prevent noticeable repetition inside an utterance unless repetition is the
  performance choice;
- make recurring sounds memorable enough for viewers to imitate without
  resembling an existing fictional language.

The first proof is `mint-sprite-three-message`: eager `mibi-mibi`, alarmed
`bwo-tik`, then guilty `mwa-nono`. It uses a three-turn confidence, realization,
confession arc to test whether viewers learn meaning from repetition, prosody,
timing, and context without translation.

`BlurbCharacter` is the reusable unit. It keeps voice identity and language
stable across episodes. `BlurbCharacterLine` changes the message, speech act,
tone, stakes, audience, interruption state, and seed. The resolver selects a
valid phrase from the character language and emits a normal `BlurbUtterance`;
the existing deterministic synthesizer remains the only rendering path.

### P1: episode and performer integration

- [x] schedule generated assets through the current voice and audio system;
- [x] add a deterministic screen-space performer proof with replaceable pose lanes;
- connect segment energy to performer mouth poses;
- add interruption, turn-taking, music ducking, and intentional overlap rules
  to compilation;
- position voices spatially with the character around the phone;
- implement the performer stage nodes, reactions, semantic camera anchors, and
  the five pilot choreography beats.

### P2: production tooling

- add a listening-lab command that renders controlled A/B variants;
- cache source syllables and generated utterances by content hash;
- add asset provenance and licensing entries for approved voice banks;
- expose a small director UI only after the TypeScript contracts stabilize.
