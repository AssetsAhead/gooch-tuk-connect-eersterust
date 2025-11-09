# Test Setup Instructions

## Overview

Unit tests have been added for the `useNotifications()` hook using Vitest and React Testing Library.

## Required Scripts

Add the following scripts to your `package.json` under the `"scripts"` section:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Running Tests

After adding the scripts, you can run:

```bash
# Run all tests once
npm run test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Open interactive Vitest UI
npm run test:ui
```

## Test Coverage

The `useNotifications.test.tsx` includes tests for:

✅ **Initialization**
- Hook initializes with empty notifications array
- Unread count starts at 0

✅ **Data Fetching**
- Fetches notifications when user is authenticated
- Does not fetch when user is null
- Handles fetch errors gracefully

✅ **Real-time Subscriptions**
- Subscribes to INSERT events for new notifications
- Subscribes to UPDATE events for notification changes
- Cleans up subscription on unmount

✅ **Mutations**
- Mark single notification as read
- Mark all unread notifications as read
- Delete notification
- Shows toast messages for user feedback

✅ **Computed Values**
- Calculates unread count correctly
- Updates count when notifications change

## Test Structure

```
src/
├── hooks/
│   ├── __tests__/
│   │   ├── useNotifications.test.tsx  # Test file
│   │   └── README.md                   # Test documentation
│   └── useNotifications.tsx            # Hook implementation
└── test/
    ├── setup.ts                        # Global test setup
    └── mocks/
        └── supabase.ts                 # Supabase client mock
```

## Mocking Strategy

All external dependencies are mocked to isolate the hook logic:

1. **Supabase Client**: Mocked with `createMockSupabaseClient()` helper
2. **Auth Context**: Mocked to provide test user data
3. **Toast Hook**: Mocked to verify toast notifications

## Configuration Files

- `vitest.config.ts`: Vitest configuration with jsdom environment
- `src/test/setup.ts`: Global test setup (includes jest-dom matchers)

## Next Steps

To extend test coverage:

1. Add tests for edge cases (network timeouts, partial failures)
2. Add integration tests for NotificationCenter component
3. Add E2E tests for notification workflows
4. Set up CI/CD to run tests automatically

## Dependencies Added

- `vitest` - Test runner
- `@vitest/ui` - Interactive test UI
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM matchers for assertions
