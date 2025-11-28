# Quest Mode Redesign - Task Breakdown

## Phase 1: Core Mastery System (DO FIRST)

### Task 1.1: Database Schema Update ✅
- [x] Add `responseTime?: number` to `StoredWordAttempt` type
- [x] Upgrade database version to 3
- [x] Add migration logic to set `masteryLevel: 0` and `consecutiveCorrect: 0` on existing words
- [x] Test database upgrade on existing data

### Task 1.2: Mastery Logic Integration ✅
- [x] Update `client-spelling-logic.ts`:
  - [x] Import and use `updateWordMastery()` from mastery-system
  - [x] Replace current word stat updates with mastery calculations
  - [x] Preserve backward compatibility with existing sessions
- [x] Update `client-quest-logic.ts`:
  - [x] Use mastery system in `getWordHeatmapData()`
  - [x] Return mastery level and 6-level status data
  - [x] Track responseTime support for future Chapter 3

### Task 1.3: Heatmap Visual Updates ✅
- [x] Update `src/app/heatmap/page.tsx`:
  - [x] Change from 4 status types to 6 mastery levels (0-5)
  - [x] Use mastery level colors (red → light yellow → yellow → orange → light green → dark green)
  - [x] Show mastery level number on each word tile
  - [x] Update stats display to show all 6 levels
  - [x] Update filter buttons for 6 levels

### Task 1.4: Test Mastery Progression
- [ ] Test correct answer increments level (+1)
- [ ] Test incorrect answer drops level (-2, min 0)
- [ ] Test reaching Level 5 (mastered)
- [ ] Test nextReview date calculations
- [ ] Verify heatmap colors match levels

---

## Phase 2: Tutorial & Help System (QUICK WIN) ✅

### Task 2.1: Tutorial Integration ✅
- [x] Add `hasSeenMasteryTutorial?: boolean` to UserSettings
- [x] Update `src/app/quests/page.tsx`:
  - [x] Check if user has seen tutorial
  - [x] Show MasteryTutorial on first visit
  - [x] Save flag after completion
- [x] Test tutorial flow

### Task 2.2: Help Icons ✅
- [x] Add help icon to Quest list page (`src/app/quests/page.tsx`)
- [x] Add help icon to Heatmap page (`src/app/heatmap/page.tsx`)
- [x] Each opens MasteryHelpModal
- [x] Test modal on all pages

### Task 2.3: Settings Integration ✅
- [x] Add "Replay Tutorial" button to settings page
- [x] Button resets `hasSeenMasteryTutorial` flag and redirects to quests
- [x] Test replay functionality

---

## Phase 3: Quest Generation (REMOVE CACHING) ✅

### Task 3.1: Remove Chapter Word Sets ✅
- [x] Remove `chapterWordSets` from QuestProgress type
- [x] Update `getChapterWords()` to generate fresh words each time
- [x] Remove caching logic
- [x] Add logging for word selection process

### Task 3.2: Mastery-Based Selection ✅
- [x] Update word selection algorithm:
  1. Get all words for year group
  2. Categorize by mastery level (0-5)
  3. Prioritize: Level 0 > Level 1-2 > Level 3-4 (due) > Level 5 (maintenance)
  4. Select 10 words randomly from prioritized list
- [x] Test word selection across all mastery levels

### Task 3.3: Quest Completion Button ✅
- [x] Remove `markChapterComplete()` call - no longer marking chapters as complete
- [x] Change "Replay Chapter" to "Start New Quest" button
- [x] Button reloads page to generate fresh quest with new words
- [x] Changed completion text from "Chapter X Complete" to "Quest Complete"

---

## Phase 4: All 3 Chapters + Progression (BUILD TOGETHER)

### Task 4.1: Chapter Unlocking System ✅
- [x] Add `getUnlockedChapters()` and `isChapterUnlocked()` functions
- [x] Unlock based on mastered words (Ch1=0, Ch2=10, Ch3=25)
- [x] Show lock status dynamically in UI

### Task 4.2: Quest List Page Redesign ✅
- [x] Update `src/app/quests/page.tsx`:
  - [x] Show 3 chapter cards with descriptions
  - [x] Add lock icon on unavailable chapters
  - [x] Show unlock criteria below locked chapters
  - [x] Disable click on locked chapters
  - [x] Show completion checkmark for completed quests

### Task 4.3: Chapter 1 Level-Up Feedback ✅
- [x] Keep existing preview phase
- [x] Add level-up feedback in completion screen:
  - [x] Track mastery changes with `batchUpdateWordStatsWithChanges()`
  - [x] Show animated cards for words that leveled up
  - [x] Display "word: Level X → Level Y"
- [x] Test Chapter 1 with mastery feedback

### Task 4.4: Chapter 2 - Listen & Spell Mode ✅
- [x] Skip preview phase entirely
- [x] Go straight to practice phase on load
- [x] Keep WordPlayer with replay button
- [x] Keep 3-round retry system
- [x] Same 10-word format as Chapter 1
- [x] Test Chapter 2 flow

### Task 4.5: Chapter 3 - Challenge Mode ✅
- [x] 20 words instead of 10
- [x] Add 10-second countdown timer per word:
  - [x] Timer starts when entering practice
  - [x] Show visual countdown with color urgency
  - [x] Auto-submit when timer reaches 0
  - [x] Track `responseTime` in milliseconds
- [x] No preview phase (like Ch2)
- [x] Store responseTime in attempts
- [x] Show response time stats in completion screen:
  - [x] Fast answers (<5s) count
  - [x] Fastest response time
  - [x] Average response time
- [x] Apply response time bonus to mastery:
  - [x] Fast (<5s) + correct = +1 extra level boost
- [x] Test Chapter 3 timer and mastery bonus

### Task 4.6: Testing ✅
- [x] Restore proper unlock requirements (Ch2=10, Ch3=25)
- [ ] Test all 3 chapters end-to-end
- [ ] Verify unlock thresholds work correctly
- [ ] Test timer functionality
- [ ] Edge cases (timeout, quick answers, level progression)

---

## Phase 5: Polish & Testing

### Task 5.1: Level-Up Animations
- [ ] Create animated notification component
- [ ] Show confetti/sparkles on reaching Level 5
- [ ] Add sound effects (optional)
- [ ] Test animations don't block gameplay

### Task 5.2: Global Mastery Display
- [ ] Add mastery progress widget to quest list page
- [ ] Show: "45/210 words mastered (21%)"
- [ ] Show breakdown by level (optional)
- [ ] Test calculations are accurate

### Task 5.3: Milestone Celebrations
- [ ] Define milestones: 25%, 50%, 75%, 100%
- [ ] Create celebration modal for each milestone
- [ ] Show achievement badge/trophy
- [ ] Test milestone triggers

### Task 5.4: End-to-End Testing
- [ ] Test complete user journey: Ch1 → Ch2 → Ch3
- [ ] Test mastery progression across all chapters
- [ ] Test word selection prioritization
- [ ] Test tutorial → quests → heatmap flow
- [ ] Test year group word pool filtering
- [ ] Test all 3 round retry systems
- [ ] Test response time bonus in Chapter 3
- [ ] Test database persistence across sessions

---

## Estimated Effort

- **Phase 1** (Mastery System): ~3-4 hours
- **Phase 2** (Tutorial): ~1 hour
- **Phase 3** (Quest Generation): ~1-2 hours
- **Phase 4** (3 Chapters): ~4-5 hours
- **Phase 5** (Polish): ~2 hours

**Total: ~12-14 hours**

---

## Ready to Start?

Let's begin with **Phase 1, Task 1.1: Database Schema Update**! 🚀
