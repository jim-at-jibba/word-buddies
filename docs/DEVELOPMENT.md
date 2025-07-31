# Development Guidelines

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks for maintaining code quality.

### Pre-commit Hook
- Runs automatically before each commit
- Uses `lint-staged` to run ESLint only on staged files
- Automatically fixes fixable linting issues
- Commits are blocked if there are unfixable linting errors

### Pre-push Hook
- Runs automatically before pushing to remote
- Performs the following checks:
  1. **ESLint** - Checks all files for linting errors
  2. **TypeScript** - Runs type checking across the entire codebase
  3. **Tests** - Runs the test suite (if tests are configured)
- Push is blocked if any check fails

### Setup
Husky is automatically set up when you run `npm install` thanks to the `prepare` script in package.json.

### Bypassing Hooks (Use with caution!)
If you need to bypass hooks in an emergency:
- Skip pre-commit: `git commit --no-verify -m "message"`
- Skip pre-push: `git push --no-verify`

**Note:** Only bypass hooks when absolutely necessary. These checks help maintain code quality.

## Code Quality Commands

- `npm run lint` - Run ESLint on all files
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report