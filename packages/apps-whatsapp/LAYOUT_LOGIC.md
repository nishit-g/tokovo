# WhatsApp Layout Architecture: The "Visual Run" Model

This document details the deterministic layout engine used for the WhatsApp UI.
It strictly adheres to **Pure Mathematics**, calculating positions without heuristics or randomness.

---

## 1. The Core Equation

The vertical position (`Y`) of any message is derived from the previous message's state:

```math
Y_{next} = Y_{prev} + Height_{prev} + Gap
```

Where:
*   **Y_prev**: Absolute position of previous bubble.
*   **Height_prev**: Mathematically exact height (Padding + Content).
*   **Gap**: Deterministic spacing value based on the "Visual Run" truth table.

---

## 2. Visual Run Logic (The Truth Table)

The system detects **Visual Runs**—tight bursts of simple text messages from the same sender.

### The Deterministic Truth Table

| Prev Sender | Next Sender | Types | Attributes (Reply/React) | Result | Gap Constant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | **A** | Text -> Text | None | **VISUAL RUN** | `GAP_MINIMAL` (6px) |
| **A** | **B** | Any | Any | **NEW SENDER** | `GAP_NORMAL` (36px) |
| **A** | **A** | Any -> **Media** | Any | **RUN BREAK** | `GAP_NORMAL` (36px) |
| **A** | **A** | **Media** -> Any | Any | **RUN BREAK** | `GAP_NORMAL` (36px) |
| **A** | **A** | Text -> Text | **Has Reply** | **RUN BREAK** | `GAP_NORMAL` (36px) |

Code: `src/config/layout-config.ts` -> `calculateSmartGap`.

---

## 3. Configuration Map (`DEFAULT_LAYOUT_CONFIG`)

This object is the **Brain** of the layout. Here is exactly where every field is used and what it affects.

### A. `messageTypes` (Dimensions)
*   **Used By**: `chat.ts` -> `calculateMessageHeight`, `calculateBubbleWidth`.
*   **Fields**:
    *   `height.base`: The skeleton height (Padding + Footer). defined by `LAYOUT_CONSTANTS`.
    *   `height.lineHeight`: 66px. Multiplied by number of text lines.
    *   `width.maxPercent`: 0.78. Limits bubble width to 78% of screen.
    *   `width.horizontalPadding`: 72px. Adds width to text for accurate wrapping.

### B. `spacing` (The Gapping Logic)
*   **Used By**: `chat.ts` -> `calculateSmartGap`.
*   **Fields**:
    *   `base.minimal`: **6px** (2px visual). Used for "Visual Run" rows.
    *   `base.normal`: **36px** (12px visual). Used for "Run Breaks" / Diff Senders.
    *   `global.bubbleMargin`: **36px**. Distance from left/right screen edge.
    *   `global.topPadding`/`bottomPadding`: Safe areas for scroll.

### C. `additions` (Dynamic Height Modifiers)
*   **Used By**: `chat.ts` -> `calculateMessageHeight`.
*   **Logic**: If a feature is present, its height is mathematically added to the `base`.
*   **Fields**:
    *   `senderName`: **45px**. Added if `from !== prev.from` (Group Chat).
    *   `reaction`: **36px**. Added if `msg.reactions.length > 0`.
    *   `reply`: **90px**. Added if `msg.replyTo` exists.
    *   `linkPreview`: **180px**. Added if `msg.linkPreview` exists.

### D. `animation` (Motion)
*   **Used By**: `chat.ts` (Layout State) & `ui.tsx` (CSS).
*   **Fields**:
    *   `messageAppearDuration`: **12 frames**. Speed of entry.
    *   `messageAppearOffset`: **30px**. Slide-up distance.

---

## 4. The "Single Source of Truth" Chain

Visual Consistency is not accidental. It is enforced by this dependency chain:

1.  **`LAYOUT_CONSTANTS`** (The Roots)
    *   Defines raw pixels: `BUBBLE_PADDING_V = 24`, `LINE_HEIGHT = 66`.

2.  **`DEFAULT_LAYOUT_CONFIG`** (The Brain)
    *   Consumes Roots: `base: BUBBLE_PADDING_V * 2 + FOOTER`.

3.  **Layout Engine (`chat.ts`)** (The Calculator)
    *   Consumes Brain: Calculates `Y` positions.

4.  **Resolved Experience (`experience/resolver.ts`)** (The Paint Contract)
    *   Resolves platform, appearance, locale direction, tokens, and presentation policy from explicit input.

5.  **UI Renderer (`components/ChatMessageItem.tsx`)** (The Canvas)
    *   Consumes the resolved experience and renders the canonical SVG-tailed message item.

**Result:** The Calculator thinks the box is 150px high. The Canvas draws a box 150px high. **Perfect alignment.**

---

## 5. How to Tune (The Knobs)

| Goal | Action |
| :--- | :--- |
| **Make Text Bubbles Taller** | Increase `BUBBLE_PADDING_V` or `LINE_HEIGHT` in `LAYOUT_CONSTANTS`. |
| **Make Gaps Wider** | Increase `GAP_NORMAL` in `LAYOUT_CONSTANTS`. |
| **Change Font Size** | Change `FONT_SIZE` in `LAYOUT_CONSTANTS`. |
| **Adjust "Run Break" tightness** | Change `GAP_NORMAL` (affects runs) or `GAP_MINIMAL` (affects bursts). |

Modify `src/config/layout-config.ts`. The rest of the system updates automatically.

The renderer does not measure the live DOM, query elements, use wall-clock time, or
guess pixel targets. The long-thread release test projects and lays out 10,000 messages
within explicit cold/hot budgets, while repeated immutable inputs return cached objects.
The complete projection remains available for replies and semantic targeting, but
`thread/window.ts` caps the mounted React tree at 120 ordered messages. The window
follows the latest message or a stable unread/message anchor and fails loudly if an
explicit anchor is missing.

Conversation state persists one canonical `messages` array. Lookup maps are derived
inside immutable projection only; the reducer never stores a second mutable message
collection that could diverge under Immer.
