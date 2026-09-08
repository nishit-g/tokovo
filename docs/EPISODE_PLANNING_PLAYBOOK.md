# Episode Planning Playbook

**Status:** Active creative-production standard  
**Applies to:** Every narrative Tokovo episode, from concept through release  
**Primary artifact:** A checked-in episode plan completed before DSL implementation

## Purpose

Tokovo episodes are miniature shows staged inside and around phones. A strong episode is not merely
a sequence of messages. It coordinates five systems:

1. the phone carries plot information;
2. performers carry emotion and social power;
3. the camera controls attention;
4. sound controls anticipation and impact;
5. the ending creates recall, replay, and sharing.

Planning these systems together prevents technically impressive episodes with weak stories,
arbitrary character motion, unreadable screens, or audio that competes with the joke.

The plan is a creative contract, not a frame-by-frame prison. It should make the intended experience
clear enough that implementation decisions can be judged against it.

## Production Sequence

```mermaid
flowchart LR
  A["Premise and audience"] --> B["Beat sheet"]
  B --> C["Chat and screen script"]
  C --> D["Cast and emotional map"]
  D --> E["Visual, voice, sound, and camera direction"]
  E --> F["Thumbnail and publishing hook"]
  F --> G["Tokovo DSL implementation"]
  G --> H["Preview and editorial review"]
  H --> I["Release render and quality gates"]
```

Do not begin with camera calls, character images, or message animations. Begin with the promise of
the episode and the change that happens by the end.

## 1. Episode Promise

Write one sentence that answers:

> Why will someone keep watching this particular episode?

Example:

> A manager accidentally sends the brutally honest draft to the whole company, and the team slowly
> realizes what happened.

The promise should imply a question, danger, contradiction, or social tension. It must be specific
enough to exclude unrelated jokes.

Record:

- **Audience:** developers, managers, startup teams, creators, friends, families, or a broad audience;
- **primary emotion:** suspense, cringe, delight, panic, curiosity, satisfaction, or recognition;
- **fantasy or fear:** what the viewer wants to happen or is afraid will happen;
- **novelty:** what makes this more than a screenshot of a chat;
- **share trigger:** why someone would send it to another person;
- **aftertaste:** the feeling the final frame should leave.

Good share triggers include:

- “This is literally our team.”
- “You are the Violet in this chat.”
- “I have done exactly this.”
- “Wait for the last message.”
- “Send this to your manager.”

## 2. Format and Constraints

Decide the delivery shape before writing the full script:

| Decision      | Questions                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Duration      | Is this a 10-second gag, 20–35-second scene, or a longer episode?          |
| Aspect ratio  | Is portrait the master? Are square and landscape crops required?           |
| Platform      | Shorts, Reels, TikTok, X, product showcase, or documentation?              |
| Devices       | One phone, multiple devices, or phone plus OS interruptions?               |
| Apps          | Which app owns the story? Does switching apps add necessary meaning?       |
| Performers    | How many characters can the viewer understand in this duration?            |
| Accessibility | Must the story work muted? Are captions or reduced-motion variants needed? |
| Loop          | Should the ending connect naturally back to the opening?                   |

For a 20–35-second chat episode, three performers are a strong default:

- one person causes or owns the problem;
- one person reacts on behalf of the audience;
- one person changes the power dynamic.

Add a fourth character only if they create a distinct story function.

### Default social-video duration

For an individual Tokovo chat-comedy episode, begin with a **24-second portrait master** at
1080×1920. Treat 18–30 seconds as the normal working range. This is an editorial default rather
than a platform maximum.

Use one clean master for Shorts, Reels, and TikTok until retention evidence justifies
platform-specific edits. Normal YouTube videos should usually compile several complete episodes
rather than stretching one short premise.

A useful 24-second allocation is:

| Time   | Function                                |
| ------ | --------------------------------------- |
| 0–1.5s | Cold disruption                         |
| 1.5–5s | Problem becomes understandable          |
| 5–10s  | Exposure, consequence, or escalation    |
| 10–14s | Performer response and attempted fix    |
| 14–19s | Suspense, interruption, or false relief |
| 19–23s | Reversal or verdict                     |
| 23–24s | Reaction button or loop connection      |

Do not expand a premise merely to reach the default. A complete 12-second idea is stronger than a
padded 24-second one.

## 3. Beat Sheet

A beat is a meaningful change in information, emotion, or power. A new message is not automatically
a new beat.

Recommended shape for a 20–35-second episode:

| Time         | Beat                 | Job                                                 |
| ------------ | -------------------- | --------------------------------------------------- |
| 0–2s         | Disruption           | Begin after normality has already broken            |
| 2–6s         | Problem reveal       | Make the danger understandable                      |
| 6–12s        | Escalation           | Increase exposure, consequence, or misunderstanding |
| 12–18s       | Emotional processing | Let the cast and audience absorb it                 |
| 18–24s       | Attempted recovery   | Offer an answer, excuse, or plan                    |
| 24–30s       | Reversal or verdict  | Deliver the strongest change in meaning             |
| Final frames | Button               | Hold the reaction, reveal a tag, or create a loop   |

Each beat must do at least one of the following:

- reveal new information;
- raise the consequence;
- change who has power;
- contradict an assumption;
- force a decision;
- pay off something established earlier.

Delete beats that merely repeat the current emotion.

## 4. Chat and Screen Script

Write the final on-screen text before designing motion. Spoken blurbs, reactions, and camera moves
cannot rescue unclear writing.

For every screen event, specify:

- exact text;
- sender;
- send time;
- typing start and stop;
- delivery and read state;
- reply, reaction, edit, deletion, or forwarded state;
- notification or keyboard involvement;
- whether the screen must scroll;
- what information the audience should notice;
- the emotional consequence for each performer.

### Message-writing rules

- Enter late. Start close to the mistake, accusation, reveal, or decision.
- Prefer short, conversational text that can be read in under two seconds.
- Give each sender a recognizable rhythm and vocabulary.
- Use punctuation, hesitation, corrections, and silence as performance.
- Avoid exposition that real people would not type.
- Do not make every line a joke. Straight lines create contrast for the punchline.
- Make names, timestamps, reply context, and reactions earn their screen space.
- Ensure the conversation still makes sense without audio.

### Native phone micro-events

Use these as story punctuation, not decoration:

- keyboard appearing or disappearing;
- a burst of typing followed by deletion;
- typing indicator switching between participants;
- notification banner interrupting the current app;
- vibration or device movement;
- read receipts changing;
- reaction appearing after a deliberate delay;
- incoming call or call rejection;
- lock-screen interruption;
- camera shutter or screenshot;
- press-and-hold, reply, edit, forward, or delete;
- a pause where nothing arrives.

Every micro-event should create anticipation, provide evidence, or change the social situation.

## 5. Character Casting

Cast by story function before choosing attractive poses.

Useful functions include:

- **Instigator:** creates the problem or acts with dangerous confidence;
- **Audience surrogate:** expresses what the viewer is feeling;
- **Authority:** can approve, punish, or redefine the situation;
- **Wildcard:** misunderstands the situation or makes it worse;
- **Truth teller:** says what everyone else is avoiding;
- **Peacemaker:** attempts recovery and exposes deeper tension.

For each recurring character, maintain:

| Field              | Definition                                              |
| ------------------ | ------------------------------------------------------- |
| Core desire        | What they consistently want                             |
| Social strategy    | How they try to get it                                  |
| Contradiction      | The trait that makes them surprising                    |
| Status             | Their default power relative to the cast                |
| Silhouette         | Features recognizable at thumbnail size                 |
| Motion grammar     | Fast, contained, elastic, heavy, precise, or hesitant   |
| Resting expression | Their readable neutral state                            |
| Emotional range    | The states the asset system must support                |
| Voice fingerprint  | Pitch, cadence, syllables, texture, and signature sound |
| Recurring behavior | A visual or vocal habit viewers can learn               |

The character should be recognizable from silhouette, color blocking, motion, or voice before their
name is shown.

## 6. Character Visual Style

Tokovo's core direction is a **chibi human/creature hybrid**: human enough to carry workplace and
relationship stories, creature-like enough to create original intellectual property and exaggerated
emotion.

### Default style principles

- Use a head-to-body ratio near 1:1.5 to 1:2.5, adjusted by character personality.
- Keep hands, eyes, brows, and mouth readable at portrait-video scale.
- Use full-body silhouettes that remain distinct when reduced to approximately 120 pixels tall.
- Combine one human social signal with one creature motif, such as antennae, fins, cloud hair,
  horns, leaf ears, signal tails, or unusual skin.
- Prefer tactile, softly dimensional materials over generic glossy 3D plastic.
- Use controlled asymmetry so the cast feels designed rather than procedurally perfect.
- Avoid excessive costume detail that flickers, muddies silhouettes, or competes with the phone.
- Preserve identity across poses: face proportions, skin, hair mass, creature features, costume
  blocks, and registration points must not drift.

### Shape language

Shape communicates personality before motion:

| Shape family                  | Psychological reading                  | Useful roles                 |
| ----------------------------- | -------------------------------------- | ---------------------------- |
| Circles and soft curves       | safe, eager, innocent, social          | operator, intern, peacemaker |
| Tall rectangles               | controlled, competent, reserved        | manager, analyst, authority  |
| Triangles and sharp diagonals | decisive, dangerous, witty, suspicious | founder, critic, wildcard    |
| Uneven or elastic shapes      | unpredictable, creative, chaotic       | instigator, comic disruptor  |

Do not make villains simply sharp and heroes simply round. A visual contradiction is more memorable:
a soft character may hold the most power, while an intimidating character may panic first.

### Face and expression system

Every approved character should support:

- neutral;
- listening;
- speaking;
- suspicious;
- confused;
- realization;
- panic;
- guilty;
- defeated;
- smug;
- delighted;
- deadpan;
- look left, right, up, and toward the phone.

Expressions should change brows, lids, pupils, mouth, head angle, and body posture together. Swapping
only the mouth reads as mechanical.

### Costume system

- Give each character one dominant color block, one supporting neutral, and one small accent.
- Preserve the silhouette across episodes while allowing accessories or layers to change.
- Costumes should express role without becoming literal uniforms.
- Keep high-frequency patterns away from small moving areas.
- Reserve bright accents for face framing, hands, badges, or signature creature features.
- Define which items are identity-locked and which can change by episode.

### Style continuity

An episode may change lighting, palette, or costume accents, but it must not casually change:

- facial construction;
- body proportions;
- skin or creature-feature colors;
- hair silhouette;
- signature accessories;
- material language;
- relative height among the cast.

Create and approve a neutral turnaround, expression sheet, scale lineup, and palette card before
producing many poses.

## 7. Emotional State Map

Map each performer's internal state at every meaningful beat:

| Beat              | Instigator  | Audience surrogate | Authority           |
| ----------------- | ----------- | ------------------ | ------------------- |
| Message sent      | confident   | neutral            | absent or observant |
| Problem revealed  | defensive   | alarmed            | suspicious          |
| Consequence lands | bargaining  | frozen             | assessing           |
| Recovery attempt  | hopeful     | unconvinced        | silent              |
| Verdict           | embarrassed | relieved           | composed or smug    |

For each transition, record:

- what changed internally;
- who or what the character looks at;
- the first physical sign of the emotion;
- the main pose or gesture;
- whether the reaction is immediate, delayed, or suppressed;
- how long it should be held.

Suppressed reactions are often funnier than maximum expressions. Use exaggeration at the point of
greatest emotional change, not continuously.

## 8. Performer Choreography

Characters should not move for every UI event. Select approximately five to seven meaningful
performance beats for a 30-second episode:

1. establish the group and social hierarchy;
2. anticipate the first consequential message;
3. react to the reveal;
4. respond to escalation;
5. hold during uncertainty or typing;
6. react to the verdict;
7. settle into the final button.

Useful micro-actions:

- eyes move before the head;
- head turns before the torso;
- fingers freeze over an imaginary action;
- shoulders drop after bad news;
- a character leans toward or away from the phone;
- one character checks another before reacting;
- a character hides behind the device;
- antennae, ears, hair, or tail respond a few frames after the body;
- a character briefly looks at the audience;
- a confident pose slowly collapses.

Let the viewer read the message first. In most cases, begin the full reaction several frames after
the relevant information becomes legible.

## 9. Voice Direction

Each recurring character needs a stable vocal identity plus episode-specific emotional direction.
Refer to [Performer Layer and Procedural Blurb Voice](./PERFORMERS_AND_BLURB_VOICE.md) for the
technical voice system.

### Stable voice fingerprint

- base pitch and usable pitch range;
- speaking tempo;
- preferred syllable shapes;
- consonant hardness;
- breathiness, buzz, rasp, or roundness;
- melodic contour;
- phrase-ending behavior;
- signature sound or hesitation;
- maximum emotional intensity before identity breaks.

### Per-line direction

Every blurb should describe intent, not merely an emotion label:

```text
Character: Violet
Story intent: suspicious realization
Subtext: I already know the answer; I want you to admit it
Energy: 0.35
Pitch contour: narrow, then descending
Rhythm: slow — pause — quick ending
Syllable shape: "mm… va-da?"
Ending: restrained questioning chirp
```

Voice should mark changes in certainty, exposure, or power. Do not vocalize every message. Silence,
breathing room, and another character's reaction often communicate more.

## 10. Sound Design

Plan the sound in layers:

| Layer            | Job                                                                  |
| ---------------- | -------------------------------------------------------------------- |
| Native UI        | Makes taps, typing, delivery, notifications, and calls feel physical |
| Performer blurbs | Communicates identity, intention, and emotional change               |
| Foley            | Adds device movement, costume motion, or character weight            |
| Atmosphere       | Establishes space without distracting from phone detail              |
| Music            | Shapes expectation and energy across the scene                       |
| Silence          | Creates attention before reveals and verdicts                        |
| Stingers         | Marks rare reversals, failures, or punchlines                        |

Rules:

- UI sounds must not all have equal loudness.
- Typing should have human variation and stop exactly when anticipation matters.
- Duck atmosphere or music around information-dense messages.
- Give different characters different spectral space so blurbs remain distinguishable.
- Use the loudest or brightest cue sparingly.
- Preview on phone speakers as well as headphones.

Create a cue sheet with frame or time, source, purpose, intensity, duration, and ducking behavior.

## 11. Background, Palette, and Lighting

The background is emotional context, not unused space behind the phone.

### Background jobs

A background may:

- establish location;
- communicate mood before the first message;
- separate performers from the device;
- support readable silhouettes;
- reflect an emotional change;
- provide gentle motion during a held screen beat;
- create a recognizable series identity.

Choose one primary job and, at most, one secondary job. Avoid illustrative backgrounds so detailed
that they become another story surface.

### Background composition

- Keep the quietest value and texture region behind important text and faces.
- Separate the phone bezel from the background with value contrast, rim light, or temperature.
- Avoid tangents where background shapes appear to grow from heads, antennae, or the device.
- Use broad forms and low-frequency texture; keep small detail away from moving silhouettes.
- Design for the final camera program, not only the opening wide shot.
- Check the background behind translucent app surfaces and device glass.
- Preserve room for platform crops and thumbnail reframing.

### Color roles

Every episode palette should declare:

- **ground:** dominant background family;
- **plot color:** the phone or app color associated with information;
- **cast anchors:** stable identity colors for each performer;
- **tension accent:** a limited color introduced during danger or escalation;
- **payoff accent:** the color used for relief, success, reversal, or the final joke;
- **neutral:** the value family that keeps text and faces readable.

### Psychological color direction

| Story condition  | Palette tendency                                   | Use carefully                                      |
| ---------------- | -------------------------------------------------- | -------------------------------------------------- |
| Calm competence  | cool teal, navy, soft cream                        | too much blue can feel generic or corporate        |
| Suspicion        | violet, desaturated cyan, narrow warm accent       | avoid making every shadow black                    |
| Toxicity         | acidic yellow-green, bruised purple, warning coral | reserve acidity for escalation                     |
| Embarrassment    | warm pink, amber, sudden red                       | red everywhere removes the moment of impact        |
| Panic            | orange-red against cold ground                     | constant saturation becomes exhausting             |
| Awkward intimacy | peach, dusty rose, warm off-white                  | retain enough contrast for screen readability      |
| Relief           | mint, sky, softened warm light                     | introduce after tension rather than from frame one |
| Authority        | deep plum, navy, controlled gold                   | gold should signal status, not decoration          |
| Absurd comedy    | cheerful ground plus one socially “wrong” accent   | keep the phone legible                             |

Color meaning is contextual. The story must establish the association; do not assume a color has one
universal emotion.

### Color progression

Plan the palette across the beat sheet:

1. establish a stable base;
2. introduce a small tension accent when danger appears;
3. increase contrast or temperature separation during escalation;
4. reduce movement or saturation during the held-breath beat;
5. shift the accent, light, or balance at the payoff.

The change can be subtle. A five-percent light or temperature shift may be enough when paired with
sound and performance.

### Performer color continuity

Character identity colors remain stable, but their presentation may change through:

- warmer or cooler lighting;
- lowered saturation during defeat;
- a rim light during authority;
- environmental color spill;
- a temporary tension accent in an accessory or effect.

Never recolor a character so strongly that returning viewers cannot identify them.

### Lighting direction

Define:

- key-light direction;
- softness;
- background-to-subject contrast;
- phone-screen contribution;
- performer rim light;
- whether lighting changes at a story beat;
- how eyes and facial planes remain readable.

The phone may cast a subtle motivated light onto nearby performers, especially during close-ups.
Avoid making every character glow equally. Light should reinforce spatial relationship and power.

### Recommended palette record

```text
Ground:          #172237  deep blue
Ground secondary:#30245A  muted violet
Phone surround:  #F7F4EB  warm off-white
Teal anchor:     #197E87
Mint anchor:     #88D6AD
Violet anchor:   #7350A7
Tension accent:  #FF704F  coral
Payoff accent:   #F0C75E  controlled gold
Text dark:       #111426
```

Record intended roles beside color values. A palette without semantic roles is difficult to direct
consistently.

## 12. Camera Plan

For every shot, answer:

> What should the viewer notice now, and why is this framing better than holding the previous one?

A useful division:

- the phone provides information;
- performers provide emotion;
- wide shots explain relationships and status.

Plan:

- opening composition;
- establishing device and performer positions;
- message or semantic-subject emphasis;
- reaction close-ups;
- group reframing;
- holds during typing or silence;
- the punchline frame;
- transition types;
- final loop or exit.

Avoid moving the camera for every message. A held frame lets the audience read, anticipate, and find
small performance details. Use semantic camera subjects rather than render-pixel guesses. See
[Camera](./CAMERA.md) for authoring and quality requirements.

## 13. Retention and Attention Choreography

Retention is sustained curiosity, not constant noise.

The desired rhythm is:

> Fast information → readable reaction → small pause → escalation → longer suspense → immediate
> payoff.

Protect comprehension while varying emotional speed. Continuous frantic movement makes every event
feel equally unimportant.

Plan:

- an immediate change or unanswered question in the first two seconds;
- a small attention change approximately every one to two seconds during dense short-form scenes;
- a meaningful escalation every four to seven seconds;
- one dominant unanswered question at a time;
- a pattern interruption when the current rhythm becomes predictable;
- a silent or visually restrained moment before the strongest reveal;
- a final beat that rewards earlier attention.

Attention changes may be:

- a new message;
- camera emphasis;
- eye or head movement;
- typing indicator;
- keyboard appearance;
- notification;
- vibration;
- performer entrance;
- reaction delay;
- sound dropping out;
- palette or lighting shift.

Do not stack several attention devices on every beat. The phone, performer, sound, and camera should
take turns leading.

### Reading-time protection

New text needs recognition time in addition to literal reading time. A useful starting estimate for
short messages is:

```text
minimum readable hold in seconds = 0.65 + (word count × 0.24)
```

Adjust upward for unfamiliar names, nested replies, screenshots, multiple speakers, small type, or
important visual evidence. The message should become legible before the performer's full reaction
begins. Eye movement or a small intake of breath can start earlier without stealing attention.

### Micro-hook library

Micro-hooks are small sensory or social events that redirect attention, create an expectation, or
change perceived risk. They are directing tools, not decorative stimulation.

| Micro-hook                           | Psychological job                                   |
| ------------------------------------ | --------------------------------------------------- |
| Notification banner                  | Causes an orienting response toward new information |
| Screenshot flash                     | Interrupts the visual pattern and creates curiosity |
| Keyboard rising                      | Promises an imminent response                       |
| Irregular key tapping                | Produces motor urgency and emotional pressure       |
| Typing indicator                     | Opens a question about what will be said            |
| Typing indicator stopping            | Violates the expected completion                    |
| Typing indicator restarting          | Reopens and intensifies anticipation                |
| Delivery or read-state change        | Converts private action into social exposure        |
| Delayed reaction emoji               | Reveals judgment without explanatory dialogue       |
| Device vibration or recoil           | Gives a digital event physical consequence          |
| Long-press menu                      | Signals urgent correction or consequential choice   |
| Message deletion                     | Produces completion and possible false relief       |
| Failed deletion or send              | Frustrates expected control                         |
| Incoming call                        | Forces a new social channel and raises urgency      |
| Participant joining or coming online | Introduces a witness or authority                   |
| Slow camera push                     | Marks importance before the audience knows why      |
| Eye movement before head movement    | Redirects attention with minimal visual noise       |
| Performer freezing                   | Makes the audience search for the cause             |
| Sudden silence                       | Creates contrast and attention before a reveal      |
| Delayed reply                        | Sustains uncertainty and social evaluation          |
| Fourth-wall glance                   | Creates complicity between performer and viewer     |
| Unexpected final visual              | Rewards completion and encourages replay            |

Most micro-hooks exploit one of six useful mechanisms:

- **orientation:** humans notice sudden visual and auditory changes;
- **open loops:** incomplete actions remain mentally active;
- **prediction error:** a stopped or failed pattern demands re-evaluation;
- **social evaluation:** read receipts, reactions, and witnesses imply judgment;
- **motor resonance:** tapping, dragging, gripping, and vibration feel physically imaginable;
- **contrast:** stillness makes the next movement stronger, and silence makes the next sound clearer.

### Notification direction

Use notifications only when they alter the story. A notification should:

- introduce a threat or witness;
- reveal that another person saw something;
- interrupt a recovery attempt;
- change which app, device, or conversation matters;
- confirm that an action escaped its intended context.

Potential story-bearing notifications include:

- a reaction to a dangerous photo or message;
- several new messages arriving from the affected group;
- a call immediately following an incriminating send;
- a calendar reminder proving the meeting has already started;
- a lock-screen preview exposing a supposedly private reply;
- an upload, delivery, or deletion failure;
- an authority figure joining the call.

Notification copy, sound, vibration, performer reaction, and camera emphasis must operate as one
beat. Do not add a banner when the foreground chat already communicates the same information.
Respect the real behavior of the simulated operating system and app; invented system behavior makes
the phone feel untrustworthy.

### Attention hierarchy

At every moment, name one leader:

- **phone-led:** the audience must read or inspect information;
- **performer-led:** the audience must feel an emotional or power change;
- **sound-led:** anticipation or impact arrives before the visual answer;
- **camera-led:** a reframe reveals where importance has moved;
- **silence-led:** the absence of an expected event becomes the event.

Secondary layers may support the leader, but should not compete with it. A message, notification,
large reaction, camera move, bright color change, and loud sting should not all begin on the same
frame unless the intended effect is a singular story climax.

### Tempo waves

Build a short episode from contrasting tempo regions:

1. **snap:** one unmistakable event starts the problem;
2. **read:** preserve enough stillness to understand it;
3. **scatter:** use quick reactions or corrective actions;
4. **hold:** delay the answer and reduce sensory activity;
5. **strike:** deliver the verdict with clean audiovisual emphasis;
6. **button:** hold the resulting expression or connect it to the opening.

This creates perceived speed without sacrificing readability.

### Attention timing map

Record the micro-direction alongside story beats:

| Time/frame | Attention leader | Trigger | Micro-hook | Viewer question | Expected response |
| ---------- | ---------------- | ------- | ---------- | --------------- | ----------------- |
|            |                  |         |            |                 |                   |

Review the completed map for:

- stretches longer than approximately three seconds with no intentional attention change;
- repeated hooks of the same type;
- text that is replaced before its minimum readable hold;
- performer reactions that begin before the causal information is legible;
- noisy stacks with no clear leader;
- a climax that is less intense than an earlier decorative event.

## 14. Thumbnail and Publishing Hook

Plan the thumbnail before the final render so the episode contains a deliberate thumbnail moment.

A strong thumbnail usually contains:

- one understandable emotional situation;
- one readable message fragment or UI clue;
- two contrasting expressions or status positions;
- strong separation between phone, cast, and background;
- little or no additional text;
- an unresolved question.

Also prepare:

- title;
- opening caption;
- description or post copy;
- comment prompt;
- platform crops;
- loop behavior;
- follow-up episode possibility;
- which character or phrase can become a recurring series marker.

The thumbnail promises tension. The episode must satisfy that promise without revealing the entire
payoff in the image.

## 15. Editorial and Technical Quality Gates

### Story

- The first two seconds create curiosity.
- Every message reveals, escalates, reverses, decides, or pays off.
- The central situation can be summarized in one sentence.
- The ending changes or completes the meaning of the opening.
- The episode is understandable without audio.

### Performance

- Each performer has a distinct story function.
- Reactions follow causes and have readable timing.
- Characters are not continuously moving.
- Body, face, gaze, and voice express the same subtext.
- Character identity remains stable across poses and episodes.

### Visual direction

- The phone remains the clearest information surface.
- Background detail does not compete with messages or faces.
- Character silhouettes remain distinct at target size.
- Palette roles and emotional progression are intentional.
- Lighting keeps eyes, hands, and critical expressions readable.
- Text is readable on an actual phone-sized display.

### Camera and sound

- Every camera move has an attention purpose.
- Critical information is never covered by performers or crops.
- UI sounds, blurbs, music, and silence have a clear hierarchy.
- The strongest sound and visual emphasis are reserved for meaningful beats.
- The final release passes camera diagnostics without unintentional discontinuity.

### Determinism and release

- The same episode input and frame produce the same state and output.
- Assets are checked in or resolved through approved deterministic contracts.
- Asset provenance and licensing records are current.
- Focused tests, workspace validation, typecheck, and release lint pass.
- Representative stills and the full encoded master are reviewed.
- Platform exports use the approved master rather than an ad hoc preview render.

## Episode Plan Template

Copy this section into the planning artifact for a new episode.

```markdown
# Episode Plan: <working title>

## Identity

- Episode ID:
- Series:
- Status:
- Owner:
- Target duration:
- Master aspect ratio:
- Target platforms:
- App/device:

## Promise

- One-sentence premise:
- Audience:
- Primary emotion:
- Viewer fear or fantasy:
- Novelty:
- Share trigger:
- Intended aftertaste:

## Beat Sheet

| Time/frame | Story beat | New information | Emotional change | Power change | Retention job |
| ---------- | ---------- | --------------- | ---------------- | ------------ | ------------- |
|            |            |                 |                  |              |               |

## Final Screen Script

| Time/frame | Actor/source | Screen event or exact text | Native UI state | Story purpose |
| ---------- | ------------ | -------------------------- | --------------- | ------------- |
|            |              |                            |                 |               |

## Cast

| Character | Story function | Desire | Status | Motion grammar | Voice fingerprint |
| --------- | -------------- | ------ | ------ | -------------- | ----------------- |
|           |                |        |        |                |                   |

## Emotional State Map

| Beat | Character A | Character B | Character C |
| ---- | ----------- | ----------- | ----------- |
|      |             |             |             |

## Performer Choreography

| Time/frame | Character | Trigger | Gaze | Expression | Body action | Delay/hold |
| ---------- | --------- | ------- | ---- | ---------- | ----------- | ---------- |
|            |           |         |      |            |             |

## Voice Script

| Time/frame | Character | Story intent and subtext | Blurb shape | Energy | Pitch/rhythm |
| ---------- | --------- | ------------------------ | ----------- | ------ | ------------ |
|            |           |                          |             |        |              |

## Sound Cue Sheet

| Time/frame | Sound | Layer | Story purpose | Intensity | Duration/ducking |
| ---------- | ----- | ----- | ------------- | --------- | ---------------- |
|            |       |       |               |           |                  |

## Character Art Direction

- Shared style:
- Shape language per character:
- Identity-locked features:
- Episode costume changes:
- Required expressions/poses:
- Scale and silhouette constraints:
- Material/texture direction:

## Background, Palette, and Lighting

- Background job:
- Location/abstraction:
- Ground color:
- Plot color:
- Character anchor colors:
- Tension accent:
- Payoff accent:
- Neutral/value range:
- Color progression by beat:
- Key-light direction and softness:
- Phone-screen light:
- Rim-light strategy:
- Crop-safe quiet regions:

## Camera Shot List

| Shot | Time/frame | Subject | Framing/motion | Attention purpose | Transition |
| ---- | ---------- | ------- | -------------- | ----------------- | ---------- |
|      |            |         |                |                   |            |

## Retention Map

- First-two-second hook:
- Active unanswered question:
- Escalation checkpoints:
- Pattern interruption:
- Silent/held-breath beat:
- Payoff:
- Loop or replay device:

## Attention Timing Map

| Time/frame | Attention leader | Trigger | Micro-hook | Viewer question | Expected response |
| ---------- | ---------------- | ------- | ---------- | --------------- | ----------------- |
|            |                  |         |            |                 |                   |

- Reading-time exceptions:
- Notification story purpose:
- Tempo-wave summary:
- Noisiest intentional moment:
- Quietest intentional moment:

## Thumbnail and Distribution

- Thumbnail moment:
- Message fragment:
- Expression contrast:
- Background/color treatment:
- Title:
- Opening caption:
- Post copy:
- Comment prompt:
- Platform crops:
- Follow-up possibility:

## Acceptance Criteria

- [ ] Story is understandable muted.
- [ ] Every message advances the situation.
- [ ] Performers have distinct functions and readable reaction timing.
- [ ] Voice identities remain recognizable.
- [ ] Phone text is readable at delivery size.
- [ ] Background, palette, and lighting support the emotional arc.
- [ ] Camera never obscures critical information.
- [ ] Ending rewards the setup.
- [ ] Representative stills pass visual review.
- [ ] Release render passes deterministic, camera, test, lint, and provenance gates.
```

## Related Documents

- [Engineering Handbook](./ENGINEERING_HANDBOOK.md)
- [Performer Layer and Procedural Blurb Voice](./PERFORMERS_AND_BLURB_VOICE.md)
- [Camera](./CAMERA.md)
- [Platform Visuals](./PLATFORM_VISUALS.md)
- [Rendering and Performance](./RENDERING.md)
- [Operations](./OPERATIONS.md)
