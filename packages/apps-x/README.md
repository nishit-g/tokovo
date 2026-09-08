# `@tokovo/apps-x`

The X VNext runtime plugin for deterministic Tokovo episodes.

## Contract

- schema version 2 snapshots and views; invalid or frame-like timestamps fail before replay
- normalized users, posts, notifications, DM threads, and messages with explicit reference validation
- canonical keyboard input fields for posts, replies, and outgoing DMs; submitted text and painted text share one input session
- deterministic interaction lifecycles for post actions, polls, video, composer status, and DM delivery
- complete conversation projection with ancestors, focus, nested replies, route-local scrolling, and exact reply camera entities
- explicit incoming/outgoing DM events, concurrent typing users, message replies, reactions, unread rules, and sending/sent/delivered/read/failed states
- platform-aware iOS and Android metrics with native light, dim, and lights-out themes
- English, Arabic RTL, and Hindi localization
- bounded feed and thread projection for large authored datasets
- semantic and exact-entity camera subjects derived from the headless layout model
- semantic audio IDs and complete asset collection

The package does not migrate or repair V1 data. Repository-owned episodes must declare snapshot and view version 2. An installed app without authored data hydrates a canonical empty V2 state.

See [CINEMATIC_SUBJECTS.md](./CINEMATIC_SUBJECTS.md) for camera targets and `docs/X.md` for the
hard-cut package architecture.
