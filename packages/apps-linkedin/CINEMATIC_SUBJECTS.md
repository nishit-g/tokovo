# LinkedIn cinematic subjects (`app_linkedin`)

LinkedIn projects these versioned subjects from canonical headless layouts:

- navigation and lists: `li_nav_bar`, `li_header`, `li_feed`, `li_notifications_list`,
  `li_messages_list`
- focused content: `li_post_focus`, `li_post_detail`, `li_profile_header`
- messaging: `li_dm_header`, `li_dm_thread`, `li_dm_focus_message`, `li_dm_composer`
- creation: `li_comment_composer`, `li_compose_sheet`

Use `cameraSubject.semantic(deviceId, "app_linkedin", subjectId)`. Geometry is app-logical and
missing subjects are never replaced with guessed rectangles.
