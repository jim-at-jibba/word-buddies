# Quest Storage Specification

## ADDED Requirements

### Requirement: Quest Progress Storage
The system SHALL store quest progression data in browser storage including current chapter, completed chapters, and chapter word sets.

#### Scenario: Initialize quest progress
- **WHEN** user starts quest mode for first time
- **THEN** system creates `questProgress` storage entry
- **AND** sets `currentChapter: 1`
- **AND** sets `completedChapters: []`
- **AND** sets `chapterWordSets: {}`

#### Scenario: Store chapter word set
- **WHEN** user starts new quest chapter
- **THEN** system generates 10 random words from user's difficulty
- **AND** stores word list in `chapterWordSets[chapterNumber]`
- **AND** persists word set for chapter retries

#### Scenario: Mark chapter complete
- **WHEN** user completes quest chapter
- **THEN** system adds chapter number to `completedChapters` array
- **AND** increments `currentChapter` by 1 (future chapters)
- **AND** persists progress to storage

### Requirement: Quest Session Storage
The system SHALL store quest sessions with chapter and multi-round attempt data.

#### Scenario: Create quest session
- **WHEN** user starts quest session
- **THEN** system generates unique session ID
- **AND** creates session record with `sessionType: 'quest'`
- **AND** includes `chapter: number` field
- **AND** initializes empty attempts array

#### Scenario: Store multi-round attempts
- **WHEN** user completes word attempt in quest
- **THEN** system records attempt with `round: number` field (1, 2, or 3)
- **AND** includes word, userSpelling, isCorrect, attempts
- **AND** appends to session attempts array

#### Scenario: Finalize quest session
- **WHEN** user completes all quest rounds
- **THEN** system calculates overall quest score
- **AND** stores total words, correct words, duration
- **AND** persists complete session to storage
- **AND** updates word statistics (spaced repetition)

### Requirement: Quest Session Retrieval
The system SHALL retrieve quest sessions separately from practice sessions for display and analysis.

#### Scenario: Get quest session by ID
- **WHEN** system retrieves session by ID with `sessionType: 'quest'`
- **THEN** system returns session with all quest-specific fields
- **AND** includes chapter number
- **AND** includes multi-round attempt data

#### Scenario: List quest sessions
- **WHEN** user views session history
- **THEN** system retrieves both practice and quest sessions
- **AND** distinguishes sessions by `sessionType` field
- **AND** allows filtering by session type

### Requirement: Storage Isolation
The system SHALL maintain separate storage for quest progress while sharing word statistics with practice mode.

#### Scenario: Quest word attempts update shared stats
- **WHEN** user completes word in quest session
- **THEN** system updates word's `attempts` and `correctAttempts` counters
- **AND** updates `nextReview` date using spaced repetition
- **AND** shares word statistics with practice mode

#### Scenario: Quest progress isolated from practice
- **WHEN** user progresses in quest mode
- **THEN** quest chapter completion does NOT affect practice mode session counts
- **AND** practice mode does NOT affect quest chapter progression
- **AND** both modes share underlying word statistics only
