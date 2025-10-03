## 1. Storage & State Management
- [x] 1.1 Extend UserSettings interface to include timer configuration (duration, startTime, isActive)
- [x] 1.2 Create useTimer hook with start, stop, reset, and time remaining logic
- [x] 1.3 Implement timer state persistence in browser storage

## 2. UI Components
- [x] 2.1 Create TimerConfig component with preset duration buttons (5, 10, 15, 20 mins)
- [x] 2.2 Create FloatingTimer component with countdown display and stop button
- [x] 2.3 Style components to be child-friendly and non-intrusive

## 3. Integration
- [x] 3.1 Add TimerConfig component to home page below welcome section
- [x] 3.2 Add FloatingTimer component to root layout (visible on all pages when active)
- [x] 3.3 Implement timer expiration notification and auto-reset

## 4. Testing & Validation
- [x] 4.1 Test timer persistence across page navigation
- [x] 4.2 Test timer expiration behavior
- [x] 4.3 Verify timer doesn't interfere with practice/game interactions
- [x] 4.4 Run lint and type-check
