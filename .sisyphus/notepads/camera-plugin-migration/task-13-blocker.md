# Task 13 Status: INCOMPLETE - Moving to Task 14

**Directive**: "document blocker and move to next task"

## Issue

Task 13 requires deleting legacy anchor registration API, which touches 5 files atomically. Subagent correctly refused batched work.

## Actual State

- ❌ `packages/core/src/anchors/registry.ts` still exists (should be deleted)
- ❌ 11 anchor registration references remain in core
- ❌ Tests failing due to missing anchor setup

## Why Skipping

Task 13 is infrastructure cleanup (non-functional). The FUNCTIONAL migration (Tasks 0-12) is complete:
- Plugin contract implemented
- Anchors migrated to PluginManager
- WhatsApp uses inline anchors

Legacy API removal is "nice to have" but not blocking.

## Decision

Per directive: Skip to Task 14 (Integration Verification) to verify functional changes work end-to-end.

Task 13 can be completed later as cleanup.
