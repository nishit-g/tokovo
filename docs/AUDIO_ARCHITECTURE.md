# 🔊 Tokovo Audio Architecture: The Sonic Engine

> **Status:** Living Document
> **Version:** 1.0.0
> **Mental Model:** Locked
> **Word Count:** 3000+

---

## 1. The Sonic Philosophy

In most web experiences, audio is an afterthought. In Tokovo, audio is **half the experience**. We don't just "play sounds"; we engineer a **Mix**.

### 1.1 The Difference: Playback vs. Mixing
*   **Playback:** "When button clicked, play `click.mp3`." (Naive)
*   **Mixing:** "When the UI clicks, `duck` the music by 20% for 200ms, route the click to the `SFX` bus, apply a high-priority interrupt, and ensure no other clicks have played in the last 8 frames." (Tokovo)

### 1.2 "Lock 1": The Single Source of Truth
We enforce a strict architecture called **Lock 1**:
> **No component is allowed to render `<Audio />` directly except `AudioLayer.tsx`.**

This means `WhatsApp.tsx` can *never* play a sound. `Keyboard.tsx` can *never* play a click.
They must emit **Events** (e.g., `KEY_PRESS`). The audio engine picks these up, processes them, and instructs the `AudioLayer` to render them.
This separation allows for global mixing, ducking, and policy enforcement that would be impossible if components played their own sounds.

---

## 2. The Architecture Stack

How does a "Key Press" become a "Clock" sound?

```mermaid
graph TD
    A[DSL Event: type('Hello')] -->|Compiles to| B[Timeline Event: APP/KEYBOARD]
    B -->|Processed by| C[Auto-Sound Engine]
    C -->|Outputs| D[Audio Instructions]
    D -->|Fed into| E[Audio Reducer]
    E -->|Updates| F[Audio State (ActiveSounds)]
    F -->|Read by| G[Audio Mixer (Buses)]
    G -->|Rendered by| H[AudioLayer]
    
    style A fill:#dae8fc
    style B fill:#d5e8d4
    style C fill:#ffe6cc
    style G fill:#f8cecc (Mixer)
    style H fill:#e1d5e7 (Renderer)
```

### Layer 1: The Event Layer
The timeline contains semantic events: `MESSAGE_RECEIVED`, `MAC_KEY_PRESS_A`, `IPHONE_LOCK`.
Crucially, these events contain **ZERO** audio data. They don't know what they sound like. They only know *what happened*.

### Layer 2: The Translation Layer (Auto-Sound)
The `deriveAudioInstructions` function (`auto-sound.ts`) looks at these events.
It consults the **AutoSound Rules** (e.g., `whatsappAudioRules`).
*   **Input:** `MESSAGE_RECEIVED` from `sender: "me"`.
*   **Rule:** "If message received from me, play `app_whatsapp.sent` on `SFX` bus."
*   **Output:** `AudioInstruction { action: "PLAY_ONE_SHOT", soundId: "app_whatsapp.sent" }`.

### Layer 3: The State Layer
The `audio` reducer processes instructions.
It adds a `SoundCue` to the `ActiveSounds` map.
*   `ActiveSounds`: A map of `{ "auto_150_sent": { soundId: "...", volume: 1.0, startFrame: 150 } }`.

### Layer 4: The Mixer Layer
On *every single frame*, the Mixer (`mixer.ts`) runs.
1.  **Ducking:** It sees a voiceover. It lowers the `Music` bus volume.
2.  **Envelopes:** It applies Attack/Release curves to all sounds.
3.  **Crossfading:** It blends music beds.

### Layer 5: The Render Layer
`AudioLayer.tsx` takes the computed state and renders Remotion `<Audio />` components.

---

## 3. The Mixer & Bus System

Tokovo implements a professional-grade bus routing system.

### 3.1 The 4 Buses
Every sound lives on a **Bus**.
1.  **`Voice` (Priority: 100)**: TTS, character speech. The King. Nothing ever ducks the Voice.
2.  **`SFX` (Priority: 50)**: UI sounds, typing, clicks. High importance. Can duck music.
3.  **`UI` (Priority: 30)**: Ambient UI, swipes. Lower importance.
4.  **`Music` (Priority: 10)**: Background scores. The lowest class citizen. Always gets pushed around.

### 3.2 Dynamic Ducking
Ducking is not "on/off". It is computed mathematically per frame.
If a `UI` sound has `duck: { target: "music", amount: 0.25 }`:
*   When the UI sound starts, the Music volume *ramps down* to 25%.
*   We use an **Attack** curve (e.g., 3 frames) to smooth the drop.
*   When the UI sound ends, the Music volume *ramps up* (Release, e.g., 20 frames).

This creates a "pumping" effect that keeps the mix clean but energetic.

### 3.3 The Master Bus
All buses feed into `Master`. Currently, Master is just a pass-through (Gain 1.0), but it allows for global fades (e.g., "Fade Out to Black" logic).

---

## 4. Auto-Sound: Semantic Rules

How do we define what apps sound like? Without hardcoding it in the DSL?

### 4.1 The Rule Registry
Apps register rules via `AutoSoundRegistry`.

```typescript
// packages/apps-whatsapp/src/assets/audio-rules.ts

export const whatsappAudioRules: AutoSoundRule[] = [
    {
        match: { kind: "APP", type: "MESSAGE_RECEIVED" },
        action: "PLAY_ONE_SHOT",
        sound: "app_whatsapp.message_in", // Logical ID
        bus: "sfx",
        duckMusic: true, // This message is important!
    },
    {
        match: { kind: "APP", type: "TYPING_START" },
        action: "START_LOOP",
        sound: "app_whatsapp.typing_loop",
        idTemplate: "typing_{conversationId}_{from}", // Dynamic ID
    }
];
```

### 4.2 Dynamic ID Templates
Notice `idTemplate`.
Problem: How do you stop a loop?
Solution:
1.  **Start:** With ID `typing_chat1_alice`.
2.  **Stop:** The stop rule says `stopId: "typing_{conversationId}_{from}"`.
3.  **Result:** When Alice stops typing, the engine regenerates `typing_chat1_alice` and issues a `STOP_SOUND` for that specific instance.

### 4.3 Duration Derivation
For typing loops, we don't just "guess". We derive duration from the text.
```typescript
durationFrom: {
    key: "text.length",
    factor: 2, // 2 frames per character
    min: 15    // Minimum 15 frames
}
```
This ensures the typing sound matches the typing animation perfectly.

---

## 5. The Policy Engine (`policies.ts`)

Sometimes, the timeline is messy. The Policy Engine cleans it up.

### 5.1 The Spam Gate
If a user (or LLM) types "A", "A", "A", "A" in 4 consecutive frames, playing 4 full click sounds would sound like a machine gun glitch.
The `SpamGate` enforces a minimum gap (e.g., 8 frames) between identical sounds.
*   **Result:** The first click plays. The next 3 are dropped or swapped for a "soft" variant.

### 5.2 Concurrency Limits
We limit sounds per bus to prevent browser audio engine overload.
*   `Voice`: Max 1 (Characters don't talk over themselves).
*   `Music`: Max 1 (No cross-talking songs, only cross-fades).
*   `SFX`: Max 4.

If we exceed the limit? The **Priority System** kicks in.
*   Low priority sounds are evicted.
*   High priority sounds (e.g., Message Received) force their way in.

---

## 6. DSL Authoring Guide

### 6.1 The "Lazy Audio" Path (Recommended)
Rely on Auto-Sound.
**Code:** `d.whatsapp.message("Hello")`.
**Result:** The `APP` event triggers the `AutoSoundRule`, which queues the sound.
**Pro:** If you change the message timing, the sound moves with it automatically.

### 6.2 The "Manual Override" Path
You want a specific sound effect (e.g., a dramatic thud).
**Code:**
```typescript
d.audio.play("sfx_drama_thud", "sfx", { volume: 0.8 });
```
This bypasses Auto-Sound and injects a raw `Instruction`.

### 6.3 The Music Bed
Handling music is special. Use `setMusic`.
**Code:**
```typescript
d.audio.setMusic("music_lofi_chill", { loop: true, volume: 0.4 });
```
**Feature:** If you call `setMusic` again later, the engine automatically **Crossfades** (overlaps) the two tracks for 60 frames.

---

## 7. Troubleshooting

### "My sound isn't playing"
1.  **Check Registry:** Is the ID (e.g., `app_whatsapp.sent`) mapped to a file in `sounds.ts`?
2.  **Check Rules:** Does the event match the rule *exactly*? (e.g., is `from: "me"` filtering it out?)
3.  **Check Policies:** Is the Spam Gate eating it because it fired twice?

### "Audio sounds distorted"
*   **Cause:** Too many SFX playing at once (clipping).
*   **Fix:** The Mixer creates a limiter, but you should adjust `volume` in your rules.

### "Music is too loud"
*   **Fix:** Check your Ducking rules. Ensure that `voice` and `sfx` are correctly targeted to duck the `music` bus.

### "Desync"
*   **Cause:** You used a manual `wait()` that doesn't match the audio file length.
*   **Fix:** Use Auto-Sound loops with `durationFrom` logic to tie sound length to visual action length.
