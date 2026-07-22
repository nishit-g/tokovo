# X cinematic subjects (`app_x`)

X projects these versioned subjects from canonical headless layouts:

- navigation and feed: `nav_bar`, `timeline_header`, `timeline_feed`, `tweet_card`, `metrics_row`
- focused timeline content: `timeline_primary_content`, `timeline_primary_media`,
  `timeline_primary_actions`
- detail: `tweet_detail_header`, `tweet_detail_body`, `tweet_detail_media`, `reply_composer`
- messages: `thread_header`, `dm_thread`, `dm_message_latest`
- other surfaces: `notifications_list`, `profile_header`, `compose_fab`, `compose_editor`

Use `cameraSubject.semantic(deviceId, "app_x", subjectId)`. Geometry is app-logical and missing
subjects are never replaced with guessed rectangles.
