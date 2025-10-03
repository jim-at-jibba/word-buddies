# Project Context

## Purpose
Word Buddies is a cat-themed spelling practice web application for Years 1-4 students (ages 5-9). The app uses spaced repetition to help children learn spelling through audio-first practice with an encouraging animated cat mascot. All data is stored client-side in browser storage - no server database.

## Tech Stack
- **Framework**: Next.js 15.4.4 with App Router and Turbopack
- **Language**: TypeScript 5 (strict mode enabled)
- **Runtime**: React 19.1.0
- **State Management**: Zustand 5.0.6
- **Styling**: Tailwind CSS 4, Framer Motion 12.23.11
- **Testing**: Vitest 3.2.4, jsdom, Testing Library
- **Linting**: ESLint 9 (next/core-web-vitals, next/typescript)
- **Git Hooks**: Husky 9.1.7, lint-staged 16.1.2
- **Audio**: ElevenLabs API (primary), browser Speech Synthesis API (fallback)

## Project Conventions

### Code Style
- **TypeScript**: Strict mode, explicit types for all function parameters and return values
- **Imports**: Use `@/*` alias for src imports. Import order: React, Next.js, external libs, internal libs, components, types
- **Naming**:
  - camelCase for functions and variables
  - PascalCase for components and types
  - kebab-case for file names
- **Components**: Functional components with hooks, use `memo()` for performance, explicit prop interfaces
- **Comments**: Do not add comments unless explicitly requested
- **Error Handling**: Use try/catch blocks, `logger.error()` for logging, graceful fallbacks for TTS/audio failures
- **Formatting**: Enforced via ESLint with lint-staged pre-commit hooks

### Architecture Patterns
- **Client-Side Only**: No server database, all data stored in browser via `src/lib/storage/browser-db.ts`
- **Spaced Repetition**: Core learning algorithm in `src/lib/client-spelling-logic.ts`
- **Dual TTS System**: ElevenLabs API as primary, browser Speech Synthesis as fallback
- **Component Structure**:
  - `src/app/` - Next.js App Router pages and layouts
  - `src/components/` - Reusable React components
  - `src/lib/` - Business logic, utilities, storage abstraction
  - `src/types/` - Shared TypeScript type definitions
  - `src/hooks/` - Custom React hooks
- **Error Boundaries**: Use ErrorBoundary and TTSErrorBoundary for graceful degradation
- **Simplicity First**: Default to <100 lines of new code, single-file implementations, avoid frameworks without clear justification

### Testing Strategy
- **Framework**: Vitest with jsdom environment
- **Location**: Core logic tests in `src/lib/*.test.ts`
- **Approach**: Mock external dependencies, test business logic separately from UI
- **Commands**:
  - `npm test` - Run all tests
  - `npm run test:watch` - Watch mode
  - `npm test <filename>` - Run specific test file
- **Requirement**: Test core logic in `src/lib/` when making changes

### Git Workflow
- **Pre-commit**: lint-staged runs ESLint on staged files
- **Pre-push**: (configured via Husky)
- **Commits**: Never stage or commit without explicit user request
- **Validation**: Run `npm run lint`, `npm run type-check` before committing

## Domain Context
- **Spaced Repetition**: Words are reviewed at intervals: 1, 3, 7, 14, 30 days based on performance
- **Practice Sessions**: 5 words per session, mix of new words and review words
- **Word Difficulty**: Levels 1-4 corresponding to school years
- **Progress Tracking**: correctAttempts, attempts, nextReview, lastAttempted stored per word
- **Mastery**: Word is "mastered" after 3 correct attempts
- **Target Audience**: Primary users are children 5-9 years old; secondary users are parents/teachers
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support, high contrast compatibility

## Important Constraints
- **No Server Database**: All storage must be client-side (localStorage/IndexedDB abstraction)
- **Offline-First**: App must work without network connection (except TTS APIs)
- **Child-Friendly**: Large buttons, clear typography (Comic Neue font), encouraging feedback
- **Browser Compatibility**: Modern browsers with ES2017+ support, Speech Synthesis API availability varies
- **Performance**: Must work smoothly on tablets and mobile devices
- **Audio Fallback**: Must gracefully handle TTS failures with browser fallback or visual-only mode

## External Dependencies
- **ElevenLabs API**: Primary text-to-speech service (requires API key, see `ELEVENLABS_SETUP.md`)
- **Browser Speech Synthesis API**: Fallback TTS when ElevenLabs unavailable
- **Client Storage**: Browser localStorage/IndexedDB via `src/lib/storage/browser-db.ts`
- **No External Database**: All data persists in user's browser only
