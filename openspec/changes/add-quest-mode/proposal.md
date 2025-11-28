# Quest Mode Proposal

## Why
Current practice mode provides effective spaced repetition but lacks structured progression and visual feedback on word mastery across the entire word set. Users (children 5-9) need more engaging journey-based learning with clear visual indicators of which words they've mastered, which need work, and which are new.

## What Changes
- Add new Quest Mode as separate gameplay route (`/quests`) alongside existing practice mode
- Implement Chapter 1 (Easy): 10 words with preview step before testing
- Create Heatmap view (`/heatmap`) showing all words color-coded by success rate (red/amber/green)
- Add quest progression tracking and chapter completion storage
- Preserve existing practice mode unchanged (5 words per session)

## Impact
- **New capabilities**: Quest mode gameplay, heatmap visualization, chapter progression
- **Affected code**: New routes (`/quests`, `/heatmap`), new storage schema for quest progress, new components for quest UI and heatmap
- **No breaking changes**: Existing practice mode remains unchanged
- **Storage additions**: Quest chapter progress, quest session results stored alongside practice sessions
