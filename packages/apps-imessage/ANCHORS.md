# iMessage Anchors (`app_imessage`)

These anchors are emitted by the iMessage plugin's **layout semantic regions** and exposed through the plugin's anchor provider. Anchors are used by the cinematic camera DSL (`cam.focus(...)`, `cam.track(...)`).

## Always Available
- `device`: full device rect
- `app`: full app rect

## List (`viewMode = FEED`)
- `imessage_list_header`
- `imessage_list`

## Chat (`viewMode = CHAT`)
- `imessage_thread`
- `imessage_composer`

## Info / Media (`viewMode = FULLSCREEN`)
Info:
- `imessage_info`

Media:
- `imessage_media`

