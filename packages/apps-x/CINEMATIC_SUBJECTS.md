# X cinematic subjects (`app_x`)

X VNext projects versioned cinematic subjects from the same deterministic layout model used by the UI. Episode code targets meaning, never DOM coordinates or guessed render pixels.

## Stable semantic subjects

- application and navigation: `x.app`, `x.nav.primary`
- timeline: `x.timeline.header`, `x.timeline.tabs`, `x.timeline.feed`, `x.compose.fab`
- post detail: `x.tweet.header`, `x.tweet.conversation`, `x.reply.composer`
- notifications: `x.notifications.header`, `x.notifications.tabs`, `x.notifications.list`
- messages: `x.messages.header`, `x.messages.list`
- DM thread: `x.thread.header`, `x.thread.messages`, `x.thread.composer`, `x.thread.typing`
- profile: `x.profile.app-header`, `x.profile.tabs`, `x.profile.feed`
- compose: `x.compose.header`, `x.composer.editor`, `x.composer.audience`, `x.composer.actions`

Use `cameraSubject.semantic(deviceId, "app_x", subjectId)` for these stable surfaces.

## Exact entity subjects

Use `cameraSubject.entity(deviceId, "app_x", entityType, entityId, region)` when the shot must follow a specific authored entity.

| Entity type    | Regions                                                               |
| -------------- | --------------------------------------------------------------------- |
| `tweet`        | `card`, `author`, `body`, `media`, `poll`, `quote`, `link`, `metrics` |
| `notification` | `row`                                                                 |
| `profile`      | `header`, `banner`, `avatar`                                          |
| `dm-thread`    | `row`                                                                 |
| `message`      | `bubble`                                                              |

Projection coordinates are app-logical. Missing subjects remain missing and must be handled by an explicit shot fallback. There are no singleton aliases such as `tweet_card` or `dm_message_latest`.
