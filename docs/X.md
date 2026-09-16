# X App Architecture

> **Current context:** X is one of the two reference migrated headless packages. The former visual
> editor and X-specific editor contribution were deleted. See
> [Visual Editor Decision](./STUDIO.md) and the
> [Tokovo Engineering Handbook](./ENGINEERING_HANDBOOK.md).

Status: implemented; regression and visual verification commands below

Owner: `@tokovo/apps-x`
Replacement policy: hard cut; no legacy runtime state, compatibility reducer, or guessed camera geometry

## Product bar

X is a deterministic, app-owned simulation of the core product surfaces. It must look credible in a close phone shot, remain readable in a wide composition, replay identically at any frame order, and expose semantic geometry so an episode can change cinematography without changing app code.

This is not a skin over the current package. The existing package has a useful plugin boundary and useful domain vocabulary, but its runtime repair paths, array-scanning model, approximate layouts, placeholder-heavy UI, generic audio, and weak visual proof are replaced.

## Visual direction

The direction is restrained editorial utility:

- content is the visual lead; chrome is quiet and exact
- density matches a real social feed rather than a marketing card stack
- light, dim, and lights-out palettes are authored as coherent experiences
- iOS and Android share semantics but receive platform-specific type, navigation, touch-target, and safe-area recipes
- media, avatars, polls, quote posts, metrics, typing, and notifications have finished states; no emoji or grey-circle placeholders appear in curated proof
- motion is deterministic and short: route transitions, optimistic action feedback, composer progress, media state, and typing only
- backgrounds and camera effects support the app rather than overpower it

## Runtime invariants

1. Every mounted X instance is canonical before the first runtime event.
2. Reducers mutate canonical state only. They never create missing arrays, records, users, posts, threads, messages, routes, timestamps, or defaults.
3. Duplicate entity creation and unknown references throw stable `X_*` errors.
4. Every time shown by the UI comes from an explicit epoch-millisecond value. Frame numbers are never interpreted as Unix timestamps.
5. Required render selectors throw when the app instance or required route target is absent. Optional lookup selectors are named `find*` and may return `undefined`.
6. Entity lookup is constant-time. Ordered collections use ID arrays plus normalized records.
7. Layout computation is a pure function of canonical app state, viewport, platform, appearance, locale, and authored scroll state.
8. Cinematic subjects are projected from the same layout model that paints the UI. No subject may invent a rectangle.
9. Headless app state and layout depend on no wall clock, live network, random number, or DOM measurement. Bounded measurement caches memoize immutable inputs; the shared UI-only draft component measures its caret viewport.
10. The same episode and frame render identically in fresh browser processes and arbitrary frame order.

## Canonical state

```ts
interface XStateV2 {
  schemaVersion: 2;
  layoutRevision: number;
  locale: "en-US" | "ar-SA" | "hi-IN";
  viewMode: "FEED" | "CHAT" | "FULLSCREEN";
  conversationId?: string;

  usersById: Record<string, XUser>;
  tweetsById: Record<string, XTweet>;
  timelineIds: string[];
  notificationIds: string[];
  notificationsById: Record<string, XNotification>;
  dmThreadIds: string[];
  dmThreadsById: Record<string, XDMThread>;
  dmMessagesById: Record<string, XDMMessage>;

  route: XRoute;
  navigationStack: XRoute[];
  currentUserId: string | null;
  composer: XComposerState;
  threadDrafts: Record<string, string>;
  timelineTab: "forYou" | "following";
  notificationsTab: "all" | "verified" | "mentions";
  profileTab: "posts" | "replies" | "media" | "likes";
  scroll: {
    timeline: number;
    tweetById: Record<string, number>;
    notifications: number;
    messages: number;
    profileById: Record<string, number>;
    threadFromBottomById: Record<string, number>;
  };
  recentInteraction: XRecentInteraction | null;
  lastTransition: XRouteTransition | null;
}
```

Snapshots remain author-friendly arrays, but validation and hydration convert them once into this shape. Snapshot schema version 2 is the only accepted schema.

## Experience resolution

The app resolves one immutable experience object at its root:

```mermaid
flowchart LR
  D["Device profile"] --> E["X experience resolver"]
  A["App appearance"] --> E
  T["App theme"] --> E
  L["Locale"] --> E
  E --> P["Platform presentation"]
  E --> C["Color and material theme"]
  E --> Y["Typography and spacing"]
  E --> I["Icon recipes"]
  E --> S["Screen painters"]
```

- `device.appAppearance` owns light versus dark.
- `device.appTheme` owns the X palette variant: default, `x-dim`, or `x-lights-out`.
- OS appearance is used only when app appearance is not explicitly authored.
- Locale and text direction come from canonical state, seeded from the device during compilation or explicitly authored in the snapshot.
- Platform presentation is selected from the device profile; it is never inferred from CSS or user agent data.

## Package boundaries

```text
@tokovo/apps-x
├── contract/       public snapshots, views, events, schemas
├── bootstrap/      strict validation and one-time hydration
├── runtime/        canonical state, reducer, required/optional selectors
├── experience/     platform + appearance + theme + locale resolution
├── presentation/   iOS/Android recipes and screen routing
├── components/
│   ├── primitives/ app-owned icons, text, avatar, controls, materials
│   ├── posts/      post, media, poll, quote, metrics, thread line
│   └── screens/    timeline, detail, compose, notifications, profile, DMs
├── layout/         pure canonical layout projection and render windows
├── anchors/        versioned entity anchor IDs
├── camera/         cinematic subject mapping from layout only
├── lowering/       authored events -> strict runtime events
├── dsl/            typed authoring facade
├── notifications/  semantic device notification adapter
└── localization/   deterministic copy, numbers, and timestamps
```

App semantics do not enter the compiler, core, renderer, or episode overlay layer.

## Event flow

```mermaid
sequenceDiagram
  participant Episode as "Episode DSL"
  participant Input as "Canonical input session"
  participant Lower as "X lowering"
  participant Core as "Headless runtime"
  participant State as "Canonical X state"
  participant Layout as "X layout projection"
  participant View as "X painters"
  participant Camera as "Camera"

  Episode->>Input: "structured post, reply, or outgoing DM input"
  Input-->>View: "live field value + device keyboard"
  Episode->>Lower: "typed submit event with explicit IDs and createdAt"
  Lower->>Lower: "validate owned payload"
  Lower->>Core: "runtime event"
  Core->>State: "strict reducer mutation"
  State->>Layout: "state + viewport + experience"
  Layout-->>View: "render window + exact entity rects"
  Layout-->>Camera: "semantic subjects from identical rects"
  View-->>Camera: "deterministic painted frame"
```

Input fields are public semantic IDs, not a shared `composer` string:

```text
post
tweet:{tweetId}:reply
thread:{threadId}:composer
```

The X DSL creates input sessions through the canonical episode builder. The screen reads that same session via `useInputField`, and the authored post/reply/DM event is the submit boundary. Manual draft jumps are reserved for intentionally prefilled or failed-draft states; they are not a typing animation mechanism.

## Domain scope

The package owns these complete flows:

- For You and Following timelines
- original post, reply, quote, repost, like, bookmark, share, and view metrics
- image grids, deterministic muted video frames, link cards, open/voted/expired polls, and sensitive-media covers
- conversation detail with oldest-first ancestors, focused post, stable nested descendants, authored scroll, and exact reply entity anchors
- compose and reply compose with weighted character counts, selection-aware drafts, growing input viewports, send, failure, and retry states; attachments remain authored on the submitted post
- notifications for likes, reposts, replies, follows, mentions, and verified activity
- profile header and Posts/Replies/Media/Likes tabs
- DM inbox, pinned/unread threads, outgoing versus incoming semantics, per-thread drafts, concurrent typing participants, replies, emoji reactions, unread rules, and sending/sent/delivered/read/failed delivery state

Search, Spaces, Communities, Premium purchase, full-screen media navigation, and live Grok responses are not implemented. The navigation chrome is a visual simulation, not a claim that every destination is authorable.

## Layout and anchor contract

All IDs are namespaced and entity-addressable:

```text
x.nav.primary
x.timeline.header
x.timeline.feed
x.tweet.conversation
x.post.{postId}
x.post.{postId}.author
x.post.{postId}.body
x.post.{postId}.media
x.post.{postId}.poll
x.post.{postId}.metrics
x.notification.{notificationId}
x.profile.{userId}.header
x.dm.{threadId}
x.dm.{threadId}.message.{messageId}
x.composer.editor
x.composer.actions
x.reply.composer
x.thread.typing
```

Legacy singleton names such as `tweet_card` and `dm_message_latest` are removed. Episode code targets semantic entity IDs through exported helpers, not raw DOM selectors.

Projection walks the ordered history and uses cached post/text measurements. Painting is windowed for feeds, conversations, DM threads, inboxes, notifications, and profiles. The headless tests cover 10,000 entities; browser timing must be measured separately.

## Accessibility and localization

- root uses `role="application"`, a localized name, `lang`, and `dir`
- navigation, action counts, verification, media, poll progress, and unread status expose localized labels
- minimum authored touch target is 44 logical pixels on iOS and 48 on Android
- body copy remains readable at the supported device widths without clipping
- English, Arabic, and Hindi are tested; RTL reverses directional composition without reversing time or numeric meaning
- number and date formatting use explicit locale and `UTC`; never host defaults

## Asset and audio policy

- curated episodes use checked-in, license-recorded media and a deliberately designed deterministic identity treatment when no approved portrait exists
- blurred, grey-disc, emoji, and broken-image avatar placeholders are forbidden
- every bundled asset is collected by the plugin and verified before render
- X owns semantic sound IDs for post send, DM send/receive, like, repost, and notification; generic `tap` is not the public contract
- audio playback is declared by plugin rules and episode data

## Proof matrix

Required before the package is complete:

| Area          | Proof                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------- |
| Strictness    | invalid snapshot, duplicate IDs, unknown references, missing timestamps, malformed event payloads |
| Runtime       | every event, navigation invariant, failure/retry, notification and DM unread behavior             |
| Layout        | exact entity rectangles, anchor absence, render-window bounds, narrow/wide device widths          |
| Experience    | iOS/Android × light/dim/lights-out × en/ar/hi                                                     |
| Accessibility | localized labels, roles, direction, contrast/touch-target token tests                             |
| Performance   | 10k-post timeline and 10k-message thread budget                                                   |
| Determinism   | arbitrary frame order and two fresh browser processes                                             |
| Visual        | reviewed flagship frames and approved golden matrix                                               |
| Episode       | one cinematic flagship, one exhaustive interaction matrix, and one native theme matrix            |

Golden images are added only after visual review. They prove an approved target, not merely repeatability.

## Definition of 10/10

X is complete only when:

1. no legacy X runtime field, route, selector, reducer repair, compatibility branch, or singleton anchor remains
2. every curated screen looks intentional with real content at close and wide camera scales
3. light, dim, and lights-out appearances hold across iOS and Android
4. keyboard, notifications, status bar, and safe areas feel like one device system
5. all important entities are independently camera-targetable
6. a cinematography-only episode edit requires no X component change
7. invalid content fails before rendering with an actionable stable error
8. long-feed and random-access proofs pass within the recorded budget
9. determinism and release gates pass on Node 22 or 24 through mise
10. the flagship render is good enough to be the public package demo without excuses

## Authoring the repaired flows

Within an X track callback, these methods use the existing authored IDs:

```ts
x.at("4s").setScroll("timeline", 320, undefined, 18);
x.at("5s").setScroll("timeline", 0, undefined, 0); // explicit cut
x.at("6s").markNotificationRead("launch-mention"); // app activity only
x.at("7s").markNotificationRead("launch-mention", 3); // OS record + authoritative app badge
```

The badge overload requires an existing OS notification with the same ID. Its count is explicit:
dismissal never means read, and visible notification cards are not the app's unread count.
Social notification taps route to the referenced post/profile and acknowledge only the selected
app activity. Background or locked DMs still increment unread even when X remembers that thread.

Media may include `durationSeconds`. Supply the actual duration when using normalized playback
progress; `setMediaPlayback(tweetId, "playing" | "paused" | "complete" | "idle", progress)`
uses the event frame as its playback origin. Without duration, playback starts from the beginning;
a poster is used only while idle. Video is muted: author audio separately.

Snapshot `postCharacterLimit` is `280` by default, or `25000` for an authored long-post account.
The composer uses the reference `twitter-text` parser for URL weights, NFC normalization, and
CJK, with Unicode grapheme segmentation for newer joined emoji that its older emoji table misses.
See [X character-count rules](https://docs.x.com/fundamentals/counting-characters).
The snapshot/post schema still permits long history independent of the composing account.

Polls expose choices before voting, percentages after voting, and final results after the authored
`endsAt`. Voting at or after expiry throws `X_POLL_ENDED`.

## Shared visual tokens and verification

`src/layout/tokens.ts` owns body/detail/message sizes, line heights, insets, avatar spacing, and
composer geometry. `experience/resolver.ts` selects platform, palette, accessibility preferences,
and those same tokens for both headless layout and painters. Existing light, dim, and lights-out
themes remain available. Loaded Inter/Roboto and Noto fallbacks replace unavailable system-font names.

Evidence and implementation paths for the audit fixes:

| Finding                            | Repair path                                                             | Runnable evidence                                                |
| ---------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Notification routing and unread    | adapter → lowered runtime route → reducer; explicit OS read interaction | `audit-regressions.test.ts`                                      |
| Text, attachments, camera, profile | shared measurement → projection → painter and semantic rectangles       | `audit-regressions.test.ts`, `layout.cinematic-subjects.test.ts` |
| Input, poll, motion                | input session → shared draft; authored clock/frame → projection         | `audit-regressions.test.ts`                                      |
| Long history                       | cached measurements → bounded visible rows                              | `long-feed-performance.test.ts`, browser probe                   |

The twelve audited defects are addressed as follows:

1. OS notifications emit runtime routes and distinguish social targets from DM threads.
2. Locked/background arrivals preserve unread; opening the activity tab no longer reads everything.
3. Glyph-based wrapping, scaled lines, reply labels, and full detail text share painter geometry.
4. Pinned Latin, Arabic, Devanagari, and Japanese fonts replace unavailable font names.
5. Authored video playback decodes video frames, including paused frames, instead of painting a poster.
6. Poll choices, votes, countdowns, and final results follow the authored clock; expired votes fail.
7. Quotes and primary attachments occupy separate measured slots; three-image grids and quoted media render.
8. Draft selection/caret and growing composers use the shared input session; counters use weighted text.
9. Semantic targets mirror in RTL, retain negative coordinates, and report offscreen visibility.
10. Profiles measure their content, show other authors' liked posts, and render media in a grid.
11. Routes retain outgoing content; scroll and arrivals interpolate by frame and respect reduced motion.
12. Profile, notification, inbox, and message rendering is windowed; text/post measurement is cached.

Recorded local Chromium checks (1080×1920, 1,000 injected history items): DM frames 480–539
had 16.8 ms p95, 22.3 ms maximum, and 227 DOM nodes; profile frames 1180–1209 had 16.8 ms
p95, 33.3 ms maximum, and 314 DOM nodes. Neither run reported shaped-text overflow or a frame
over 33.34 ms. These are machine-specific regression observations, not a universal FPS guarantee.
Notification-filter frames 280–319 stayed at 266 DOM nodes with no overflow: two fresh runs
measured 18.7/18.3 ms p95 and 21.2/20.5 ms maximum. An earlier run had an isolated 210.6 ms
frame at the filter change that did not recur; its cause is unconfirmed, so these checks do not
establish a worst-case latency guarantee.

Run from the repository root:

```bash
mise exec -- pnpm --filter @tokovo/apps-x test
mise exec -- pnpm --filter @tokovo/visual-system test
mise exec -- pnpm -s typecheck:solution
mise exec -- pnpm build:video
mise exec -- pnpm --filter @tokovo/render-service render --episode x-native-theme-matrix-vnext --profile review --job x-locales --start-frame 90 --end-frame 90
```

For actual Chromium timings, run from `apps/render-service`:

```bash
mise exec -- node --import tsx scripts/profile-ui.mjs x-cinematic-flagship 480 90
mise exec -- node --import tsx scripts/profile-ui.mjs x-cinematic-flagship 1180 30 1000
```

The probe rejects blank/error screens, overflowing shaped X lines, and unbounded X history DOM.
It measures sequential frame-to-ready latency, not live Player FPS. Do not run it alongside renders.
