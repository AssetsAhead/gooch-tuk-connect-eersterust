# Hook Tests

This directory contains unit tests for custom React hooks.

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui
```

## Test Structure

- **useNotifications.test.tsx**: Tests for the notifications hook including:
  - Initial state and fetching
  - Real-time subscription setup
  - Mark as read functionality
  - Mark all as read functionality
  - Delete notification functionality
  - Error handling
  - Cleanup on unmount

## Mocking

All external dependencies are mocked:
- Supabase client (`@/integrations/supabase/client`)
- Auth context (`@/contexts/AuthContext`)
- Toast hook (`@/hooks/use-toast`)

Mock implementations are located in `src/test/mocks/`.

## Writing New Tests

1. Create a new test file with `.test.tsx` or `.test.ts` extension
2. Import necessary testing utilities from `vitest` and `@testing-library/react`
3. Mock external dependencies using `vi.mock()`
4. Write test cases using `describe`, `it`, and `expect`
5. Use `beforeEach` and `afterEach` for setup and cleanup
