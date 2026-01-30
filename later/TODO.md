# TODO: Camera Improvements

## 🎥 Camera Flow Issues

### Issue: Jarring jumps in mega-camera-showcase

**Status:** Identified, not yet fixed  
**Priority:** Medium  
**Reported:** 2026-01-28

**Problem:**
The mega episode skips intermediate messages in bursts, causing jarring camera jumps instead of smooth flow.

**Current behavior (BAD):**

```typescript
1s:   Focus message-0 (Sarah: "OMG")
// Camera sits still for 1.5s while messages 1, 2, 3 appear
2.5s: JUMP to message-3 (jarring!)
```

**Expected behavior (GOOD):**

```typescript
1s:   Focus message-0 (Sarah: "OMG")
1.5s: Focus message-1 (smooth transition)
2s:   Focus message-2 (smooth transition)
2.5s: Focus message-3 (smooth transition)
// Camera tracks EVERY message as it arrives
```

**Solution:**
For message bursts, camera should smoothly track each message with quick focus transitions (0.3s duration), not jump from first to last.

**Files affected:**

- `packages/episodes/src/showcases/mega-camera-showcase.episode.ts`

**Notes:**

- This applies to ALL burst sequences in the episode
- Each message should get camera acknowledgment
- Use `focus()` with short duration for burst continuations
- Don't skip messages!

---

## 🔮 Future Camera Ideas

### Auto-choreography API

- Implement `cam.auto()` wrapper
- Expose Director to episode authors
- Documentation for custom behaviors

### More Built-in Behaviors

- `kenBurns` during long typing pauses
- `whipPan` for rapid exchanges
- `dolly-zoom` for dramatic reveals

### Multi-device Camera

- Split-screen support
- Camera switching between devices
- Picture-in-picture effects
