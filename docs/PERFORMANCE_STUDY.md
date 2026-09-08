# Performance study: Wrong Chat

This is a visual correction study, not a finished series pilot or evidence of audience demand.

## What failed in Ping Sent It

The phone occupied most of the image while sparse messages sat at the bottom. Three performers competed with reading and looked detached from the device. The low-resolution pet sprite did not match the other character art. Every pose faded and scaled in again, making the performer disappear at emotional transitions. Passing render checks did not establish entertainment quality.

## The correction to test

Reuse the high-resolution orange human/creature character. Use one held composition, cream surfaces, orange outgoing bubbles, plain wallpaper, and readable messages near the top. Give the character substantial space beside the phone. Leave a reading interval between a reply and the character's reaction. Keep poses opaque at their boundaries. Finish with a deliberate duck out of frame.

The nine-second scene starts with a meeting complaint in the work chat. At 2.1 seconds the manager replies, “You're presenting it.” The performer reacts at 3 seconds, deletes the complaint at 4.5 seconds, and receives “Screenshot saved.” at 6 seconds. The attempted exit begins at 6.8 seconds.

## Actual implementation

- Episode: `packages/episodes/src/stories/ping-wrong-chat.episode.ts`.
- App theme: `whatsapp-coral-studio`; app-owned cream/coral tokens and top-aligned short conversations. Existing themes retain their alignment.
- Performer data: `widthPct` controls screen size independently of intensity; `flipX` directs the gaze toward the phone; `performerMotion: "duck"` moves the image downward over its authored span. Existing performers no longer automatically fade or scale between poses.
- Text and deleted-message geometry now derives from theme metrics in both the renderer and headless layout. Top-aligned camera subjects use the same placement as the visible thread.
- Deleted messages are measured using their localized visible label rather than empty source text; the original deleted content stays absent.
- Existing generated character fixtures are reused. No additional dependencies or assets.

## Honest limits

This uses two illustrated poses and a translated exit. It is not skeletal animation, lip sync, or a character gripping the phone. Those require aligned expression/hand assets or a rig. The neutral and panic source poses have different body framing; inspect their transition at full size before accepting it.

Voice quality remains unresolved. This study uses the existing app message cues so composition and reaction timing can be judged without another synthetic voice pass. Review the result muted first, then with sound. A successful render is not a quality verdict.
