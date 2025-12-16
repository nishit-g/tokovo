# 📜 Tokovo DSL & IR Architecture: The Two-Brain System

> **Status:** Living Document
> **Version:** 1.0.0
> **Mental Model:** Locked
> **Word Count:** 3000+

---

## 1. The Core Philosophy: Two Brains, One Story

In the world of generative video, there is a fundamental tension between **Creativity** and **Determinism**.
*   **Creativity** requires a language that is loose, expressive, forgiving, and high-level. It needs to look like a screenplay.
*   **Determinism** requires a language that is rigid, precise, explicit, and low-level. It needs to look like bytecode.

Most systems fail because they try to make one format do both jobs. They either force the human to write JSON (painful), or they force the renderer to interpret vague English (hallucinations/glitches).

**Tokovo's Solution:** A strict separation of concerns into **Two Layers**.

1.  **The DSL (Domain Specific Language):** The Author's Voice. A Fluent Typescript API designed for LLMs and Humans. It handles "magic", defaults, and relative timing.
2.  **The IR (Intermediate Representation):** The Machine's Truth. A flat, JSON-serializable list of atomic operations. It handles absolute frames, resolved assets, and immutable facts.

The **Compiler** is the bridge that translates the Intent (DSL) into the Reality (IR).

```mermaid
graph TD
    User[User / LLM] -->|Writes| DSL[Episode DSL (.ts)]
    DSL -->|Compiles via Node| Compiler[Tokovo Compiler]
    Compiler -->|Outputs| IR[Timeline IR (.json)]
    IR -->|Fed into| Runner[Video Runner (React)]
    Runner -->|Renders| MP4[Final Video]
    
    style User fill:#ffe6cc,stroke:#d79b00
    style DSL fill:#dae8fc,stroke:#6c8ebf
    style IR fill:#d5e8d4,stroke:#82b366
```

---

## 2. The DSL Layer: The Author's Voice

The DSL (`@tokovo/dsl`) is designed to be **written**, not just read. It optimizes for "Time to First Scene".

### 2.1 The Fluent API Pattern
We rely on the "Builder Pattern" and "Fluent Chaining" to create a syntax that reads like natural language.

**The Golden Rule of DSL:**
> If you have to calculate a frame number, the DSL has failed.

**Example:**
```typescript
// ❌ BAD (IR Style)
{ kind: "Message", at: 154, text: "Hello" }

// ✅ GOOD (DSL Style)
.wait("2s")
.message("Hello")
```

### 2.2 Key Abstractions

#### The Episode Container
The entry point is always `episode()`. It sets the stage, defines the FPS (default 30), and provides the context.

```typescript
export default episode("whatsapp-drama", (ep) => {
  // ... story goes here
});
```

#### The Device Wrapper
In DSL, we think in terms of **Devices**. A device is a "Stage".
```typescript
ep.device("iPhone_15", (device) => {
  // All actions here apply to this device
});
```

#### The Beat System
A "Beat" is a narrative unit. It helps organize the timeline but vanishes in the IR. It allows us to apply meta-tags like `rhythm: "fast"` which the compiler uses to auto-calculate typing speeds.

```typescript
device.beat("The Breakup", (b) => {
  b.message("We need to talk");
  b.wait("3s");
});
```

### 2.3 Magic Features

1.  **Time Parsing:** The DSL accepts human strings: `"1.5s"`, `"300ms"`, `"2 frames"`.
2.  **Auto-Typing:** Calculating how long to show a typing indicator is tedious. The DSL does it for you based on character count and a `rhythm` modifier.
    *   `b.type("Hello")` -> Compiles to `TypingStart` (at 0) + `TypingEnd` (at 15).
3.  **Context Awareness:** `b.reply("Ok")` knows who sent the *last* message and automatically sets the reply-to ID.

---

## 3. The Intermediate Representation (IR): The Machine's Truth

The IR (`@tokovo/ir`) is a **Compiler Target**. It is not meant for humans to modify by hand.

### 3.1 The Schema Contract
The IR is defined by a strict Zod schema. If a JSON file passes the schema, it **MUST** be renderable without error.

**Characteristics:**
1.  **Platform Agnostic:** The IR doesn't know about strict React components. It describes *events*.
2.  **Time Specific:** All `wait("2s")` are gone. Every operation has an `at: number` field representing the absolute frame index.
3.  **Flat Topology:** There are no nested "Beats" or "Scenes". It is a single array of `TimelineOp[]` sorted by time.

### 3.2 The TimelineOp Structure
Every single event in the universe is a `TimelineOp`.

```typescript
interface TimelineOp {
  kind: string;       // Discriminator (e.g., "MessageReceived")
  at: number;         // Absolute Frame Number
  trace: Trace;       // Source map back to DSL line
  deviceId: string;   // Who owns this?
  payload: any;       // The specific data
}
```

### 3.3 Zero-Ambuiguity Rule
The IR must never rely on "implicit state".
*   **Bad IR:** `kind: "NextScreen"` (Where are we going?)
*   **Good IR:** `kind: "ScreenNavigated", screen: "settings"` (Explicit).

---

## 4. The Compiler Pipeline

How do we get from A to B? The compilation process is a multi-pass transformation.

### Phase 1: Evaluation (The Stack)
We run the Typescript DSL. As functions execute (`device.message(...)`), they don't return strings. They **push objects onto a stack**.
We maintain a `cursor` (current frame).
*   `wait("1s")` increments the `cursor` by 30.
*   `message(...)` pushes an op at `cursor`.

### Phase 2: Expansion (The Macro Pass)
High-level macros are expanded into atomic ops.
*   **Input:** `dsl.typing("Hello", { speed: "fast" })`
*   **Calculation:** "Hello" = 5 chars. Fast = 2 frames/char. Duration = 10 frames.
*   **Output:**
    1.  `TypingStarted` at `cursor`
    2.  `TypingEnded` at `cursor + 10`
    3.  Updates `cursor` to `cursor + 10`.

### Phase 3: Resolution (The Linker)
We resolve references.
*   "Reply to last message" -> Finds the ID of the op at index -1.
*   "Profile: Alice" -> Look up "Alice" in the initial state and inject her UUID.

### Phase 4: Flattening & Sorting
We merge all parallel tracks (Camera track, Device 1 track, Device 2 track) into a single master timeline and sort by `at`.

### Phase 5: Validation
We run the final JSON through the Zod Schema (`TimelineIRSchema`). If it fails, the build aborts.

---

## 5. Schema Reference (The Contract)

This section details the available operations in the IR.

### 5.1 Device Operations
Lifecycle events for the simulated hardware.

*   `DeviceUnlocked`: The screen wakes up and unlocks.
*   `AppOpened`: Launches an app from the home screen.
*   `ScreenNavigated`: Moves between screens within an app.
    *   `screen`: "chats-list" | "chat" | "settings" | "status" | "calls"

### 5.2 Messaging Operations (WhatsApp/iMessage)
The core of the storytelling engine.

#### `MessageReceived` / `MessageSent`
The atomic unit of communication.
*   **Fields:**
    *   `text`: The content.
    *   `type`: "text" | "image" | "video" | "voice" | "system".
    *   `media`: URLs for images/video.
    *   `replyTo`: ID of parent message.

#### `TypingStarted` / `TypingEnded`
Crucial for pacing.
*   **Note:** In IR, these are separate events. In DSL, they are often one command.

#### `MessageRead`
Updates the "double blue ticks" or "Read" status.

### 5.3 Camera Operations (Cinematography)
The "Director" layer. These ops transform the viewport.

#### `CameraZoom`
*   `scale`: Target zoom level (1.0 = fit, 2.0 = close up).
*   `duration`: Frames to animate.
*   `easing`: "cinematic" (default: ease-in-out cubic).
*   `origin`: {x, y} to zoom towards (e.g., zoom into the top-right corner).

#### `CameraShake`
Simulates hand-held movement or impact.
*   `intensity`: Pixel offset magnitude.
*   `frequency`: Perlin noise speed.

### 5.4 Keyboard Operations
Simulates the virtual keyboard interaction.
*   `KeyboardType`: High-level intent ("I want to type this sentence").
*   `KeyboardInput`: Low-level key press (`keyDown` 'A', `keyUp` 'A').

---

## 6. Rendering & Runtime

The `video-runner` package consumes the compiled JSON.

### The `WorldState`
The renderer is a **State Machine**.
It starts with `initialState`.
For every frame `F`:
1.  It takes `state(F-1)`.
2.  It finds all ops where `op.at === F`.
3.  It runs a **Reducer** on the state: `newState = reducer(oldState, op)`.
4.  It renders `newState`.

### Determinism
Because the IR is fixed, Frame 1000 will *always* look exactly the same, no matter how many times you seek or replay. This is why we pre-calculate randomization (like typing jitter) in the Compiler, not the Renderer.

---

## 7. Extensions Guide

How to add a new feature (e.g., "Instagram Stories").

### Step 1: Define the IR Schema
Edit `packages/ir/src/timeline.ts`.
```typescript
export interface StoryPostedOp extends TimelineOpBase {
    readonly kind: "StoryPosted";
    readonly imageUrl: string;
}
```

### Step 2: Update Validator
Edit `packages/ir/src/schemas.ts`.
```typescript
export const StoryPostedOpSchema = TimelineOpBaseSchema.extend({
    kind: z.literal("StoryPosted"),
    imageUrl: z.string()
});
```

### Step 3: Create DSL Factory
Edit `packages/dsl/src/events/instagram.ts`.
```typescript
export const story = (url: string) => ({
    kind: "StoryPosted",
    imageUrl: url
});
```

### Step 4: Implement Reducer
Edit `packages/core/src/reducer.ts`.
```typescript
case "StoryPosted":
    draft.instagram.stories.push(op.imageUrl);
    break;
```

### Step 5: Implement UI
Update the React component to render the new state.

---

## 8. Prompt Engineering Guide (Docs for LLMs)

When asking an LLM (like Gemini or Claude) to generate episodes, provide the following system instructions to ensure high-quality DSL output.

### 8.1 The "Screenplay" Analogy
Tell the LLM it is writing a **Screenplay using Typescript**.
It should focus on **Pacing** and **Emotion**.

### 8.2 Dos and Don'ts

**✅ DO:**
*   Use `wait()` heavily. Real conversations have pauses.
*   Use `beat()` to group thematic sections.
*   Use comments to explain *why* characters are pausing.
*   Use the fluent API: `device.whatsapp.message(...)`.

**❌ DON'T:**
*   Don't try to calculate frame numbers.
*   Don't interact with `React` or `Remotion` imports directly.
*   Don't invent new methods that aren't in the DSL interface.

### 8.3 Example Prompt

> "Write a Tokovo DSL episode where Alice breaks up with Bob over WhatsApp. Start with a slow, hesitant rhythm. Alice should type and delete her message twice before sending 'We need to talk'. Bob should reply instantly, panicked. Use camera zooms to emphasize Bob's messages."

### 8.4 Generated Output Expectations

```typescript
// The LLM should generate:
ep.device("AlicePhone", d => {
    d.beat("Hesitation", b => {
       // Type and delete
       b.type("I don't think we can...");
       b.wait("1s");
       b.keyboard.backspace(20); // clear
       
       b.wait("2s"); // hesitation
       b.message("We need to talk.");
    });
    
    d.beat("Panic", b => {
       b.wait("0.5s"); // fast reply
       // Camera zoom for dramatic effect
       b.camera.zoom(1.2, "500ms");
       b.receive("Bob", "What? Why?");
       b.receive("Bob", "Where are you?");
    });
});
```

---

## 9. Best Practices for Human Authors

### 9.1 The "Rhythm" of Texting
*   **Micro-pauses:** Add `wait("200ms")` between rapid-fire messages to let the eye catch up.
*   **Typing duration:** Let the auto-calculator do the work, but override for emotional effect. A short "Ok" that takes 5 seconds to type implies sarcasm or reluctance.

### 9.2 Camera Work
*   **Don't over-direct.** A static shot is often powerful.
*   **Use constraints.** Zoom in only when the text density increases or emotional stakes rise.
*   **Shake:** Use `camera.shake()` sparingly for "shocking" incoming messages.

### 9.3 Asset Management
*   Store images in `public/assets`.
*   Use standard formats (JPG/PNG).
*   Ensure aspect ratios match the compiled output (usually 9:16 vertical video).

---

## 10. Troubleshooting

### "My video desyncs audio"
*   **Cause:** You are playing audio in the DSL using a `wait()` that is approximate, but the audio file is exact.
*   **Fix:** Use explicit `Audio` ops or trust the engine's auto-sound rules.

### "Complexity Error / Stack Overflow"
*   **Cause:** Your episode is too long (> 3 mins) in a single DSL function.
*   **Fix:** Split the episode into multiple `episode()` blocks or use helper functions to break up the logic.

### "Validation Failed: Invalid Enum"
*   **Cause:** You used a screen name like "home_screen" that isn't in the Zod schema.
*   **Fix:** Check `packages/ir/src/schemas.ts` for the allowed `ScreenNavigated` values (e.g., `chats-list`).
