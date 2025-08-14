# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### No Database Migrations
This project uses client-side browser storage (not a traditional database), so there are no database migration commands.

## Architecture Overview

Word Buddies is a **client-side spelling practice app** for Years 1-4 students built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

### Key Architecture Patterns

**Client-Side Storage Architecture**: The app uses browser localStorage with a custom database abstraction layer (`src/lib/storage/`) instead of a traditional server database. All data persists locally in the user's browser.

**Spaced Repetition Learning System**: Core learning logic in `src/lib/client-spelling-logic.ts` implements spaced repetition intervals [1, 3, 7, 14, 30 days] with difficulty adjustment based on success rates.

**Text-to-Speech Integration**: Dual TTS system using ElevenLabs API as primary (for mobile reliability) with browser Speech Synthesis API fallback. Audio caching prevents repeated API calls.

**State Management**: Uses Zustand for client state management of practice sessions and progress tracking.

### Core Components

- `src/lib/client-spelling-logic.ts` - Spaced repetition algorithm, word selection, and session management
- `src/lib/storage/` - Browser storage abstraction with typed interfaces for words, sessions, and attempts
- `src/lib/speech.ts` - Browser TTS implementation
- `src/lib/elevenlabs-speech.ts` - ElevenLabs API integration with caching
- `src/components/CatMascot.tsx` - Animated cat character with emotion states
- `src/app/practice/page.tsx` - Main spelling practice interface
- `src/app/results/page.tsx` - Session results and progress display

### Data Models

**StoredWord**: Contains word text, difficulty (1-5), attempt counts, success rate, and spaced repetition scheduling
**StoredSession**: Practice session metadata with score, duration, and completion stats  
**StoredWordAttempt**: Individual spelling attempts linked to sessions for detailed tracking

### Configuration

- Uses `@/*` path alias for src imports
- Turbopack enabled for fast development
- next.config.ts configures `serverExternalPackages: ['better-sqlite3']` (legacy config, not currently used)
- ElevenLabs API configuration via environment variables (see ELEVENLABS_SETUP.md)

### Testing Mobile TTS
When working on speech functionality, always test on iPhone Chrome where browser TTS commonly fails but ElevenLabs integration provides reliable fallback.