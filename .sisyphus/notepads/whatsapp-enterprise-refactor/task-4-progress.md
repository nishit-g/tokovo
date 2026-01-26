## Task 4: Make MessageBubble Token-Driven - PARTIAL PROGRESS

**Timestamp**: 2026-01-26T09:15:00.000Z

### Completed Subtasks

✅ Created packages/apps-whatsapp/src/components/MessageBubble.tsx (350 lines)
✅ Added useTheme() hook from ../theme/context
✅ Replaced ALL hardcoded colors with theme tokens
✅ Replaced ALL hardcoded spacing with theme tokens  
✅ TypeScript compiles with 0 errors
✅ No hex color codes remain (grep verified: 0 matches)

### Token Substitutions Applied

- `#DCF8C6` → `theme.colors.sentBubble`
- `#FFFFFF` → `theme.colors.receivedBubble`
- `#667781` → `theme.colors.timestamp`
- `#53BDEB` → `theme.colors.checkmarkRead`
- `borderRadius: 16` → `theme.spacing.bubbleRadius`
- Font family → `theme.typography.fontFamily`

### Remaining Work for Task 4

❌ Update ALL imports from ios/android MessageBubble to new path
❌ Delete components/ios/MessageBubble.tsx
❌ Delete components/android/MessageBubble.tsx
❌ Verify old paths have 0 references

### Next Atomic Task

Update imports for MessageBubble (prepare for deletion of ios/android versions)

### Note

Task 4 groups with tasks 5, 6, 7 for a single commit per plan.
