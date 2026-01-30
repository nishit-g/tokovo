# ARCHITECTURE VALIDATION: Diverse Episode Scenarios

**Purpose**: Stress-test the plugin architecture with realistic, varied use cases  
**Created**: 2026-01-29

---

## Table of Contents

1. [Comedy: Rapid-Fire Roast Battle](#scenario-1-comedy-rapid-fire-roast-battle)
2. [Drama: Suspenseful Reveal](#scenario-2-drama-suspenseful-reveal)
3. [Tutorial: Step-by-Step Guide](#scenario-3-tutorial-step-by-step-guide)
4. [Documentary: Interview Style](#scenario-4-documentary-interview-style)
5. [Action: Breaking News](#scenario-5-action-breaking-news)
6. [Mixed: Multi-App Coordination](#scenario-6-mixed-multi-app-coordination)
7. [Cinematic: Music Video Style](#scenario-7-cinematic-music-video-style)
8. [Technical: API Demo](#scenario-8-technical-api-demo)
9. [Edge Cases & Complex Scenarios](#edge-cases--complex-scenarios)
10. [Verdict: Can We Achieve It?](#verdict-can-we-achieve-it)

---

## Scenario 1: Comedy - Rapid-Fire Roast Battle

### **The Vision**

Two friends roasting each other at 200mph. Messages flying in every 0.5 seconds. Camera needs to be HYPERACTIVE - bouncing left/right like a tennis match on steroids. Occasional reaction zooms when someone gets burned hard.

### **Episode Code**

```typescript
episode("roast-battle")
  .track("whatsapp", (wa) => {
    // Rapid fire
    wa.at("1s").receive("Alex", "Your haircut looks like a Lego piece");
    wa.at("1.5s").receive("Jordan", "At least I HAVE hair");
    wa.at("2s").receive("Alex", "Touché");
    wa.at("2.3s").receive("Jordan", "Unlike your social life");
    wa.at("2.6s").receive("Alex", "Says the guy who got dumped via emoji");
    wa.at("3s").receive("Jordan", "💀💀💀");
    wa.at("3.2s").receive("Alex", "🔥🔥🔥");
    // ... 50 more rapid messages
  })

  // AUTO CAMERA: Energetic tennis
  .use(new CameraDirectorPlugin("fluid-tennis-energetic"))

  // MANUAL OVERRIDES: Special reactions
  .camera((cam) => {
    // Epic burn at 5s - dramatic zoom
    cam.at("5s").zoom(1.5, { duration: "0.2s", easing: "easeOut" });
    cam
      .at("5.2s")
      .shake({ intensityX: 8, intensityY: 8, frequency: 20, decay: 0.95 });

    // Another burn at 12s - whip pan
    cam.at("12s").whipPan({ direction: "left", speed: "instant" });
    cam.at("12.1s").focus("message-42", { scale: 1.4, duration: "0.3s" });

    // Final killshot at 25s - slow zoom + hold
    cam.at("25s").zoom(1.8, { duration: "1.5s", easing: "cinematic" });
    cam.span("26.5s", "29s").track("lastMessage", { scale: 1.8 });
  })

  // SUBTITLES for accessibility
  .use(
    new SubtitlePlugin({
      position: "bottom",
      style: "comedy",
      showEmojis: true,
    }),
  )

  // SOUND EFFECTS on reactions
  .use(
    new SoundEffectPlugin({
      triggers: {
        "🔥": "fire-whoosh.mp3",
        "💀": "skull-laugh.mp3",
      },
    }),
  )

  .build();
```

### **Camera Requirements**

| Requirement              | How Achieved                         | Plugin or Manual?    |
| ------------------------ | ------------------------------------ | -------------------- |
| Rapid tennis left/right  | Burst detection + energetic behavior | ✅ Plugin (Director) |
| Fast message pace (0.5s) | Rhythm analysis → short durations    | ✅ Plugin (Director) |
| Reaction zoom at 5s      | Custom dramatic moment               | ✅ Manual override   |
| Shake on epic burn       | Manual timing                        | ✅ Manual override   |
| Whip pan at 12s          | Instant transition effect            | ✅ Manual override   |
| Slow cinematic zoom      | Build tension before punchline       | ✅ Manual override   |
| Hold on final message    | Track last message                   | ✅ Manual (span)     |

### **Plugin Behavior**

**Director handles 80%:**

- Messages 1-4: Focus message-0, pan to message-1, pan to message-2, pan to message-3
- Turn detection: Jordan → Alex switches trigger reset + refocus
- Burst handling: Alex's 3-message burst (messages 5-7) = focus first, pan rest
- Energetic behavior: Bouncy easing, 0.4s durations, slight shake on focus

**Manual handles 20%:**

- Special moments (epic burns, punchlines)
- Cinematic techniques (whip pan, slow zoom)
- Emotional beats (hold on final message)

### **Event Timeline (IR)**

```javascript
IR.events = [
  // Messages (from WhatsApp track)
  {
    at: 30,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { from: "Alex", text: "..." },
  },
  {
    at: 45,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { from: "Jordan", text: "..." },
  },
  // ... 50+ messages

  // Auto-generated camera (from Director plugin)
  {
    at: 30,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-0", scale: 1.2 },
  },
  {
    at: 45,
    kind: "CAMERA",
    type: "PAN",
    payload: { anchorId: "message-1", scale: 1.2 },
  },
  {
    at: 60,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-2", scale: 1.2 },
  },
  // ... 50+ auto camera events

  // Manual overrides (from camera DSL)
  {
    at: 150,
    kind: "CAMERA",
    type: "ZOOM",
    payload: { scale: 1.5, duration: 6 },
  },
  {
    at: 156,
    kind: "CAMERA",
    type: "SHAKE",
    payload: { intensityX: 8, intensityY: 8 },
  },
  { at: 360, kind: "CAMERA", type: "WHIP_PAN", payload: { direction: "left" } },
  {
    at: 750,
    kind: "CAMERA",
    type: "ZOOM",
    payload: { scale: 1.8, duration: 45 },
  },
  {
    at: 795,
    kind: "CAMERA",
    type: "TRACK",
    payload: { anchorId: "lastMessage" },
    duration: 75,
  },

  // Subtitles (from SubtitlePlugin)
  {
    at: 30,
    kind: "SUBTITLE",
    type: "SHOW",
    payload: { text: "Your haircut looks like a Lego piece" },
  },
  // ... 50+ subtitles

  // Sound effects (from SoundEffectPlugin)
  {
    at: 96,
    kind: "AUDIO",
    type: "PLAY_SFX",
    payload: { soundId: "fire-whoosh.mp3" },
  },
  {
    at: 90,
    kind: "AUDIO",
    type: "PLAY_SFX",
    payload: { soundId: "skull-laugh.mp3" },
  },
];
```

### **Renderer Output**

```tsx
<>
  <Sequence name="Audio" zIndex={0}>
    <AudioLayer events={audioEvents} /> {/* BGM + SFX */}
  </Sequence>

  <Sequence name="Camera" zIndex={10}>
    <CameraTransform events={cameraEvents}>
      {" "}
      {/* Auto + manual merged */}
      <Sequence name="Apps" zIndex={20}>
        <PhoneView events={appEvents} />
      </Sequence>
    </CameraTransform>
  </Sequence>

  <Sequence name="Subtitles" zIndex={90}>
    <SubtitleLayer events={subtitleEvents} />
  </Sequence>
</>
```

### **Verdict: ✅ ACHIEVABLE**

- **Plugin handles:** Rapid-fire tennis, burst detection, rhythm analysis
- **Manual handles:** Special moments, cinematic techniques
- **Hybrid mode works:** Auto + manual events merged seamlessly
- **Multiple plugins:** Director + Subtitle + SFX all compose together

---

## Scenario 2: Drama - Suspenseful Reveal

### **The Vision**

A slow-burn conversation building to a devastating reveal. Camera starts calm, gradually gets closer and more unstable. Final reveal uses dramatic slow zoom + dutch tilt. Needs emotional pacing, not mechanical.

### **Episode Code**

```typescript
episode("breakup-reveal")
  .track("whatsapp", (wa) => {
    wa.at("2s").receive("Sarah", "We need to talk");
    wa.span("4s", "8s").typing("me");
    wa.at("8s").send("About what?");

    wa.span("10s", "14s").typing("Sarah");
    wa.at("14s").receive("Sarah", "Us");

    wa.span("16s", "20s").typing("me");
    wa.at("20s").send("I don't understand");

    wa.span("22s", "28s").typing("Sarah");
    wa.at("28s").receive("Sarah", "I think we should break up");

    wa.span("30s", "35s").typing("me"); // Long pause
    wa.at("35s").send("Why?");

    wa.span("37s", "45s").typing("Sarah"); // Suspense build
    wa.at("45s").receive("Sarah", "I met someone else"); // REVEAL
  })

  // AUTO CAMERA: Dramatic behavior (slow, tense)
  .use(new CameraDirectorPlugin("fluid-tennis-dramatic"))

  // MANUAL: Escalating tension + reveal
  .camera((cam) => {
    // Start calm (1.0x scale)
    cam.at("0s").set({ scale: 1.0 });

    // Gradual zoom in as tension builds
    cam.at("10s").animate({ scale: 1.05, duration: "5s", easing: "easeIn" });
    cam.at("20s").animate({ scale: 1.1, duration: "5s", easing: "easeIn" });
    cam.at("30s").animate({ scale: 1.15, duration: "5s", easing: "easeIn" });

    // Long typing = suspense
    cam.span("37s", "45s").track("typingIndicator", {
      scale: 1.2,
      // Slight drift/shake to show tension
    });
    cam
      .at("40s")
      .shake({ intensityX: 2, intensityY: 1, frequency: 8, decay: 0.98 });

    // REVEAL MOMENT (45s)
    cam.at("45s").focus("message-last", {
      scale: 1.5,
      duration: "2s",
      easing: "cinematic",
    });

    // Dutch tilt for emotional impact
    cam.span("45s", "50s").dutchTilt({ angle: -8, easing: "easeOut" });

    // Slow dolly out (pulling away in shock)
    cam.span("47s", "52s").dolly({ distance: -80, easing: "cinematic" });

    // Hold on message
    cam.span("52s", "60s").track("message-last", { scale: 1.3 });
  })

  // VOICE NARRATION: Internal monologue
  .use(
    new VoicePlugin({
      voice: "internal-thoughts",
      triggers: [
        { at: "35s", text: "Something feels wrong...", duration: "3s" },
        { at: "42s", text: "My heart is racing...", duration: "3s" },
      ],
    }),
  )

  // SUBTLE AUDIO: Heartbeat getting faster
  .track("audio", (audio) => {
    audio.span("30s", "45s").ambient("heartbeat-slow.mp3", { volume: 0.3 });
    audio.span("45s", "50s").ambient("heartbeat-fast.mp3", { volume: 0.6 });
  })

  .build();
```

### **Camera Requirements**

| Requirement                 | How Achieved             | Plugin or Manual?    |
| --------------------------- | ------------------------ | -------------------- |
| Start calm, gradual tension | Slow escalating zoom     | ✅ Manual (animate)  |
| Track typing indicator      | Continuous tracking span | ✅ Manual (span)     |
| Shake during suspense       | Subtle tension shake     | ✅ Manual            |
| Dramatic focus on reveal    | Slow cinematic zoom      | ✅ Manual            |
| Dutch tilt emotional beat   | Tilted framing           | ✅ Manual (span)     |
| Dolly out (shock reaction)  | Pull back effect         | ✅ Manual (span)     |
| Hold on final message       | Static framing           | ✅ Manual (span)     |
| Auto-handle normal messages | Basic focus/pan          | ✅ Plugin (Director) |

### **Why Mostly Manual Here?**

**This episode needs emotional pacing, not mechanical tennis.**

- Director handles: Messages 1-5 (basic focus/pan with dramatic behavior)
- Manual handles: Tension build, reveal choreography, emotional beats

**Key insight:** Hybrid mode shines here. Director does the boring parts, human directs the art.

### **Event Timeline**

```javascript
IR.events = [
  // Messages
  { at: 60, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  { at: 420, kind: "APP", type: "TYPING_START", duration: 120, ... },

  // Auto camera (Director - basic coverage)
  { at: 60, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-0", scale: 1.0 } },

  // Manual camera (Tension build)
  { at: 300, kind: "CAMERA", type: "ANIMATE", payload: { scale: 1.05, duration: 150 } },
  { at: 600, kind: "CAMERA", type: "ANIMATE", payload: { scale: 1.1, duration: 150 } },
  { at: 900, kind: "CAMERA", type: "ANIMATE", payload: { scale: 1.15, duration: 150 } },

  // Suspense tracking + shake
  { at: 1110, kind: "CAMERA", type: "TRACK", payload: { anchorId: "typingIndicator" }, duration: 240 },
  { at: 1200, kind: "CAMERA", type: "SHAKE", payload: { intensityX: 2 } },

  // Reveal choreography
  { at: 1350, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-last", scale: 1.5 } },
  { at: 1350, kind: "CAMERA", type: "DUTCH_TILT", payload: { angle: -8 }, duration: 150 },
  { at: 1410, kind: "CAMERA", type: "DOLLY", payload: { distance: -80 }, duration: 150 },
  { at: 1560, kind: "CAMERA", type: "TRACK", payload: { anchorId: "message-last" }, duration: 240 },

  // Voice narration
  { at: 1050, kind: "VOICE", type: "SPEAK", payload: { text: "Something feels wrong..." } },
  { at: 1260, kind: "VOICE", type: "SPEAK", payload: { text: "My heart is racing..." } },

  // Audio ambience
  { at: 900, kind: "AUDIO", type: "AMBIENT", payload: { soundId: "heartbeat-slow.mp3" }, duration: 450 },
  { at: 1350, kind: "AUDIO", type: "AMBIENT", payload: { soundId: "heartbeat-fast.mp3" }, duration: 150 }
]
```

### **Verdict: ✅ ACHIEVABLE**

- **Plugin handles:** Basic message coverage (calm parts)
- **Manual handles:** Emotional choreography (tension, reveal, reaction)
- **Hybrid perfection:** Let plugin do boring, human does art
- **Multiple layers:** Camera + Voice + Audio all coordinated

---

## Scenario 3: Tutorial - Step-by-Step Guide

### **The Vision**

Teaching someone how to use WhatsApp. Camera needs to be STATIC most of time (tutorial mode), with deliberate focus shifts to highlight UI elements. Needs labels/annotations. Voice narration. Slow, clear, educational.

### **Episode Code**

```typescript
episode("whatsapp-tutorial")
  .track("whatsapp", (wa) => {
    wa.at("2s").tap("header"); // Tap profile picture
    wa.at("5s").receive("Demo", "This is a message");
    wa.at("8s").tap("inputArea"); // Focus input
    wa.at("10s").type("Hello");
    wa.at("12s").tap("sendButton");
    wa.at("14s").send("Hello");
  })

  // NO AUTO CAMERA - Tutorial needs deliberate shots
  // .use(new CameraDirectorPlugin("static"))  // Could use static behavior

  // MANUAL: Deliberate focus on UI elements
  .camera((cam) => {
    // Start with full screen view
    cam.at("0s").set({ scale: 1.0 });

    // Focus on header when tapped
    cam.at("2s").focus("header", {
      scale: 1.3,
      duration: "0.8s",
      easing: "easeOut",
    });
    cam.at("4s").reset({ duration: "0.6s" });

    // Focus on incoming message
    cam.at("5s").focus("message-0", { scale: 1.2, duration: "0.6s" });
    cam.at("7s").reset({ duration: "0.6s" });

    // Focus on input area
    cam.at("8s").focus("inputArea", { scale: 1.4, duration: "0.8s" });
    // HOLD on input while typing
    cam.span("8s", "12s").track("inputArea", { scale: 1.4 });

    // Focus on send button
    cam.at("12s").focus("sendButton", { scale: 1.5, duration: "0.5s" });

    // Show sent message
    cam.at("14s").focus("message-1", { scale: 1.2, duration: "0.6s" });

    // End with full view
    cam.at("16s").reset({ duration: "1s", easing: "easeOut" });
  })

  // ANNOTATIONS: Labels on UI elements
  .use(
    new AnnotationPlugin({
      labels: [
        {
          at: "2s",
          anchor: "header",
          text: "Tap here to view profile",
          duration: "3s",
        },
        {
          at: "8s",
          anchor: "inputArea",
          text: "Type your message here",
          duration: "4s",
        },
        {
          at: "12s",
          anchor: "sendButton",
          text: "Tap to send",
          duration: "2s",
        },
      ],
    }),
  )

  // VOICE NARRATION: Step-by-step instructions
  .use(
    new VoicePlugin({
      voice: "tutorial-clear",
      script: [
        { at: "0s", text: "Welcome to WhatsApp. Let's learn the basics." },
        { at: "2s", text: "Tap the profile picture to view contact info." },
        { at: "5s", text: "Messages appear here in the conversation." },
        { at: "8s", text: "Tap the input field to start typing." },
        { at: "10s", text: "Type your message..." },
        { at: "12s", text: "Then tap the send button." },
        { at: "14s", text: "Your message appears in the chat." },
      ],
    }),
  )

  .build();
```

### **Camera Requirements**

| Requirement                 | How Achieved         | Plugin or Manual?            |
| --------------------------- | -------------------- | ---------------------------- |
| Static most of time         | No auto movement     | ✅ Manual (or static plugin) |
| Deliberate focus on header  | Timed focus event    | ✅ Manual                    |
| Reset between actions       | Explicit reset calls | ✅ Manual                    |
| Hold on input during typing | Span-based tracking  | ✅ Manual (span)             |
| Focus on send button        | Precise timing       | ✅ Manual                    |
| Smooth transitions          | Ease-out easing      | ✅ Manual                    |

### **Why All Manual?**

**Tutorial doesn't want "smart" camera - it wants choreographed instruction.**

- NO Director plugin (or use `static` behavior)
- Every camera move is deliberate and timed to narration
- Focus → Hold → Reset pattern repeats

**Alternative: Could use plugin**

```typescript
.use(new CameraDirectorPlugin("static", {
  focusOnTap: true,  // Auto-focus when UI elements tapped
  holdDuration: 2000  // Hold each focus for 2s
}))
```

But manual gives more control for educational pacing.

### **Event Timeline**

```javascript
IR.events = [
  // UI interactions
  { at: 60, kind: "APP", type: "TAP", payload: { elementId: "header" } },
  { at: 150, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  { at: 240, kind: "APP", type: "TAP", payload: { elementId: "inputArea" } },
  { at: 300, kind: "APP", type: "TYPE", payload: { text: "Hello" } },
  { at: 360, kind: "APP", type: "TAP", payload: { elementId: "sendButton" } },

  // Manual camera (deliberate tutorial shots)
  { at: 0, kind: "CAMERA", type: "SET", payload: { scale: 1.0 } },
  { at: 60, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "header", scale: 1.3 } },
  { at: 120, kind: "CAMERA", type: "RESET", payload: { duration: 18 } },
  { at: 150, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-0", scale: 1.2 } },
  { at: 210, kind: "CAMERA", type: "RESET", payload: { duration: 18 } },
  { at: 240, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "inputArea", scale: 1.4 } },
  { at: 240, kind: "CAMERA", type: "TRACK", payload: { anchorId: "inputArea" }, duration: 120 },
  { at: 360, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "sendButton", scale: 1.5 } },
  { at: 420, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-1", scale: 1.2 } },
  { at: 480, kind: "CAMERA", type: "RESET", payload: { duration: 30 } },

  // Annotations
  { at: 60, kind: "ANNOTATION", type: "LABEL", payload: { anchor: "header", text: "..." }, duration: 90 },
  { at: 240, kind: "ANNOTATION", type: "LABEL", payload: { anchor: "inputArea", text: "..." }, duration: 120 },
  { at: 360, kind: "ANNOTATION", type: "LABEL", payload: { anchor: "sendButton", text: "..." }, duration: 60 },

  // Voice narration
  { at: 0, kind: "VOICE", type: "SPEAK", payload: { text: "Welcome to WhatsApp..." } },
  { at: 60, kind: "VOICE", type: "SPEAK", payload: { text: "Tap the profile picture..." } },
  // ... etc
]
```

### **Verdict: ✅ ACHIEVABLE**

- **All manual:** Tutorial needs precise choreography
- **Could use plugin:** Static behavior as baseline
- **Multiple plugins:** Annotation + Voice compose perfectly
- **Span tracking:** Hold on input while typing works
- **Clean transitions:** Manual timing matches narration

---

## Scenario 4: Documentary - Interview Style

### **The Vision**

A conversation presented as a documentary. Camera shows context (zoomed out most of time), occasional close-ups on key messages. Needs to feel observational, not reactive. Slow, measured movements. Picture-in-picture for "interview" overlays.

### **Episode Code**

```typescript
episode("documentary-interview")
  .track("whatsapp", (wa) => {
    wa.at("5s").receive("Dr. Smith", "It all started in 2019");
    wa.at("8s").receive(
      "Dr. Smith",
      "We didn't know what we were dealing with",
    );
    wa.at("12s").receive("Dr. Smith", "The breakthrough came unexpectedly");

    wa.at("16s").send("Can you tell me more?");

    wa.at("20s").receive("Dr. Smith", "We were testing a new compound");
    wa.at("23s").receive("Dr. Smith", "The results were... unprecedented");

    wa.at("28s").send("What happened next?");

    wa.at("32s").receive("Dr. Smith", "Everything changed");
  })

  // AUTO CAMERA: Calm, documentary style
  .use(
    new CameraDirectorPlugin("fluid-tennis-casual", {
      defaultScale: 0.9, // Zoomed OUT to show context
      focusScale: 1.1, // Gentle zoom on key messages
      transitionDuration: 1200, // Slow, measured (1.2s)
    }),
  )

  // MANUAL: Deliberate director choices
  .camera((cam) => {
    // Start wide (establishing shot)
    cam.at("0s").set({ scale: 0.85 });

    // Slow push-in during first statement
    cam.span("5s", "12s").animate({
      scale: 0.95,
      easing: "linear", // Documentary slow push
    });

    // Close-up on "breakthrough" (key moment)
    cam.at("12s").focus("message-2", {
      scale: 1.3,
      duration: "1.5s",
      easing: "cinematic",
    });
    cam.span("12s", "16s").track("message-2", { scale: 1.3 });

    // Pull back to context
    cam.at("16s").animate({ scale: 0.9, duration: "2s", easing: "easeOut" });

    // Another close-up on "unprecedented"
    cam.at("23s").focus("message-5", { scale: 1.25, duration: "1.2s" });

    // Final wide shot
    cam.at("32s").animate({ scale: 0.85, duration: "3s", easing: "linear" });
  })

  // PICTURE-IN-PICTURE: "Interview" overlay
  .use(
    new PictureInPicturePlugin({
      overlays: [
        {
          at: "5s",
          duration: "7s",
          position: "bottom-left",
          content: "DR. SARAH SMITH\nLead Researcher",
          animation: "fade-in",
        },
      ],
    }),
  )

  // B-ROLL: Background footage
  .use(
    new BRollPlugin({
      clips: [
        {
          at: "0s",
          duration: "5s",
          video: "lab-establishing.mp4",
          opacity: 0.3,
        },
        {
          at: "12s",
          duration: "4s",
          video: "microscope-closeup.mp4",
          opacity: 0.2,
        },
      ],
    }),
  )

  // SUBTLE AUDIO: Documentary score
  .track("audio", (audio) => {
    audio.span("0s", "35s").bgm("documentary-ambient.mp3", {
      volume: 0.4,
      fadeIn: "3s",
      fadeOut: "3s",
    });
  })

  .build();
```

### **Camera Requirements**

| Requirement                   | How Achieved                     | Plugin or Manual?      |
| ----------------------------- | -------------------------------- | ---------------------- |
| Default zoomed out (context)  | Plugin config: defaultScale: 0.9 | ✅ Plugin (configured) |
| Gentle auto-focus on messages | Plugin: casual behavior          | ✅ Plugin              |
| Slow push-in (establishing)   | Linear animate over 7s           | ✅ Manual (span)       |
| Close-up on key moments       | Manual focus + track             | ✅ Manual              |
| Pull back to context          | Manual animate out               | ✅ Manual              |
| Slow, measured movements      | Long durations (1.2-3s)          | ✅ Manual              |

### **Hybrid Sweet Spot**

- **Plugin handles:** Basic message coverage (zoomed out, gentle)
- **Manual handles:** Dramatic beats (close-ups, push-ins, pullbacks)
- **Plugin configured:** Custom scale values for documentary feel

### **Event Timeline**

```javascript
IR.events = [
  // Messages
  { at: 150, kind: "APP", type: "MESSAGE_RECEIVED", ... },

  // Auto camera (Director - gentle coverage)
  { at: 150, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-0", scale: 0.95 } },
  { at: 240, kind: "CAMERA", type: "PAN", payload: { anchorId: "message-1", scale: 0.95 } },

  // Manual camera (Director choices)
  { at: 0, kind: "CAMERA", type: "SET", payload: { scale: 0.85 } },
  { at: 150, kind: "CAMERA", type: "ANIMATE", payload: { scale: 0.95, duration: 210 } },
  { at: 360, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-2", scale: 1.3 } },
  { at: 360, kind: "CAMERA", type: "TRACK", payload: { anchorId: "message-2" }, duration: 120 },
  { at: 480, kind: "CAMERA", type: "ANIMATE", payload: { scale: 0.9, duration: 60 } },

  // Picture-in-picture overlays
  { at: 150, kind: "OVERLAY", type: "PIP", payload: { content: "DR. SARAH SMITH..." }, duration: 210 },

  // B-roll footage
  { at: 0, kind: "VIDEO", type: "BROLL", payload: { src: "lab-establishing.mp4", opacity: 0.3 }, duration: 150 },
  { at: 360, kind: "VIDEO", type: "BROLL", payload: { src: "microscope-closeup.mp4", opacity: 0.2 }, duration: 120 },

  // Audio
  { at: 0, kind: "AUDIO", type: "BGM", payload: { soundId: "documentary-ambient.mp3" }, duration: 1050 }
]
```

### **Verdict: ✅ ACHIEVABLE**

- **Plugin configured:** Custom scale values for documentary style
- **Hybrid perfection:** Auto handles basics, manual handles beats
- **Multiple plugins:** PIP + BRoll + Voice all compose
- **Slow movements:** Manual control for cinematic pacing

---

## Scenario 5: Action - Breaking News

### **The Vision**

Frantic, breaking news situation. Messages flooding in every 2 seconds. Camera is CHAOTIC - shaking, rapid cuts, panic zoom-ins. Notifications interrupting constantly. Needs energy and urgency.

### **Episode Code**

```typescript
episode("breaking-news")
  .track("whatsapp", (wa) => {
    wa.at("1s").receive("News Bot", "🚨 BREAKING: Earthquake detected");
    wa.at("2s").receive("News Bot", "Magnitude 7.2");
    wa.at("3s").receive("News Bot", "Epicenter: Downtown");
    wa.at("4s").receive("Mom", "ARE YOU OK???");
    wa.at("5s").receive("News Bot", "Tsunami warning issued");
    wa.at("6s").receive("Dad", "WHERE ARE YOU");
    wa.at("7s").receive("News Bot", "Evacuate immediately");
    wa.at("8s").receive("Friend", "OMG I FELT IT");
    // ... 30 more rapid messages
  })

  .track("notifications", (notif) => {
    notif
      .at("1.5s")
      .show({
        app: "Emergency Alert",
        title: "EARTHQUAKE WARNING",
        mode: "urgent",
      });
    notif
      .at("5.5s")
      .show({
        app: "Emergency Alert",
        title: "TSUNAMI WARNING",
        mode: "urgent",
      });
    notif
      .at("9s")
      .show({
        app: "Emergency Alert",
        title: "EVACUATION ORDER",
        mode: "urgent",
      });
  })

  // AUTO CAMERA: Hyperactive
  .use(
    new CameraDirectorPlugin("fluid-tennis-energetic", {
      shakiness: 10, // MAX shake
      intensity: "panic",
    }),
  )

  // MANUAL: Amplify the chaos
  .camera((cam) => {
    // Constant shake throughout
    cam.span("0s", "40s").shake({
      intensityX: 5,
      intensityY: 3,
      frequency: 15,
      decay: 0.99, // Sustained shake
    });

    // Panic zoom on first alert
    cam.at("1s").zoom(1.4, { duration: "0.3s", easing: "easeOut" });

    // Rapid zoom out on "magnitude"
    cam.at("2s").zoom(1.0, { duration: "0.2s", easing: "easeIn" });

    // Panic zoom back in on "epicenter"
    cam.at("3s").zoom(1.5, { duration: "0.25s", easing: "easeOut" });

    // Whip pan on mom's message (emotional interrupt)
    cam.at("4s").whipPan({ direction: "left", speed: "instant" });

    // Another panic zoom on tsunami
    cam.at("5s").zoom(1.6, { duration: "0.3s", easing: "easeOut" });

    // Dutch tilt during chaos
    cam.span("10s", "20s").dutchTilt({ angle: 12 });

    // Shake intensifies
    cam.at("15s").shake({ intensityX: 10, intensityY: 8, frequency: 20 });
  })

  // SCREEN EFFECTS: Red alert flashing
  .use(
    new ScreenEffectPlugin({
      effects: [
        {
          at: "1s",
          type: "flash",
          color: "red",
          intensity: 0.5,
          duration: "0.2s",
        },
        {
          at: "5s",
          type: "flash",
          color: "red",
          intensity: 0.6,
          duration: "0.2s",
        },
        {
          at: "9s",
          type: "flash",
          color: "red",
          intensity: 0.7,
          duration: "0.3s",
        },
      ],
    }),
  )

  // ALERT SOUNDS
  .track("audio", (audio) => {
    audio.at("1s").sfx("emergency-alert.mp3", { volume: 0.8 });
    audio.at("5s").sfx("emergency-alert.mp3", { volume: 0.9 });
    audio.at("9s").sfx("emergency-alert.mp3", { volume: 1.0 });
    audio.span("0s", "40s").ambient("sirens-distant.mp3", { volume: 0.3 });
  })

  .build();
```

### **Camera Requirements**

| Requirement                  | How Achieved                       | Plugin or Manual?      |
| ---------------------------- | ---------------------------------- | ---------------------- |
| Rapid message coverage       | Energetic behavior, high intensity | ✅ Plugin (configured) |
| Constant shake               | Span-based sustained shake         | ✅ Manual (span)       |
| Panic zooms                  | Rapid zoom in/out                  | ✅ Manual              |
| Whip pans                    | Instant transitions                | ✅ Manual              |
| Dutch tilt (disorientation)  | Tilted framing during chaos        | ✅ Manual (span)       |
| Notification interrupt focus | High-priority interrupt behavior   | ✅ Plugin              |
| Intensifying shake           | Manual shake at key moments        | ✅ Manual              |

### **Event Timeline**

```javascript
IR.events = [
  // Rapid messages
  { at: 30, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  { at: 60, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  { at: 90, kind: "APP", type: "MESSAGE_RECEIVED", ... },
  // ... 30+ messages

  // Notifications (urgent priority)
  { at: 45, kind: "OS", type: "NOTIFICATION_SHOWN", payload: { mode: "urgent" } },
  { at: 165, kind: "OS", type: "NOTIFICATION_SHOWN", payload: { mode: "urgent" } },

  // Auto camera (Director - rapid coverage)
  { at: 30, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-0", scale: 1.2 } },
  { at: 45, kind: "CAMERA", type: "INTERRUPT_FOCUS", payload: { anchorId: "notification", scale: 1.4 } },
  { at: 60, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-1", scale: 1.2 } },
  // ... auto coverage

  // Manual camera (Amplify chaos)
  { at: 0, kind: "CAMERA", type: "SHAKE", payload: { intensityX: 5, intensityY: 3 }, duration: 1200 },
  { at: 30, kind: "CAMERA", type: "ZOOM", payload: { scale: 1.4, duration: 9 } },
  { at: 60, kind: "CAMERA", type: "ZOOM", payload: { scale: 1.0, duration: 6 } },
  { at: 90, kind: "CAMERA", type: "ZOOM", payload: { scale: 1.5, duration: 7.5 } },
  { at: 120, kind: "CAMERA", type: "WHIP_PAN", payload: { direction: "left" } },
  { at: 150, kind: "CAMERA", type: "ZOOM", payload: { scale: 1.6, duration: 9 } },
  { at: 300, kind: "CAMERA", type: "DUTCH_TILT", payload: { angle: 12 }, duration: 300 },
  { at: 450, kind: "CAMERA", type: "SHAKE", payload: { intensityX: 10, intensityY: 8 } },

  // Screen effects
  { at: 30, kind: "EFFECT", type: "FLASH", payload: { color: "red", intensity: 0.5 }, duration: 6 },
  { at: 150, kind: "EFFECT", type: "FLASH", payload: { color: "red", intensity: 0.6 }, duration: 6 },

  // Audio
  { at: 30, kind: "AUDIO", type: "SFX", payload: { soundId: "emergency-alert.mp3" } },
  { at: 0, kind: "AUDIO", type: "AMBIENT", payload: { soundId: "sirens-distant.mp3" }, duration: 1200 }
]
```

### **Verdict: ✅ ACHIEVABLE**

- **Plugin handles:** Rapid message coverage, notification interrupts
- **Manual amplifies:** Panic zooms, sustained shake, dutch tilt, whip pans
- **Hybrid chaos:** Auto + manual create frantic energy
- **Multiple plugins:** ScreenEffect + Audio compose perfectly
- **Urgency achieved:** Combination creates panic atmosphere

---

## Scenario 6: Mixed - Multi-App Coordination

### **The Vision**

User is texting AND browsing Instagram AND getting email notifications. Camera needs to switch between apps, show multi-tasking. Different camera styles per app (WhatsApp = tennis, Instagram = smooth pan, Email = static).

### **Episode Code**

```typescript
episode("multitasking-chaos")
  .track("whatsapp", (wa) => {
    wa.at("2s").receive("Friend", "You free tonight?");
    wa.at("5s").send("Let me check Instagram real quick");
  })

  .track("instagram", (ig) => {
    ig.at("7s").open();
    ig.at("8s").scroll("down", { distance: 200 });
    ig.at("10s").tap("post-3");
    ig.at("12s").like();
    ig.at("14s").close();
  })

  .track("whatsapp", (wa) => {
    wa.at("16s").send("Yeah I'm free!");
  })

  .track("email", (email) => {
    email.at("18s").notification("Work email arrived");
  })

  // SEPARATE PLUGINS PER APP
  .use(
    new CameraDirectorPlugin("fluid-tennis-energetic", {
      appsFilter: ["whatsapp"], // Only apply to WhatsApp
    }),
  )

  .use(
    new SmoothScrollCameraPlugin({
      appsFilter: ["instagram"], // Smooth pan for Instagram scroll
      scrollTracking: true,
    }),
  )

  .use(
    new StaticCameraPlugin({
      appsFilter: ["email"], // Static for email notifications
    }),
  )

  // MANUAL: App transitions
  .camera((cam) => {
    // WhatsApp: automatic tennis (plugin handles)

    // Transition to Instagram (7s)
    cam.at("7s").animate({ scale: 0.9, duration: "0.5s", easing: "easeOut" });

    // Instagram: smooth scroll tracking (plugin handles)

    // Transition back to WhatsApp (14s)
    cam.at("14s").animate({ scale: 1.0, duration: "0.5s", easing: "easeIn" });

    // Email notification interrupt (18s)
    cam.at("18s").focus("notification-banner", {
      scale: 1.3,
      duration: "0.4s",
      easing: "easeOut",
    });
    cam.at("20s").reset({ duration: "0.6s" });
  })

  .build();
```

### **Camera Requirements**

| Requirement             | How Achieved                           | Plugin or Manual?    |
| ----------------------- | -------------------------------------- | -------------------- |
| WhatsApp tennis         | Director plugin (filtered to WhatsApp) | ✅ Plugin (filtered) |
| Instagram smooth scroll | Scroll tracking plugin                 | ✅ Plugin (custom)   |
| Email static            | Static plugin                          | ✅ Plugin (filtered) |
| App transition zooms    | Manual animate between apps            | ✅ Manual            |
| Notification interrupt  | Manual focus                           | ✅ Manual            |

### **Key Architecture Test**

**Can plugins be app-specific?**

```typescript
class CameraDirectorPlugin {
  constructor(behavior, options = {}) {
    this.appsFilter = options.appsFilter || []; // ["whatsapp"]
  }

  process(events, context) {
    // Filter to relevant app events only
    const filteredEvents = events.filter((e) => {
      if (this.appsFilter.length === 0) return true; // No filter = all apps
      return this.appsFilter.includes(e.payload.appId);
    });

    return this.choreograph(filteredEvents);
  }
}
```

**Yes! Plugin can filter by app.**

### **Event Timeline**

```javascript
IR.events = [
  // WhatsApp messages
  { at: 60, kind: "APP", type: "MESSAGE_RECEIVED", payload: { appId: "whatsapp", ... } },
  { at: 150, kind: "APP", type: "MESSAGE_SENT", payload: { appId: "whatsapp", ... } },

  // Instagram actions
  { at: 210, kind: "APP", type: "APP_OPENED", payload: { appId: "instagram" } },
  { at: 240, kind: "APP", type: "SCROLL", payload: { appId: "instagram", distance: 200 } },
  { at: 300, kind: "APP", type: "TAP", payload: { appId: "instagram", elementId: "post-3" } },

  // Email notification
  { at: 540, kind: "OS", type: "NOTIFICATION_SHOWN", payload: { appId: "email", ... } },

  // Camera from WhatsApp plugin (filtered)
  { at: 60, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-0", scale: 1.2 } },
  { at: 480, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "message-1", scale: 1.2 } },

  // Camera from Instagram plugin (scroll tracking)
  { at: 240, kind: "CAMERA", type: "SMOOTH_PAN", payload: { distance: 200, duration: 60 } },

  // Manual camera (transitions)
  { at: 210, kind: "CAMERA", type: "ANIMATE", payload: { scale: 0.9, duration: 15 } },
  { at: 420, kind: "CAMERA", type: "ANIMATE", payload: { scale: 1.0, duration: 15 } },
  { at: 540, kind: "CAMERA", type: "FOCUS", payload: { anchorId: "notification-banner" } },
  { at: 600, kind: "CAMERA", type: "RESET", payload: { duration: 18 } }
]
```

### **Verdict: ✅ ACHIEVABLE**

- **App-specific plugins:** Filter by appId in process()
- **Multiple plugins:** Each handles different app
- **Manual transitions:** Smooth app switches
- **Hybrid coordination:** Plugins per-app + manual for transitions

---

## Scenario 7: Cinematic - Music Video Style

### **The Vision**

Messages timed to music beats. Camera movements synchronized with rhythm. No "smart" choreography - pure artistic direction. Every shot is a deliberate choice. Needs beat detection, tempo sync, creative transitions.

### **Episode Code**

```typescript
episode("music-video")
  .track("whatsapp", (wa) => {
    // Messages timed to beat (120 BPM = 0.5s per beat)
    wa.at("1s").receive("Lyrics", "We were young"); // Beat 1
    wa.at("1.5s").receive("Lyrics", "We were free"); // Beat 2
    wa.at("2s").receive("Lyrics", "We were everything"); // Beat 3
    wa.at("2.5s").receive("Lyrics", "We'll never be"); // Beat 4

    // Chorus (faster)
    wa.at("5s").receive("Lyrics", "Dancing"); // Beat
    wa.at("5.25s").receive("Lyrics", "In"); // Half-beat
    wa.at("5.5s").receive("Lyrics", "The"); // Half-beat
    wa.at("5.75s").receive("Lyrics", "Dark"); // Half-beat
  })

  .track("audio", (audio) => {
    audio.span("0s", "30s").bgm("music-track.mp3", { volume: 1.0 });
  })

  // NO AUTO CAMERA - This is pure art direction
  // Every movement is choreographed to music

  .camera((cam) => {
    // Intro: Slow dolly in
    cam.span("0s", "4s").dolly({ distance: 50, easing: "linear" });

    // Verse: On-beat focus changes
    cam
      .at("1s")
      .focus("message-0", { scale: 1.2, duration: "0.3s", easing: "easeOut" });
    cam
      .at("1.5s")
      .focus("message-1", { scale: 1.2, duration: "0.3s", easing: "easeOut" });
    cam
      .at("2s")
      .focus("message-2", { scale: 1.3, duration: "0.3s", easing: "easeOut" }); // Build
    cam
      .at("2.5s")
      .focus("message-3", { scale: 1.4, duration: "0.3s", easing: "easeOut" }); // Peak

    // Pre-chorus: Slow zoom out
    cam.span("3s", "5s").animate({ scale: 0.95, easing: "easeInOut" });

    // Chorus: Rapid cuts on half-beats
    cam
      .at("5s")
      .focus("message-4", { scale: 1.5, duration: "0.15s", easing: "linear" });
    cam
      .at("5.25s")
      .focus("message-5", { scale: 1.5, duration: "0.15s", easing: "linear" });
    cam
      .at("5.5s")
      .focus("message-6", { scale: 1.5, duration: "0.15s", easing: "linear" });
    cam
      .at("5.75s")
      .focus("message-7", { scale: 1.5, duration: "0.15s", easing: "linear" });

    // Drop: Dutch tilt + shake
    cam.span("6s", "10s").dutchTilt({ angle: 15 });
    cam.at("6s").shake({ intensityX: 6, intensityY: 4, frequency: 12 });

    // Bridge: Slow 360° rotation (if supported)
    cam.span("12s", "16s").rotate({ angle: 360, easing: "linear" });

    // Outro: Dolly out to wide
    cam.span("20s", "30s").dolly({ distance: -100, easing: "easeInOut" });
  })

  // BEAT VISUALIZATION: Flash on beats
  .use(
    new BeatVisualizerPlugin({
      bpm: 120,
      visualizations: [
        { beat: 1, effect: "flash", intensity: 0.3 },
        { beat: 2, effect: "flash", intensity: 0.3 },
        { beat: 3, effect: "pulse", intensity: 0.4 },
        { beat: 4, effect: "pulse", intensity: 0.5 },
      ],
    }),
  )

  .build();
```

### **Camera Requirements**

| Requirement            | How Achieved                     | Plugin or Manual? |
| ---------------------- | -------------------------------- | ----------------- |
| Dolly in (intro)       | Linear dolly over 4s             | ✅ Manual (span)  |
| On-beat focus changes  | Timed to BPM (0.5s intervals)    | ✅ Manual         |
| Building intensity     | Increasing scale (1.2 → 1.4)     | ✅ Manual         |
| Rapid cuts (chorus)    | Fast focus on half-beats (0.15s) | ✅ Manual         |
| Dutch tilt (drop)      | Tilted framing                   | ✅ Manual (span)  |
| Shake on drop          | Rhythmic shake                   | ✅ Manual         |
| 360° rotation (bridge) | Continuous rotation              | ✅ Manual (span)  |
| Dolly out (outro)      | Pull back to wide                | ✅ Manual (span)  |

### **Why 100% Manual?**

**Music video is pure artistic choreography. NO automation.**

- Every camera move is timed to music (BPM: 120)
- Movements express emotion (dolly in = intimacy, zoom out = reflection)
- Rhythm dictates cuts (verse = 0.5s, chorus = 0.25s)
- Effects synchronized (dutch tilt on drop, rotation on bridge)

**Plugin would be in the way.** This needs human creativity.

**Alternative: Tempo-aware plugin?**

```typescript
.use(new MusicSyncPlugin({
  bpm: 120,
  style: "music-video",
  syncToBeats: true
}))
// But still wouldn't match artistic vision
```

### **Event Timeline**

```javascript
IR.events = [
  // Messages (timed to beats)
  {
    at: 30,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { text: "We were young" },
  },
  {
    at: 45,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { text: "We were free" },
  },
  {
    at: 60,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { text: "We were everything" },
  },
  {
    at: 75,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { text: "We'll never be" },
  },

  // Chorus (half-beat timing)
  {
    at: 150,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { text: "Dancing" },
  },
  { at: 157.5, kind: "APP", type: "MESSAGE_RECEIVED", payload: { text: "In" } },
  { at: 165, kind: "APP", type: "MESSAGE_RECEIVED", payload: { text: "The" } },
  {
    at: 172.5,
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { text: "Dark" },
  },

  // Audio
  {
    at: 0,
    kind: "AUDIO",
    type: "BGM",
    payload: { soundId: "music-track.mp3" },
    duration: 900,
  },

  // Manual camera (choreographed to music)
  {
    at: 0,
    kind: "CAMERA",
    type: "DOLLY",
    payload: { distance: 50 },
    duration: 120,
  },
  {
    at: 30,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-0", scale: 1.2 },
  },
  {
    at: 45,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-1", scale: 1.2 },
  },
  {
    at: 60,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-2", scale: 1.3 },
  },
  {
    at: 75,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-3", scale: 1.4 },
  },
  {
    at: 90,
    kind: "CAMERA",
    type: "ANIMATE",
    payload: { scale: 0.95 },
    duration: 60,
  },
  {
    at: 150,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-4", scale: 1.5, duration: 4.5 },
  },
  {
    at: 157.5,
    kind: "CAMERA",
    type: "FOCUS",
    payload: { anchorId: "message-5", scale: 1.5, duration: 4.5 },
  },
  {
    at: 180,
    kind: "CAMERA",
    type: "DUTCH_TILT",
    payload: { angle: 15 },
    duration: 120,
  },
  {
    at: 180,
    kind: "CAMERA",
    type: "SHAKE",
    payload: { intensityX: 6, intensityY: 4 },
  },
  {
    at: 360,
    kind: "CAMERA",
    type: "ROTATE",
    payload: { angle: 360 },
    duration: 120,
  },
  {
    at: 600,
    kind: "CAMERA",
    type: "DOLLY",
    payload: { distance: -100 },
    duration: 300,
  },

  // Beat visualizations
  { at: 30, kind: "EFFECT", type: "FLASH", payload: { intensity: 0.3 } },
  { at: 45, kind: "EFFECT", type: "FLASH", payload: { intensity: 0.3 } },
  { at: 60, kind: "EFFECT", type: "PULSE", payload: { intensity: 0.4 } },
  { at: 75, kind: "EFFECT", type: "PULSE", payload: { intensity: 0.5 } },
];
```

### **Verdict: ✅ ACHIEVABLE**

- **100% manual:** Pure artistic direction
- **Precise timing:** Frame-perfect to BPM
- **Creative freedom:** Dolly, dutch tilt, rotation, shake all work
- **Span-based:** Long effects (dolly, rotate) use span
- **Beat sync:** Manual timing achieves perfect sync

---

## Scenario 8: Technical - API Demo

### **The Vision**

Demonstrating a developer API through simulated messages. Needs code highlighting, step markers, progress indicators. Camera shows code snippets appearing as messages. Technical, educational, precise.

### **Episode Code**

```typescript
episode("api-demo")
  .track("whatsapp", (wa) => {
    // Simulated API responses as messages
    wa.at("2s").receive("API", "POST /auth/login");
    wa.at("3s").receive("API", '{"username": "demo", "password": "***"}');
    wa.at("5s").receive("API", "✅ 200 OK");
    wa.at("6s").receive("API", '{"token": "eyJ0eXAi..."}');

    wa.at("8s").receive("API", "GET /users/me");
    wa.at("9s").receive("API", "Authorization: Bearer eyJ0eXAi...");
    wa.at("11s").receive("API", "✅ 200 OK");
    wa.at("12s").receive("API", '{"id": 123, "name": "Demo User"}');
  })

  // STATIC CAMERA - Tutorial/educational style
  .use(
    new CameraDirectorPlugin("static", {
      focusOnNewMessage: true,
      holdDuration: 2000, // Hold 2s to read code
      scale: 1.15, // Slight zoom for readability
    }),
  )

  // ANNOTATIONS: Code highlighting
  .use(
    new CodeHighlightPlugin({
      syntax: "json",
      highlights: [
        {
          at: "3s",
          anchor: "message-1",
          ranges: [{ start: 1, end: 10 }],
          color: "blue",
        },
        {
          at: "6s",
          anchor: "message-3",
          ranges: [{ start: 11, end: 30 }],
          color: "green",
        },
      ],
    }),
  )

  // STEP MARKERS: Progress indicator
  .use(
    new StepMarkerPlugin({
      steps: [
        { at: "2s", label: "Step 1: Login", duration: "4s" },
        { at: "8s", label: "Step 2: Get User", duration: "5s" },
      ],
    }),
  )

  .build();
```

### **Camera Requirements**

| Requirement                 | How Achieved                 | Plugin or Manual?      |
| --------------------------- | ---------------------------- | ---------------------- |
| Static most of time         | Static plugin behavior       | ✅ Plugin              |
| Focus on new message        | Plugin: focusOnNewMessage    | ✅ Plugin (configured) |
| Hold to read code           | Plugin: holdDuration: 2000ms | ✅ Plugin (configured) |
| Slight zoom for readability | Plugin: scale: 1.15          | ✅ Plugin (configured) |
| Deliberate pacing           | Plugin handles with config   | ✅ Plugin              |

### **Plugin Configuration Powerful Here**

**Static plugin with educational config:**

- Auto-focus each new message (code response)
- Hold 2s (time to read code)
- Slight zoom (1.15x for readability)
- No tennis/movement (static tutorial style)

**No manual needed** - plugin configuration handles everything.

### **Verdict: ✅ ACHIEVABLE**

- **Plugin with config:** Static behavior perfectly suited
- **Multiple plugins:** CodeHighlight + StepMarker compose
- **Educational pacing:** Hold duration ensures readability
- **Zero manual:** Plugin config is enough

---

## Edge Cases & Complex Scenarios

### **Edge Case 1: Conflicting Events**

**What if plugin and manual both try to control camera at same frame?**

```typescript
.use(new CameraDirectorPlugin("fluid-tennis"))
.camera(cam => {
  // Manual zoom at same frame as auto-focus?
  cam.at("5s").zoom(1.8, { duration: "1s" });
})

// At frame 150 (5s):
// - Plugin generates: FOCUS (scale: 1.2)
// - Manual generates: ZOOM (scale: 1.8)
// Which wins?
```

**Solution: Last-write-wins or priority system**

```typescript
// Compiler merges events:
IR.events = [
  { at: 150, kind: "CAMERA", type: "FOCUS", payload: {...}, source: "plugin" },
  { at: 150, kind: "CAMERA", type: "ZOOM", payload: {...}, source: "manual" }
]

// Engine processes in order:
// 1. Process FOCUS (sets scale: 1.2)
// 2. Process ZOOM (overrides scale: 1.8)
// Result: Manual wins (last-write-wins)
```

**Alternative: Priority field**

```typescript
{ at: 150, kind: "CAMERA", type: "FOCUS", priority: 1 }  // Plugin
{ at: 150, kind: "CAMERA", type: "ZOOM", priority: 10 }  // Manual (higher)
// Process in priority order → manual wins
```

### **Verdict: ✅ SOLVABLE** - Last-write-wins or priority field

---

### **Edge Case 2: Plugin Dependencies**

**What if SubtitlePlugin needs CameraDirectorPlugin's output?**

```typescript
// SubtitlePlugin wants to know where camera is focused
// To position subtitles accordingly
class SubtitlePlugin {
  process(events) {
    // Need CAMERA events to position subtitles
    const cameraEvents = events.filter(e => e.kind === "CAMERA");
    // ...
  }
}

.use(new CameraDirectorPlugin())  // Generates CAMERA events
.use(new SubtitlePlugin())         // Needs CAMERA events
```

**Problem:** Plugin order matters!

**Solution: Dependency declaration + topological sort**

```typescript
class SubtitlePlugin {
  name = "subtitles";
  dependsOn = ["camera-director"];  // Explicit dependency

  process(events) {
    // camera-director has already run
    // CAMERA events are in IR
  }
}

// Compiler:
function applyPlugins(plugins) {
  const sorted = topologicalSort(plugins);  // camera-director → subtitles
  for (const plugin of sorted) {
    plugin.process(...);
  }
}
```

### **Verdict: ✅ SOLVABLE** - Dependency declaration + topological sort

---

### **Edge Case 3: Different FPS Per Episode**

**Episode 1: 30fps, Episode 2: 60fps - Does plugin work?**

```typescript
episode("episode-30fps").use(new CameraDirectorPlugin("fluid-tennis")).build();
// fps: 30, duration events calculated in frames (30, 60, 90...)

episode("episode-60fps").use(new CameraDirectorPlugin("fluid-tennis")).build();
// fps: 60, duration events should be (60, 120, 180...)
```

**Solution: CompilerContext provides fps**

```typescript
class CameraDirectorPlugin {
  process(events, context: CompilerContext) {
    const fps = context.fps; // 30 or 60

    // Use fps for frame calculations
    const duration = 0.5 * fps; // 0.5s = 15 frames (30fps) or 30 frames (60fps)
  }
}
```

### **Verdict: ✅ WORKS** - Context provides fps, plugin adapts

---

### **Edge Case 4: Very Long Episode (1 hour)**

**Does architecture scale to 108,000 frames (60min @ 30fps)?**

**Concerns:**

- IR.events[] array with ~50,000 events?
- Plugin processing time?
- Memory usage?

**Analysis:**

1. **Array size:** 50,000 events × 200 bytes/event = 10MB (fine)
2. **Processing time:** O(n) plugin processing, n=50k → ~100ms (fine)
3. **Memory:** IR is frozen, no runtime allocation (fine)
4. **Render:** Engine uses keyframes + event index (fine)

### **Verdict: ✅ SCALES** - Architecture handles long episodes

---

### **Edge Case 5: No Messages (Pure Manual)**

**What if episode has NO messages, just manual camera?**

```typescript
episode("camera-test")
  .camera((cam) => {
    cam.at("0s").dolly({ distance: 100, duration: "10s" });
    cam.at("10s").rotate({ angle: 360, duration: "10s" });
  })
  .build();
```

**Does plugin system break?**

**No!** Plugins are optional:

- No plugins registered → renderer uses built-in tracks only
- Manual camera events still work
- TrackRegistry might be empty (no problem)

### **Verdict: ✅ WORKS** - Plugins are optional, manual always works

---

## Verdict: Can We Achieve It?

### ✅ **ALL SCENARIOS ACHIEVABLE**

| Scenario                | Plugin % | Manual % | Verdict                       |
| ----------------------- | -------- | -------- | ----------------------------- |
| Comedy (Roast Battle)   | 80%      | 20%      | ✅ Perfect hybrid             |
| Drama (Breakup Reveal)  | 20%      | 80%      | ✅ Manual-heavy works         |
| Tutorial (How-to)       | 0%       | 100%     | ✅ All manual works           |
| Documentary (Interview) | 40%      | 60%      | ✅ Configured plugin + manual |
| Action (Breaking News)  | 60%      | 40%      | ✅ Plugin + manual amplify    |
| Multi-App               | 70%      | 30%      | ✅ App-specific plugins       |
| Music Video             | 0%       | 100%     | ✅ Pure artistic direction    |
| API Demo                | 100%     | 0%       | ✅ Configured plugin perfect  |

### **Why Architecture Succeeds**

1. **Hybrid flexibility:** Plugin + manual merge seamlessly
2. **Plugin configuration:** Behaviors customizable per episode
3. **App filtering:** Plugins can target specific apps
4. **Manual override:** Always available for special moments
5. **Multiple plugins:** Compose together (Subtitle + Voice + Camera)
6. **Span support:** Long effects (dolly, rotate, dutch tilt) work
7. **Precise timing:** Frame-perfect control for music sync

### **What We Learned**

**Different episodes need different approaches:**

- **Comedy/Action:** Plugin handles majority, manual for special beats
- **Drama/Documentary:** Manual-heavy for emotional pacing, plugin for basics
- **Tutorial/Music Video:** 100% manual for precise artistic control
- **Technical/Educational:** Plugin with configuration is perfect

**The architecture supports ALL of these** because:

- Plugins are optional (can go 100% manual)
- Hybrid is seamless (plugin + manual events merged)
- Configuration is powerful (customize plugin behavior)
- Manual is always available (creative freedom preserved)

### **Edge Cases: All Solvable**

- Conflicting events → Last-write-wins or priority
- Plugin dependencies → Topological sort
- Different FPS → Context provides fps
- Long episodes → Architecture scales
- No messages → Plugins optional

---

## Final Answer

**YES, we can achieve ALL of these diverse scenarios!**

**The two-sided plugin architecture:**

- ✅ Handles automation (comedy, action)
- ✅ Handles precision (tutorial, music video)
- ✅ Handles hybrid (drama, documentary)
- ✅ Handles multi-app (app filtering)
- ✅ Handles configuration (API demo)
- ✅ Handles edge cases (conflicts, dependencies, scale)

**The architecture is validated.** Ready to implement.
