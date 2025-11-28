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

## Phase 2: Tutorial & Help System (QUICK WIN)

### Task 2.1: Tutorial Integration
- [ ] Add `hasSeenMasteryTutorial?: boolean` to UserSettings
- [ ] Update `src/app/quests/page.tsx`:
  - [ ] Check if user has seen tutorial
  - [ ] Show MasteryTutorial on first visit
  - [ ] Save flag after completion/skip
- [ ] Test tutorial flow

### Task 2.2: Help Icons
- [ ] Add help icon to Quest list page (`src/app/quests/page.tsx`)
- [ ] Add help icon to Quest chapter page (`src/app/quests/[chapter]/page.tsx`)
- [ ] Add help icon to Heatmap page (`src/app/heatmap/page.tsx`)
- [ ] Each opens MasteryHelpModal
- [ ] Test modal on all pages

### Task 2.3: Settings Integration
- [ ] Add "Replay Tutorial" button to settings page
- [ ] Button resets `hasSeenMasteryTutorial` flag
- [ ] Test replay functionality

---

## Phase 3: Quest Generation (REMOVE CACHING)

### Task 3.1: Remove Chapter Word Sets
- [ ] Remove `chapterWordSets` from QuestProgress type
- [ ] Update `getChapterWords()` to generate fresh words each time
- [ ] Remove caching logic
- [ ] Add logging for word selection process

### Task 3.2: Mastery-Based Selection
- [ ] Update word selection algorithm:
  1. Get all words for year group
  2. Categorize by mastery level (0-5)
  3. Prioritize: Level 0 > Level 1-2 > Level 3-4 (due) > Level 5 (maintenance)
  4. Select 10 words randomly from prioritized list
- [ ] Test word selection across all mastery levels

### Task 3.3: Quest Completion Button
- [ ] Remove "Chapter Complete" state/phase
- [ ] Add "Start New Quest" button after quest completion
- [ ] Button reloads page or triggers new quest generation
- [ ] Test infinite quest generation

---

## Phase 4: All 3 Chapters + Progression (BUILD TOGETHER)

### Task 4.1: Chapter Unlocking System
- [ ] Add `chapterUnlocks: number[]` to QuestProgress (e.g., [1] = only Ch1 unlocked)
- [ ] Add function `isChapterUnlocked(chapter: number): boolean`
- [ ] Add function `calculateChapterCompletion(chapter: number): number` (% mastery)
- [ ] Unlock next chapter when current reaches 80% mastery

### Task 4.2: Quest List Page Redesign
- [ ] Update `src/app/quests/page.tsx`:
  - [ ] Show 3 chapter cards with descriptions
  - [ ] Add lock icon on unavailable chapters
  - [ ] Add "Recommended for Year X" badge
  - [ ] Show mastery % per chapter (or global)
  - [ ] Disable click on locked chapters
  - [ ] Show unlock criteria tooltip

### Task 4.3: Chapter 1 Updates (Preview Mode)
- [ ] Keep existing preview phase
- [ ] Add level-up feedback after each word:
  - [ ] Show animated notification with new level
  - [ ] Display `getLevelUpMessage()` text
  - [ ] Show emoji and color for new level
- [ ] Test Chapter 1 with mastery feedback

### Task 4.4: Chapter 2 Implementation (Listen & Spell)
- [ ] Copy Chapter 1 component structure
- [ ] Remove preview phase entirely
- [ ] Go straight to practice phase on load
- [ ] Keep WordPlayer with replay button
- [ ] Keep 3-round retry system
- [ ] Add same level-up feedback as Chapter 1
- [ ] Test Chapter 2 flow

### Task 4.5: Chapter 3 Implementation (Challenge Mode)
- [ ] Copy Chapter 2 structure
- [ ] Add 10-second countdown timer per word:
  - [ ] Timer starts when word audio finishes
  - [ ] Show visual countdown (progress bar or number)
  - [ ] Auto-submit when timer reaches 0
  - [ ] Track `responseTime` in milliseconds
- [ ] Hide WordPlayer replay button (hear once only)
- [ ] Hide correct/incorrect feedback during practice
- [ ] Store results silently during practice
- [ ] Show all results in review phase (suspense!)
- [ ] Apply response time bonus to mastery calculation:
  - [ ] Fast (< 5s) + correct = +1.5 levels
  - [ ] Medium (5-8s) + correct = +1 level
  - [ ] Slow (> 8s) + correct = +0.5 levels
  - [ ] Timeout = incorrect, -2 levels
- [ ] Add level-up feedback in review phase
- [ ] Test Chapter 3 timer and mastery bonus

### Task 4.6: Chapter Progression Testing
- [ ] Test starting with only Chapter 1 unlocked
- [ ] Test Chapter 2 unlocks after Chapter 1 reaches 80%
- [ ] Test Chapter 3 unlocks after Chapter 2 reaches 80%
- [ ] Test lock icons and disabled state
- [ ] Test "Recommended" badge appears for user's year group

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
