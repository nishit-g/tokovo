# Best Practices

> Patterns and anti-patterns for Tokovo development

---

## The Golden Rules

### 1. Always Use prepareEpisode()

```typescript
// ✅ CORRECT
const compiled = prepareEpisode(myEpisode, plugins);
const world = runEpisode(compiled, frame);

// ❌ WRONG - Bypasses pipeline
replay(someWorld, rawEvents, frame);
```

### 2. All Data in payload

```typescript
// ✅ CORRECT
{
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    payload: { from: "Sarah", text: "Hey!" }
}

// ❌ WRONG - Flat fields
{
    kind: "APP",
    type: "MESSAGE_RECEIVED",
    from: "Sarah",  // Should be in payload!
    text: "Hey!"
}
```

### 3. Use b.use() for App APIs

```typescript
// ✅ CORRECT - Scoped API
d.beat("chat", b => {
    const wa = b.use("app_whatsapp");
    wa.receive("dm_sarah", { from: "Sarah", text: "Hey!" });
});

// ❌ WRONG - Prototype mutation
b.whatsapp.receive("Sarah", "Hey!");  // Don't do this
```

---

## Episode Design

### Keep Beats Focused

```typescript
// ✅ GOOD - Single purpose beats
d.beat("greeting", b => {
    b.receive("Friend", "Hey!");
    b.send("Hi there!");
});

d.beat("question", b => {
    b.receive("Friend", "What's up?");
});

// ❌ BAD - Everything in one beat
d.beat("all", b => {
    // 50 lines of messages...
});
```

### Use Semantic Annotations

```typescript
// ✅ GOOD - Context for AI/Director
b.receive("Friend", "I love you", {
    mood: "romantic",
    intensity: 0.9
});

// ❌ BAD - No context
b.receive("Friend", "I love you");
```

### Declare Conversations First

```typescript
// ✅ GOOD - Declare before use
d.conversation("dm_sarah", { name: "Sarah", type: "dm" });
d.beat("chat", b => {
    b.receive("Sarah", "Hey!");
});

// ❌ BAD - Using undeclared conversation
d.beat("chat", b => {
    b.receive("Sarah", "Hey!");  // Who is Sarah?
});
```

---

## Plugin Development

### Start with Tier A

```typescript
// Start simple, add complexity later
const MyPlugin: TokovoPlugin = {
    id: "app_myapp",
    version: "1.0.0",
    displayName: "My App",
    
    // Minimum: reducer + views
    reducer: (state, event) => { ... },
    views: { AppRoot: () => <MyUI /> }
};
```

### Keep Reducers Pure

```typescript
// ✅ GOOD - Pure state updates
reducer: (state, event) => {
    if (event.type === "MESSAGE_RECEIVED") {
        state.messages.push(event.payload.message);
    }
}

// ❌ BAD - Side effects
reducer: (state, event) => {
    console.log("Event:", event);           // Log
    fetch("/api/track", { body: event });   // Network
    Math.random();                          // Non-determinism
}
```

### Use Type Augmentation

```typescript
// ✅ GOOD - Type-safe payloads
declare module "@tokovo/core" {
    interface AppEventPayloads {
        app_myapp: {
            MESSAGE_RECEIVED: { from: string; text: string };
        };
    }
}

// Now TypeScript knows payload type
event.payload.from  // string ✓
```

---

## Performance

### Compile Outside Component

```typescript
// ✅ GOOD - Compile once
const compiled = prepareEpisode(episode, plugins);

export const MyVideo = () => {
    const frame = useCurrentFrame();
    const world = runEpisode(compiled, frame);
    return <TokovoRenderer world={world} />;
};

// ❌ BAD - Compile every render
export const MyVideo = () => {
    const compiled = prepareEpisode(episode, plugins);  // Slow!
    // ...
};
```

### Memoize Expensive Calculations

```tsx
const MyComponent = ({ world }: { world: WorldState }) => {
    // ✅ GOOD - Memoize
    const messages = useMemo(() => 
        getMessages(world, deviceId),
        [world.conversations]
    );
    
    return <MessageList messages={messages} />;
};
```

### Use React.memo for Views

```tsx
// ✅ GOOD - Prevent unnecessary re-renders
export const MessageBubble = React.memo(({ message }) => {
    return <div className="bubble">{message.text}</div>;
});
```

---

## Debugging

### Enable Tracing

```typescript
prepareEpisode(episode, plugins, { 
    includeDebug: true  // Include _trace on events
});
```

### Use Event Inspector

```tsx
// Development helper
{process.env.NODE_ENV === 'development' && (
    <EventInspector world={world} frame={frame} />
)}
```

### Check Event Order

```typescript
// Log events at frame
const eventsAtFrame = compiled.events.filter(e => e.at === frame);
console.log("Events at frame", frame, eventsAtFrame);
```

---

## Common Mistakes

### Don't Use Randomness

```typescript
// ❌ BAD - Non-deterministic
Math.random()
Date.now()
crypto.randomUUID()

// ✅ GOOD - Use frame-based IDs
`msg_${frame}_${index}`
```

### Don't Mutate Props

```typescript
// ❌ BAD - Direct mutation
world.conversations.dm_sarah.messages.push(msg);

// ✅ GOOD - Use reducer
// Immer handles immutability in reducers
```

### Don't Bypass the Pipeline

```typescript
// ❌ BAD - Manual events
const events = [
    { at: 0, kind: "APP", type: "MESSAGE_RECEIVED", ... }
];
replay(world, events, frame);

// ✅ GOOD - Use DSL + compile
const episode = episode("demo", ep => { ... });
const compiled = prepareEpisode(episode, plugins);
```

---

## Checklist

Before releasing an episode:

- [ ] All conversations declared
- [ ] Plugin dependencies included
- [ ] Type checks pass (`tsc --noEmit`)
- [ ] Preview works in Remotion Studio
- [ ] Audio files exist
- [ ] Timing feels natural
- [ ] Camera movements smooth
- [ ] No console errors
