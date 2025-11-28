# Quest Mode Design

## Context
Word Buddies currently uses spaced repetition for spelling practice (5 words/session). Users need structured progression with visual mastery tracking. Quest mode adds chapter-based learning with preview steps and multi-round review, while a heatmap provides overview of word mastery status.

## Goals / Non-Goals

### Goals
- Separate quest mode that coexists with practice mode
- Chapter 1 (easy): word preview → 10-word test → review with retries
- Heatmap showing all words color-coded by success rate
- Auto-advance to next chapter on completion (future: Chapters 2-3)
- Store quest progress independently from practice sessions

### Non-Goals
- Chapters 2 and 3 (deferred to future change)
- Changing existing practice mode (stays at 5 words)
- Server-side storage (remains client-side only)
- Multiplayer or leaderboard features

## Decisions

### Storage Schema
**Decision**: Add `questProgress` and `questSessions` to browser storage
- `questProgress`: `{ currentChapter: number, completedChapters: number[], chapterWordSets: Record<number, string[]> }`
- `questSessions`: Similar to `StoredSession` but with `sessionType: 'quest'` and `chapter: number`

**Rationale**: Isolates quest data from practice data while reusing session storage patterns

### Heatmap Color Thresholds
**Decision**: Initial thresholds based on success rate
- Green: ≥80% success rate
- Amber: 40-79% success rate  
- Red: <40% success rate or never attempted

**Rationale**: Aligns with existing mastery logic (80% = high performance, <40% = needs work)

**Open Question**: Should we use different criteria (e.g., consecutive correct attempts, recency)?

### Quest Word Selection
**Decision**: Randomly select 10 words from user's current difficulty level at chapter start
- Words stored in `chapterWordSets[chapterNumber]` for consistency across retries
- New word set generated on chapter restart

**Rationale**: Keeps implementation simple, ensures variety, aligns with existing word pool logic

### Quest Flow State Machine
**Decision**: Quest session phases
1. **Preview**: Show all 10 words (read-only, with audio playback)
2. **Practice**: Test each word (similar to existing practice mode)
3. **Review Round 1**: Show results with tick/cross, collect incorrect words
4. **Retry Round 1**: Test only incorrect words from Round 1
5. **Review Round 2**: Show results, collect still-incorrect words
6. **Retry Round 2**: Test remaining incorrect words
7. **Final Results**: Show all three lists, offer chapter completion or restart

**Rationale**: Matches user's request exactly, provides multiple learning opportunities per word

### Navigation Structure
**Decision**: Add quest mode to main navigation
- Home page: Add "🗺️ Quests" button alongside "✏️ Practice"
- Settings/menu: Add "🔥 Heatmap" link
- Quest results: Offer "Next Chapter" (when unlocked) or "Replay Chapter"

**Rationale**: Clear separation from practice mode, easy discoverability

## Risks / Trade-offs

### Risk: Storage Size Growth
- **Issue**: Quest sessions + word sets increase storage usage
- **Mitigation**: Limit stored quest sessions to most recent 20, reuse existing cleanup logic

### Risk: Heatmap Performance
- **Issue**: Calculating success rates for all words could be slow with large datasets
- **Mitigation**: Calculate on-demand, cache results, limit to attempted words only

### Trade-off: Word Set Consistency
- **Trade-off**: Fixed word sets per chapter vs. dynamic selection per attempt
- **Chosen**: Fixed word sets (stored in `chapterWordSets`)
- **Rationale**: Allows users to retry same chapter with same words for better learning

### Risk: UX Confusion
- **Issue**: Users might not understand quest vs. practice mode difference
- **Mitigation**: Clear labeling, onboarding tooltip/modal on first quest visit

## Migration Plan
No migration required (additive change only). Existing users:
- Continue using practice mode as before
- See quest mode as new option on home page
- Quest progress starts empty, chapters start at 1

## Open Questions
1. **Heatmap Display**: Grid layout vs. list layout vs. chart? (Initial: list sorted by success rate)
2. **Success Rate Calculation**: Include only recent attempts or all-time? (Initial: all-time)
3. **Chapter Unlock Logic**: Auto-unlock next chapter immediately or require explicit "Continue" action? (Initial: show completion screen, user clicks "Next Chapter")
4. **Audio for Preview**: Auto-play each word or manual play button? (Initial: manual play buttons like existing WordPlayer)
