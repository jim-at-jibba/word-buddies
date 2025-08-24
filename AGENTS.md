# Agent Development Guide

## Commands
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run lint` / `npm run lint:fix` - ESLint linting
- `npm run type-check` - TypeScript checking
- `npm test` - Run all tests with Vitest
- `npm run test:watch` - Watch mode tests
- `npm run test <filename>` - Run single test file (e.g., `npm test client-spelling-logic`)

## Code Standards
- **TypeScript**: Strict mode enabled, use explicit types for function parameters/returns
- **Imports**: Use `@/*` alias for src imports, organize as: React, Next.js, external libs, internal libs, components, types
- **Naming**: camelCase for functions/variables, PascalCase for components/types, kebab-case for files
- **Components**: Use memo() for performance, explicit prop interfaces, functional components with hooks
- **Error Handling**: Use try/catch blocks, logger.error() for logging, graceful fallbacks for TTS/audio
- **Testing**: Vitest with jsdom, mock external dependencies, test core logic in `src/lib/`

## Architecture Notes
- Client-side storage via `src/lib/storage/browser-db.ts` (no server database)
- Spaced repetition algorithm in `src/lib/client-spelling-logic.ts`  
- Dual TTS: ElevenLabs API primary, browser Speech Synthesis fallback
- State management with Zustand, Next.js 15 app router, React 19