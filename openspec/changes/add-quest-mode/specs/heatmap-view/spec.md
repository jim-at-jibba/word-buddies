# Heatmap View Specification

## ADDED Requirements

### Requirement: Heatmap Route
The system SHALL provide a heatmap view at `/heatmap` that displays all user words color-coded by mastery level.

#### Scenario: User navigates to heatmap
- **WHEN** user clicks "Heatmap" link from settings or navigation
- **THEN** system navigates to `/heatmap` route
- **AND** displays heatmap visualization of all words

#### Scenario: First-time heatmap view
- **WHEN** user visits `/heatmap` with no practice history
- **THEN** system displays message "Start practicing to see your word mastery heatmap!"
- **AND** shows link to practice mode

### Requirement: Success Rate Calculation
The system SHALL calculate success rate for each word based on all attempts from both practice and quest sessions.

#### Scenario: Success rate for attempted word
- **WHEN** system calculates success rate for a word
- **THEN** system retrieves all attempts for that word (practice + quest)
- **AND** calculates percentage: (correct attempts / total attempts) × 100
- **AND** rounds to nearest whole number

#### Scenario: Success rate for never-attempted word
- **WHEN** system calculates success rate for word with zero attempts
- **THEN** system assigns 0% success rate
- **AND** treats as "not yet attempted" category

### Requirement: Color-Coded Word Display
The system SHALL display words with color coding based on success rate thresholds.

#### Scenario: Green (mastered) words
- **WHEN** word has success rate ≥ 80%
- **THEN** system displays word with green background or indicator
- **AND** labels as "Mastered" or shows green icon

#### Scenario: Amber (practicing) words
- **WHEN** word has success rate between 40% and 79%
- **THEN** system displays word with amber/yellow background or indicator
- **AND** labels as "Practicing" or shows amber icon

#### Scenario: Red (needs work) words
- **WHEN** word has success rate < 40%
- **THEN** system displays word with red background or indicator
- **AND** labels as "Needs Work" or shows red icon

#### Scenario: Grey (not attempted) words
- **WHEN** word has never been attempted
- **THEN** system displays word with grey background or indicator
- **AND** labels as "Not Started" or shows grey icon

### Requirement: Heatmap Visualization
The system SHALL display the heatmap as a responsive list or grid showing all words with their mastery status.

#### Scenario: Heatmap list view
- **WHEN** heatmap loads successfully
- **THEN** system displays all words from user's difficulty level
- **AND** shows each word with color coding
- **AND** displays success rate percentage next to each word
- **AND** sorts words by success rate (lowest to highest) by default

#### Scenario: Heatmap filtering
- **WHEN** user applies filter (e.g., "Show only red words")
- **THEN** system updates display to show only matching words
- **AND** maintains color coding

#### Scenario: Heatmap responsive design
- **WHEN** user views heatmap on mobile device
- **THEN** system adapts layout to single-column list
- **WHEN** user views on tablet/desktop
- **THEN** system displays multi-column grid for better space usage

### Requirement: Heatmap Navigation
The system SHALL provide navigation from heatmap to related actions.

#### Scenario: Navigate to practice from heatmap
- **WHEN** user clicks "Practice" button on heatmap page
- **THEN** system navigates to `/practice`
- **AND** prioritizes words with lower success rates (red/amber)

#### Scenario: Navigate back from heatmap
- **WHEN** user clicks back button on heatmap
- **THEN** system returns to previous page (home or settings)
