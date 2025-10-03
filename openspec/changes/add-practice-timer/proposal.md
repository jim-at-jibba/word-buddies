## Why
Parents need to set time limits for their children's practice sessions (e.g., "10 minutes in the morning"). Children need a visible countdown timer to see how much time they have left, promoting self-regulation and time awareness without interrupting their learning flow.

## What Changes
- Add timer configuration UI on home page with preset duration options (5, 10, 15, 20 minutes)
- Create floating timer display component visible across all pages
- Store timer state (duration, start time) in browser storage
- Timer persists across page navigation and browser refreshes during active session
- Non-intrusive design that doesn't interfere with games or practice activities
- Timer automatically stops and can be reset when time expires

## Impact
- Affected specs: `practice-timer` (new capability)
- Affected code:
  - `src/app/page.tsx` - Add timer start UI
  - `src/app/layout.tsx` - Add floating timer component
  - `src/components/FloatingTimer.tsx` - New timer display component
  - `src/components/TimerConfig.tsx` - New timer configuration component
  - `src/lib/storage/types.ts` - Add timer settings to UserSettings
  - `src/hooks/useTimer.ts` - New timer state management hook
