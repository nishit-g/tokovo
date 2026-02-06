# WhatsApp Anchors (`app_whatsapp`)

WhatsApp anchors are emitted by the WhatsApp plugin's **layout semantic regions** and exposed through the plugin's anchor provider.

## Always Available
- `device`: full device rect
- `app`: full app rect

## Feed / Non-Chat (`viewMode = FEED`)
These are emitted by the WhatsApp FEED layout strategy.

- `tab_bar`: bottom tab bar region (only on tab-based screens: chats/status/calls/communities/settings)

Chats list:
- `chat_list_header`: chat list header (title/search/chips) + safe area
- `chat_list`: scrollable list region

Other tab screens:
- `status_header`, `status_list`
- `calls_header`, `calls_list`
- `communities_header`, `communities_list`

Profile:
- `profile_header`, `profile_content`

## Chat (`viewMode = CHAT`)
- `header`: sticky header region (includes safe area)
- `profile`: avatar region inside the header
- `input_area`: sticky input region
- `typing_indicator`: typing bubble region (only when typing is active)

Message-related:
- `lastMessage`: last visible message rect (derived from semantic message group)
- `message-0`, `message-1`, ...: message rects in visual order (derived)
- `<messageId>`: each message is also a semantic region id (message ID)

## Notes
- The provider also exposes aliases for camera fallbacks: `inputArea`, `typingIndicator`.
