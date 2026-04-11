# Episodes Architecture

Tokovo episodes are pure definitions. They do not self-register at import time.

## Catalog profiles

- `release`: stories and approved v2 release episodes
- `studio`: release plus showcases and test episodes

## Runtime contract

- Runtimes must create an explicit `EpisodeRegistry`
- Plugin registration and catalog assembly must happen in shared bootstrap code
- Render-service and CLI validation should consume the same bootstrap path

## Release policy

- Test episodes are excluded from the release profile
- New production work should land in stories or v2 release catalogs
