# Quest Mode Redesign Plan

## Overview
Restructure Quest Mode so chapters represent **study method difficulty**, not word difficulty. All users see the same word pool (based on year group), but practice them in progressively harder ways.

---

## 1. Chapter Structure Changes

### Chapter Definitions
- **Chapter 1: Preview Mode** (Easiest)
  - Show all 10 words with spellings + audio before testing
  - Current implementation (preview phase)
  
- **Chapter 2: Listen & Spell** (Medium)
  - No preview - straight to testing
  - Hear word → spell it
  - Can replay word as needed
  
- **Chapter 3: Challenge Mode** (Hardest)
  - No preview
  - Time pressure per word (e.g., 30 seconds each)
  - Don't see if correct/incorrect until end of round
  - Only hear word once (no replay button)

### Word Pools by Year Group
- Year 1 setting → All 3 chapters use Year 1 words only (45 words)
- Year 2 setting → All 3 chapters use Year 1+2 words (110 words)
- Year 3/4 setting → All 3 chapters use all words (210 words)

---

## 2. Mastery System Implementation

### Database Schema Updates
- [x] Add `masteryLevel` field (0-5) to StoredWord
- [x] Add `consecutiveCorrect` field to StoredWord
- [ ] Database migration to add new fields to existing words

### Core Logic
- [x] Created `mastery-system.ts` with level calculation
- [ ] Integrate `updateWordMastery()` into word attempt tracking
- [ ] Update `client-spelling-logic.ts` to use new mastery system
- [ ] Update `client-quest-logic.ts` to track mastery per word

### Spaced Repetition Integration
- [ ] Use `masteryLevel` to calculate `nextReview` dates
- [ ] Prioritize Level 0-2 words in quest selection
- [ ] Only select Level 3+ words if due for review

### Response Time Mastery Bonus (Chapter 3 Only)
- [ ] Track `responseTime` in milliseconds per word attempt
- [ ] Mastery calculation with time bonus:
  - **Fast (< 5s) + Correct**: +1.5 levels (rounds up)
  - **Medium (5-8s) + Correct**: +1 level (normal)
  - **Slow (> 8s) + Correct**: +0.5 levels (rounds down)
  - **Timeout (> 10s)**: Counts as incorrect, -2 levels
- [ ] Only apply time bonus in Chapter 3 (Chapters 1 & 2 are normal mastery)

---

## 3. Quest Flow Changes

### Quest Generation
- [ ] Remove cached `chapterWordSets` per chapter
- [ ] Generate fresh 10-word selection each quest using mastery priority:
  1. Level 0 words (never attempted)
  2. Level 1-2 words (building confidence)
  3. Level 3-4 words due for review
  4. Random Level 5 words for maintenance

### Quest Completion
- [ ] Remove "Chapter Complete" state
- [ ] Add "Quest Complete - Start New Quest" button
- [ ] Track quest history (optional: "Quest 1, Quest 2, Quest 3...")
- [ ] Allow infinite quests per chapter

### Round System (All Chapters)
- [ ] Keep 3-round retry system for incorrect words
- [x] Fixed round results to show cumulative progress
- [ ] Show level-up/down feedback after each word

---

## 4. Progress Tracking

### Global Mastery Tracking
- [ ] Track mastery across all chapters (not per-chapter)
- [ ] Display: "45/210 words mastered (21%)"
- [ ] Show breakdown by level in progress view

### Chapter Unlocking
- [ ] Chapters must be completed in order (1 → 2 → 3)
- [ ] Chapter unlocks when previous chapter reaches mastery threshold
- [ ] Show "Recommended for Year X" badge on appropriate chapter
- [ ] Lock icon on unavailable chapters

### Heatmap Updates
- [ ] Update colors to show 6 mastery levels (not 3)
- [ ] Add level indicator on each word tile
- [ ] Filter by mastery level (show only red, yellow, etc.)
- [ ] Show days until next review per word

---

## 5. UI/UX Components

### Tutorial System
- [x] Created MasteryTutorial component (5 slides)
- [ ] Show on first visit to Quest Mode
- [ ] Save "hasSeenTutorial" flag in UserSettings
- [ ] Add "Replay Tutorial" button in settings

### Help System
- [x] Created MasteryHelpModal component
- [ ] Add "?" help icon to Quest page header
- [ ] Add "?" help icon to Heatmap page header
- [ ] Add "?" help icon to Quests list page

### Level-Up Feedback (In-Quest)
- [x] Created getLevelUpMessage() function
- [ ] Show animated level-up notification after each word
- [ ] Display new level with color/emoji
- [ ] Celebrate reaching Level 5 (MASTERED!)

### Quest List Page Updates
- [ ] Remove individual chapter tiles
- [ ] Show 3 chapter cards with descriptions:
  - "Chapter 1: Preview Mode - See the words first"
  - "Chapter 2: Listen & Spell - No preview!"
  - "Chapter 3: Challenge Mode - Beat the clock!"
- [ ] Show global mastery % at top
- [ ] Add "Start New Quest" button per chapter
- [ ] Remove "Quest 1, Quest 2" tracking (or make optional)

---

## 6. Chapter-Specific Implementation

### Chapter 1: Preview Mode (Current)
- [x] Preview phase shows all words with audio
- [x] Practice phase tests words
- [x] Review shows results per round
- [ ] Add mastery level feedback

### Chapter 2: Listen & Spell (NEW)
- [ ] Skip preview phase entirely
- [ ] Go straight to practice phase
- [ ] Keep WordPlayer with replay button
- [ ] Same 3-round retry system
- [ ] Add mastery level feedback

### Chapter 3: Challenge Mode (NEW)
- [ ] Skip preview phase
- [ ] Add countdown timer per word (10 seconds)
- [ ] Hide WordPlayer replay button (hear once only)
- [ ] Don't show correct/incorrect until review phase
- [ ] Show all results at end of round (suspense!)
- [ ] Track response time per word
- [ ] **Factor response time into mastery calculation:**
  - Fast response (< 5s) + correct = bonus mastery points
  - Slow response (> 8s) + correct = normal mastery
  - Timeout = counts as incorrect
- [ ] Add mastery level feedback

---

## 7. Data Migration & Cleanup

### Database Upgrades
- [ ] Upgrade to DB version 3
- [ ] Add `masteryLevel: 0` and `consecutiveCorrect: 0` to all existing words
- [ ] Optionally calculate initial mastery from existing `correctAttempts`/`attempts`

### QuestProgress Cleanup
- [ ] Clear cached `chapterWordSets` (no longer needed)
- [ ] Remove `completedChapters` array (chapters don't "complete")
- [ ] Keep `currentChapter` as "last played chapter" (optional)

---

## 8. Testing Checklist

### Mastery System
- [ ] Correct answer increments level (+1)
- [ ] Wrong answer decrements level (-2, min 0)
- [ ] Level 5 reached after 5 consecutive correct
- [ ] nextReview dates calculated correctly
- [ ] Heatmap colors match mastery levels

### Quest Generation
- [ ] Words selected by mastery priority
- [ ] Each quest generates fresh 10 words
- [ ] No duplicate words in same quest
- [ ] Respects year group word pool
- [ ] All 3 chapters use same word pool

### Chapter Behaviors
- [ ] Chapter 1: Preview works correctly
- [ ] Chapter 2: No preview, straight to practice
- [ ] Chapter 3: Timer works, no replay, results hidden

### Round System
- [ ] Round 1 results accurate
- [ ] Round 2+ shows cumulative results (not just current round)
- [ ] Level-up messages appear after each word
- [ ] Quest complete button appears after max 3 rounds

### Tutorial & Help
- [ ] Tutorial shows on first visit
- [ ] Tutorial skippable
- [ ] Help modal accessible via "?" button
- [ ] Tutorial replay available in settings

---

## 9. Implementation Order

### Phase 1: Core Mastery System (Do First)
1. [ ] Database migration (add masteryLevel, consecutiveCorrect)
2. [ ] Integrate updateWordMastery() into quest logic
3. [ ] Update heatmap to show 6-level colors
4. [ ] Test mastery level progression

### Phase 2: Tutorial & Help (Quick Win)
5. [ ] Add tutorial trigger on first quest visit
6. [ ] Add "?" help icons to pages
7. [ ] Test tutorial flow

### Phase 3: Quest Generation (Medium)
8. [ ] Remove cached chapterWordSets
9. [ ] Implement fresh quest generation per chapter
10. [ ] Add "Start New Quest" button
11. [ ] Test quest generation logic

### Phase 4: Chapter 2 & 3 (New Features) - BUILD ALL 3 TOGETHER
12. [ ] Implement Chapter 2 (no preview)
13. [ ] Implement Chapter 3 (10s timer + challenge mode + response time tracking)
14. [ ] Add chapter progression locks (must complete in order)
15. [ ] Update quest list page UI with lock icons
16. [ ] Add "Recommended for Year X" badges
17. [ ] Test all 3 chapters and progression flow

### Phase 5: Polish & Testing
18. [ ] Add level-up animations
19. [ ] Add global mastery progress display
20. [ ] Add mastery celebration at milestones
21. [ ] Full end-to-end testing

---

## 10. Decisions Made ✅

1. **Quest naming**: Just "Start New Quest" button (no numbering)

2. **Chapter progression**: MUST work through chapters in order (1 → 2 → 3)
   - Show "Recommended for Year X" badge
   - Lock chapters until previous one reaches mastery threshold

3. **Timer duration (Ch3)**: 10 seconds per word
   - Track response time
   - Use response time in mastery calculation (fast = bonus)

4. **Mastery celebration**: To be determined later

5. **Word selection**: Same pool across all chapters (method difficulty, not word difficulty)

6. **Implementation approach**: Option B - Build all 3 chapters simultaneously

---

## Success Metrics

- Users complete quests in all 3 chapters
- Mastery levels progress over time (words go from red → green)
- Users replay chapters for different challenge levels
- Tutorial completion rate > 80%
- Year 4 students engage with Chapter 1 (not bored by Year 1 words)

---

## Next Steps - READY TO BUILD! 🚀

**Implementation Approach: Option B (Build All 3 Chapters)**

Starting order:
1. Phase 1: Core Mastery System (foundation)
2. Phase 2: Tutorial & Help (quick wins)
3. Phase 4: All 3 Chapters + Progression Locks (parallel build)
4. Phase 3: Quest Generation (integrate with chapters)
5. Phase 5: Polish & Testing

Ready to start with Phase 1! 🎯
