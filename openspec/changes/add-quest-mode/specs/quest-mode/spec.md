# Quest Mode Specification

## ADDED Requirements

### Requirement: Quest Mode Route
The system SHALL provide a dedicated quest mode route at `/quests` that displays chapter-based spelling practice separate from the existing practice mode.

#### Scenario: User navigates to quest mode
- **WHEN** user clicks "Quests" button on home page
- **THEN** system navigates to `/quests` route
- **AND** displays current chapter progress and available chapters

#### Scenario: First-time quest user
- **WHEN** user visits `/quests` for the first time
- **THEN** system shows Chapter 1 as available
- **AND** initializes quest progress storage
- **AND** shows optional onboarding tooltip explaining quest mode

### Requirement: Chapter 1 Word Preview
The system SHALL display all 10 words at the start of Chapter 1 quest session before testing begins.

#### Scenario: Quest session starts with preview
- **WHEN** user starts Chapter 1 quest session
- **THEN** system selects 10 random words from user's difficulty level
- **AND** displays preview screen with message "Here are the words we'll be learning today. Read them and take a look at the spellings."
- **AND** shows all 10 words with text visible
- **AND** provides audio playback button for each word

#### Scenario: User proceeds from preview
- **WHEN** user clicks "Start Quest" after preview
- **THEN** system transitions to practice phase
- **AND** begins testing first word without showing spelling

### Requirement: Chapter 1 Quest Practice
The system SHALL test all 10 words in Chapter 1 quest session using audio-first spelling practice.

#### Scenario: Word testing during quest
- **WHEN** quest practice phase begins
- **THEN** system presents each word with audio playback
- **AND** hides word spelling from user
- **AND** accepts user spelling input
- **AND** provides immediate feedback (correct/incorrect)
- **AND** progresses through all 10 words sequentially

#### Scenario: Quest practice completion
- **WHEN** user completes all 10 word attempts
- **THEN** system shows first review screen
- **AND** displays list of words with tick (correct) or cross (incorrect)

### Requirement: Multi-Round Quest Review
The system SHALL provide up to 3 review rounds for misspelled words in Chapter 1 quests.

#### Scenario: First review with incorrect words
- **WHEN** quest round 1 completes with incorrect words
- **THEN** system displays review screen showing all words with tick/cross
- **AND** collects words marked with cross for retry
- **AND** shows "Try Again" button
- **WHEN** user clicks "Try Again"
- **THEN** system starts round 2 with only incorrect words from round 1

#### Scenario: Second review with remaining incorrect words
- **WHEN** quest round 2 completes with still-incorrect words
- **THEN** system displays review screen showing round 2 results
- **AND** collects remaining incorrect words for final retry
- **AND** starts round 3 with only words incorrect in round 2

#### Scenario: Final results after all rounds
- **WHEN** quest round 3 completes (or earlier round has all correct)
- **THEN** system displays final results screen
- **AND** shows up to 3 lists with tick/cross (may be fewer lists if words mastered earlier)
- **AND** calculates overall quest score

### Requirement: Quest Completion and Progression
The system SHALL track quest completion and allow chapter advancement or replay.

#### Scenario: Chapter 1 completion
- **WHEN** user completes all review rounds in Chapter 1
- **THEN** system marks Chapter 1 as completed
- **AND** stores quest session with chapter number and results
- **AND** displays completion celebration screen
- **AND** shows message indicating Chapter 2 will be available in future

#### Scenario: Chapter replay
- **WHEN** user chooses to replay a completed chapter
- **THEN** system generates new word set (10 random words)
- **AND** starts quest from preview phase
- **AND** maintains previous completion status

### Requirement: Quest Session Storage
The system SHALL store quest sessions separately from practice sessions with chapter information.

#### Scenario: Quest session saved
- **WHEN** user completes quest session
- **THEN** system saves session with `sessionType: 'quest'`
- **AND** includes chapter number (1)
- **AND** records all word attempts across all rounds
- **AND** stores final score and word lists
- **AND** updates quest progress storage

#### Scenario: Quest sessions visible in history
- **WHEN** user views session history at `/sessions`
- **THEN** system displays quest sessions with quest indicator
- **AND** distinguishes quest sessions from practice sessions visually
- **AND** allows viewing quest session details
