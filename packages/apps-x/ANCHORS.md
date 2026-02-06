# X Anchors (`app_x`)

These anchors are emitted by the X plugin's **layout semantic regions** and exposed through the plugin's anchor provider. Anchors are used by the cinematic camera DSL (`cam.focus(...)`, `cam.track(...)`).

## Always Available
- `device`: full device rect
- `app`: full app rect
- `nav_bar`: bottom navigation bar

## Feed Screens (`viewMode = FEED`)
Timeline / profile:
- `timeline_header`
- `timeline_feed`
- `tweet_card`
- `metrics_row`
- `compose_fab`

Notifications:
- `timeline_header`
- `notifications_list`

Messages list:
- `timeline_header`
- `dm_thread`
- `compose_fab`

Tweet detail (still FEED in v1):
- `timeline_header`
- `tweet_card`
- `metrics_row`
- `reply_composer` (composer region near bottom)

## DM Thread (`viewMode = CHAT`)
- `dm_thread`
- `reply_composer`

## Compose (`viewMode = FULLSCREEN`)
- `reply_composer`

