# WhatsApp semantic anchors (`app_whatsapp`)

WhatsApp camera targets come from the headless layout strategies. They do not depend on DOM queries or render-pixel guesses.

## Global

- `device`: complete logical device viewport
- `app`: complete WhatsApp surface
- `tab_bar`: bottom navigation on tab screens

## Chats

- `chat_list_header`, `chat_list`, `archived_row`
- `chat_row_<conversationId>`
- `chat_row_<conversationId>_avatar`
- `chat_row_<conversationId>_title`
- `chat_row_<conversationId>_preview`

## Updates

- `updates_header`, `updates_list`, `updates_status_strip`, `updates_channels`
- `updates_status_<authorId>`
- `channel_row_<channelId>` with `_avatar`, `_text`, and `_cta` fragments

## Calls, communities, and settings

- `calls_header`, `calls_list`, `calls_link`, `call_row_<callId>`
- `communities_header`, `communities_list`, `communities_new`, `community_<communityId>`
- `settings_header`, `settings_list`, `settings_search`, `settings_profile`
- `settings_account`, `settings_privacy`, `settings_avatar`, `settings_chats`, `settings_notifications`, `settings_storage`, `settings_linked_devices`, `settings_help`, `settings_invite`

## Contact and group information

- `profile_header`, `profile_content`, `profile_hero`, `profile_actions`
- `group_info_header`, `group_info_content`, `group_info_hero`, `group_info_actions`, `group_info_members`
- `group_member_<memberId>`

## Chat thread

- `header`, `profile`, `chat_thread`, `chat_content`, `chat_list`, `input_area`
- `typing_indicator` while a remote participant is typing
- `reply_composer` while swipe-to-reply has selected a message
- `message_actions` while a completed long press exposes message actions
- `media_viewer`, `media_viewer_header`, `media_viewer_content`, and `media_viewer_caption`
- `status_viewer`, `status_progress`, `status_content`, and `status_reply`
- `<messageId>` for every visible message
- `reply_<messageId>`, `media_<messageId>`, and `reactions_<messageId>` for message fragments
- `lastMessage`, `lastMedia`, and `lastReply` as explicit dynamic selectors

Message IDs are the stable authoring contract. Positional anchors such as `message-0` and compatibility aliases such as `message_thread`, `status_row`, and `inputArea` are intentionally unsupported. Missing authored anchors fail camera resolution instead of falling back to guessed DOM geometry.

Long threads retain the complete authored history in headless state while the React tree mounts a deterministic window of at most 120 messages. Opening an unread conversation centers its stable first-unread ID; a newly authored message returns the viewport to the latest window.
