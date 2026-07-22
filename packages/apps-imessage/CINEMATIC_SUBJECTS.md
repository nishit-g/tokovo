# iMessage cinematic subjects (`app_imessage`)

iMessage projects these versioned subjects from the same canonical headless layout used to render
the app. They are app-logical rectangles and never depend on DOM measurement.

- list: `imessage_list_header`, `imessage_list`
- chat: `imessage_chat_header`, `imessage_thread`, `imessage_last_message`,
  `imessage_composer`, `imessage_input`
- fullscreen media: `imessage_media`

Use `cameraSubject.semantic(deviceId, "app_imessage", subjectId)`. A requested subject that is not
present in the current view follows the shot's explicit missing-subject policy.
