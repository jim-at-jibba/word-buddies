## ADDED Requirements

### Requirement: Timer Configuration
The system SHALL provide preset timer duration options on the home page allowing parents/children to set practice time limits.

#### Scenario: User selects timer duration
- **WHEN** user is on the home page
- **THEN** timer configuration UI displays preset options for 5, 10, 15, and 20 minutes

#### Scenario: User starts timer
- **WHEN** user selects a duration and starts the timer
- **THEN** timer state (duration, start time, active status) is persisted to browser storage
- **AND** floating timer display becomes visible

### Requirement: Floating Timer Display
The system SHALL display a persistent countdown timer that remains visible across all pages during an active practice session without interfering with game interactions.

#### Scenario: Timer displays remaining time
- **WHEN** timer is active
- **THEN** floating timer component displays minutes and seconds remaining in a non-intrusive position
- **AND** timer updates every second

#### Scenario: Timer persists across navigation
- **WHEN** user navigates between pages during active timer
- **THEN** timer continues countdown and remains visible
- **AND** timer state is maintained in browser storage

#### Scenario: Timer visible but non-blocking
- **WHEN** user interacts with practice activities or games
- **THEN** timer display does not interfere with input elements or game controls
- **AND** timer has lower z-index than modal dialogs

### Requirement: Timer Control
The system SHALL allow users to stop or reset the timer at any time during a practice session.

#### Scenario: User stops active timer
- **WHEN** user clicks stop button on floating timer
- **THEN** timer stops counting down
- **AND** timer state is cleared from storage
- **AND** floating timer display is hidden

#### Scenario: Timer expires
- **WHEN** countdown reaches zero
- **THEN** timer stops automatically
- **AND** user receives a friendly notification that time is up
- **AND** timer can be reset to start a new session

### Requirement: Timer State Persistence
The system SHALL persist timer state in browser storage to maintain countdown accuracy across page refreshes and browser sessions.

#### Scenario: Browser refresh during active timer
- **WHEN** user refreshes browser with active timer
- **THEN** timer resumes with correct remaining time based on original start time
- **AND** floating timer display reappears

#### Scenario: Timer state cleared after completion
- **WHEN** timer expires or user stops timer
- **THEN** timer state is removed from browser storage
- **AND** timer configuration UI returns to initial state
