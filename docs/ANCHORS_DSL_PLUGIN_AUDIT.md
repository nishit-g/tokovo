# Tokovo Anchors, DSLs, and Plugin Surface Audit

Last updated: 2026-02-05  
Scope: `app_whatsapp`, `app_x`, `app_imessage`, camera + notification integration

## 1) Canonical Anchor Inventory

### 1.1 WhatsApp (`app_whatsapp`)

Source of truth:
- Runtime semantic anchors: `packages/apps-whatsapp/src/layout/chat.ts`
- Provider/framing: `packages/renderer/src/anchor-providers/whatsapp.ts`

Always available anchors:
- `device`
- `app`
- `content` (computed from visible message bounds)
- `header`
- `profile`
- `input_area` (alias: `inputArea`)
- `typing_indicator` (alias: `typingIndicator`)
- `lastMessage` (when at least one message exists)
- `message-N` (indexed visible messages from semantic group)

Per-message semantic region IDs:
- Message IDs from conversation state (stable IDs from runtime)

Framing keys (camera composition defaults):
- `message`
- `message_me`
- `message_other`
- `lastMessage`
- `typingIndicator`
- `inputArea`
- `header`
- `profile`
- `content`
- `app`
- `device`

### 1.2 X (`app_x`)

Source of truth:
- Plugin framing definitions: `packages/apps-x/src/runtime/adapters/anchors.ts`
- Runtime provider used by renderer: `packages/renderer/src/anchor-providers/x.ts`

Anchors:
- `device`
- `app`
- `nav_bar`
- `timeline_header`
- `timeline_feed`
- `tweet_card`
- `metrics_row`
- `reply_composer`
- `compose_fab`
- `profile_header`
- `notifications_list`
- `dm_thread`

Screen-aware availability (`currentScreen`):
- `timeline`: `timeline_header`, `timeline_feed`, `tweet_card`, `metrics_row`, `compose_fab`
- `tweet`: `tweet_card`, `metrics_row`, `reply_composer`
- `compose`: `reply_composer`
- `profile`: `profile_header`, `timeline_feed`
- `notifications`: `timeline_header`, `notifications_list`
- `messages`: `timeline_header`, `dm_thread`, `compose_fab`
- `thread`: `dm_thread`, `reply_composer`

### 1.3 iMessage (`app_imessage`)

Source of truth:
- Plugin framing definitions: `packages/apps-imessage/src/runtime/adapters/anchors.ts`
- Runtime provider used by renderer: `packages/renderer/src/anchor-providers/imessage.ts`

Anchors:
- `device`
- `app`
- `imessage_list_header`
- `imessage_list`
- `imessage_thread`
- `imessage_composer`
- `imessage_info`
- `imessage_media`

Screen-aware availability (`currentScreen`):
- `list`: `imessage_list_header`, `imessage_list`
- `chat`: `imessage_list_header`, `imessage_thread`, `imessage_composer`
- `info`: `imessage_info`
- `media`: `imessage_media`

### 1.4 Notification Overlay (`app_notification`)

Source: `packages/renderer/src/anchor-providers/notification.ts`

Anchors:
- `headsUpNotification` (if active banner exists)
- `dynamicIsland` (if device profile exposes it)
- `device`

## 2) DSL Surface Inventory

## 2.1 Camera DSL (`@tokovo/dsl`)

Source: `packages/dsl/src/v2/camera-track.ts`

Point API (`cam.at(...)`):
- `set({ x, y, scale, rotation, originX, originY })`
- `zoom(scale | { scale, duration?, easing?, originX?, originY? })`
- `pan(x, y, duration?, easing?)`
- `pan({ x, y, duration?, easing? })`
- `animate({ x?, y?, scale?, rotation?, originX?, originY?, duration, easing? })`
- `focus(anchorId, { scale?, padding?, duration?, easing? })`
- `shake({ intensityX, intensityY, frequency?, decay?, duration })`
- `shake(intensity, duration?)`
- `reset({ duration?, easing?, spring? })`
- `punchZoom({ intensity?, direction?, duration?, spring? })`
- `dutchTilt({ angle, duration?, spring? })`
- `flash({ color?, intensity?, duration? })`
- `whipPan({ direction, blur?, duration? })`

Span API (`cam.span(start, end)`):
- `track(anchorId, { scale?, smoothing?, deadZonePx?, maxVelocityPxPerSec?, predictiveLookaheadFrames? })`
- `trackCinematic(anchorId, overrides?)`
- `trackDrama(anchorId, overrides?)`
- `trackFastBeat(anchorId, overrides?)`
- `trackCalm(anchorId, overrides?)`

Note:
- Camera V1 only accepts `smoothing` (breaking change; `lag` removed).

## 2.2 WhatsApp DSL (`@tokovo/apps-whatsapp`)

Source: `packages/apps-whatsapp/src/dsl/track-builder.ts`

Point builder (`wa.at(...)`):
- `receive`, `send`
- `receiveCall`, `sendCall`
- `encryptionNotice`
- `receiveImage`, `sendImage`
- `receiveVideo`, `sendVideo`
- `receiveVoice`, `sendVoice`
- `receiveGif`, `sendGif`
- `receiveSticker`, `sendSticker`
- `receiveDocument`, `sendDocument`
- `receiveContact`, `sendContact`
- `receiveLocation`, `sendLocation`
- `react`, `read`
- `forward`, `deleteMessage`, `editMessage`

Span builder (`wa.span(...)`):
- `typing(actor?)`

Track-level helpers (`WhatsAppTrackBuilder`):
- Timeline: `at`, `span`, `pause`, `now`
- Navigation: `switchTo`, `openChatList`, `openStatus`, `openCalls`, `openCommunities`, `openSettings`, `goBack`, `openProfile`, `openChat`
- Messaging chain helpers: `receive`, `send`, `typing`, `reply`
- Extras: `dateSeparator`, `encryptionNotice`, media/document/contact/location/reactions/read/forward/edit variants

Group operations DSL:
- Source: `packages/apps-whatsapp/src/dsl/group-builder.ts`
- Includes member add/remove/admin/leave and group info update flows

## 2.3 X DSL (`@tokovo/apps-x`)

Source: `packages/apps-x/src/dsl/index.ts`

Point builder (`x.at(...)`):
- User/social: `createUser`, `setCurrentUser`, `followUser`, `unfollowUser`
- Tweets: `postTweet`, `replyTweet`, `quoteTweet`, `repostTweet`, `likeTweet`, `viewTweet`, `bookmarkTweet`, `shareTweet`
- Navigation/state: `navigate`, `goBack`, `setComposeDraft`, `setNotificationsTab`, `setThemeMode`
- Notifications/messages: `addNotification`, `createThread`, `sendMessage`

Track builder (`XTrackBuilder`):
- `at`, `span`, `seed`

## 2.4 iMessage DSL (`@tokovo/apps-imessage`)

Source: `packages/apps-imessage/src/dsl/track-builder.ts`

Point builder (`im.at(...)`):
- Conversation: `createConversation`, `updateConversation`, `openConversation`
- Messaging: `sendMessage`, `receiveMessage`, `send`, `receive`, `sendMedia`, `receiveMedia`
- Typing/read/status: `typing`, `typingStart`, `typingEnd`, `read`, `setMessageStatus`
- Message ops: `editMessage`, `deleteMessage`, `unsend`, `tapback`, `removeTapback`
- Group ops: `addGroupMember`, `removeGroupMember`, `changeGroupName`, `changeGroupAvatar`
- UI state: `setScreen`, `setDraft`, `clearDraft`, `setThemeMode`, `search`, `clearSearch`, `screenEffect`
- Rich send: `sendWithEffect`, `sendLink`, `sendAudio`, `sendContact`, `sendCalendar`

Track builder (`IMessageTrackBuilder`):
- `at`, `span`, `openConversation`, convenience messaging methods, `getEvents`

## 3) Plugin Surface Inventory (Runtime Contracts)

### 3.1 WhatsApp plugin

Source: `packages/apps-whatsapp/src/plugin.ts`

- Plugin id: `app_whatsapp`
- Includes: reducer, views, initial state, v2 lowering, layouts, audio rules, DSL, behaviors, anchor framing contract
- Event kinds include: messaging, typing, media, reactions, reads, group operations, navigation, drafts, voice events

### 3.2 X plugin

Source: `packages/apps-x/src/plugin.ts`

- Plugin id: `app_x`
- Includes: reducer, views, initial state, lowering, layouts, anchors
- Event kinds include: user/tweet/social actions, compose/navigation, notifications, DM thread/message

### 3.3 iMessage plugin

Source: `packages/apps-imessage/src/plugin.ts`

- Plugin id: `app_imessage`
- Includes: reducer, views, initial state, lowering, layouts, audio rules, anchors
- Event kinds include: conversation ops, message ops, tapbacks, typing, group edits, screen/draft/media events

## 4) Brutal Logic Review (Findings)

Resolved in this pass:
1. Anchor registration bug (high): plugin anchor registration only retained one anchor per app (last provider key).  
   Fix: register one provider per app that computes all anchors and merges framing.  
   File: `packages/react/src/plugin/plugin.ts`

2. Missing runtime anchors for X/iMessage (high): framing existed but no usable runtime snapshots for camera focus in renderer.  
   Fix: add renderer anchor providers for X and iMessage and register them with built-ins.  
   Files: `packages/renderer/src/anchor-providers/x.ts`, `packages/renderer/src/anchor-providers/imessage.ts`, `packages/renderer/src/anchor-providers/registry.ts`

3. Tennis camera reset jerkiness (high UX): fluid tennis behavior injected reset events that caused hard snap-outs between turns.  
   Fix: remove reset choreography, keep continuous focus + burst animation, and return from notification focus using semantic re-focus instead of reset.  
   File: `packages/device-camera/src/director/behaviors.ts`

4. Track lag option mismatch (medium): DSL emits `lag`, reducer only read `smoothing`.  
   Fix: reducer accepts both.  
   File: `packages/device-camera/src/reducer/index.ts`

5. Device camera anchor API compatibility break (medium): legacy helper exports were missing after registry refactor (`clearAnchorProviders` etc).  
   Fix: restore compatibility wrappers over a singleton registry while still supporting explicit registry usage.  
   File: `packages/device-camera/src/anchors/registry.ts`

6. Camera director anchor target fragility (medium): compiler plugin generated synthetic `message-N` anchors that may drift vs runtime availability.  
   Fix: use stable semantic target `lastMessage` for message events.  
   File: `packages/compiler/src/plugins/camera-director.plugin.ts`

Open caveat:
- `@tokovo/device-camera` tests currently include historical expectations that conflict with persistent-effect behavior and prior API changes. See test output section below.

## 5) Episode Production Guidance (Anchor-Safe Camera)

For WhatsApp episodes and group chat tennis style:
- Prefer long `track("lastMessage")` spans instead of repetitive `focus + reset`.
- Layer short spans for `typingIndicator` and `inputArea` during those interactions.
- For notifications: quick `focus("headsUpNotification")`, then `focus("lastMessage")` return, not `reset`.
- Keep scale in `1.06` to `1.2` for readability.
- Keep smoothing/lag around `0.16` to `0.28` for organic follow.

Reference implementation:
- `packages/episodes/src/showcases/tennis-group-organic.episode.ts`

## 6) Validation Snapshot

Commands run:
- `pnpm --filter @tokovo/dsl build` (pass)
- `pnpm --filter @tokovo/apps-whatsapp build` (pass)
- `pnpm --filter @tokovo/apps-imessage build` (pass)
- `pnpm --filter @tokovo/apps-x build` (pass)
- `pnpm --filter @tokovo/device-camera test` (failing; pre-existing suite drift + API expectation drift)

Observed failing areas in camera tests:
- missing legacy helpers before this patch (`clearAnchorProviders`) in anchor tests
- processor persistence expectation mismatch (test expects neutral after effect end, implementation intentionally persists completed effects for cinematic continuity)
