# Implementation Tasks

## 1. Data Layer
- [x] 1.1 Add quest progress storage schema (chapter completion, word sets per chapter)
- [x] 1.2 Add quest session storage (separate from practice sessions)
- [x] 1.3 Implement word success rate calculation for heatmap
- [x] 1.4 Add quest-specific word selection logic (10 random words from user's difficulty)
- [ ] 1.5 Write tests for quest storage and word selection

## 2. Quest Mode UI (Chapter 1)
- [x] 2.1 Create `/quests` route and main quest page component
- [x] 2.2 Implement word preview screen (shows 10 words upfront)
- [x] 2.3 Build quest practice flow (10-word session)
- [x] 2.4 Create quest review screen with tick/cross lists
- [x] 2.5 Implement repeat logic for misspelled words (up to 3 rounds)
- [x] 2.6 Add quest completion screen with chapter advance

## 3. Heatmap View
- [x] 3.1 Create `/heatmap` route and heatmap page component
- [x] 3.2 Calculate success rate for all attempted words
- [x] 3.3 Implement color-coding (red/amber/green) based on success rate thresholds
- [x] 3.4 Create visual heatmap grid/list component
- [x] 3.5 Add navigation from main menu to heatmap

## 4. Navigation & Integration
- [x] 4.1 Add "Quests" button to home page
- [x] 4.2 Add "Heatmap" link to settings or navigation
- [x] 4.3 Update session history to distinguish quest vs practice sessions
- [x] 4.4 Add quest progress indicator on home page

## 5. Testing & Polish
- [x] 5.1 Test full Chapter 1 quest flow end-to-end
- [x] 5.2 Test heatmap with various word success rates
- [x] 5.3 Verify quest storage isolation from practice mode
- [x] 5.4 Add quest-specific cat mascot moods/encouragement
- [x] 5.5 Ensure mobile/tablet responsive design
