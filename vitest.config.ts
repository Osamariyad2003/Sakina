import { defineConfig } from 'vitest/config';

/**
 * Domain-level tests only, for now.
 *
 * The app's business rules (risk detection, mood/stress weighting, badge
 * criteria) are plain TypeScript with no React Native imports, so they run
 * under plain Node with no RN transform, preset or native mocking. Anything
 * that imports `react-native`, `expo-*` or a screen will NOT run here — that
 * needs jest-expo or a react-native-web alias, which is a separate decision.
 * See docs/architecture-review.md §10.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Keep the boundary honest: a test that reaches for RN should fail loudly
    // here rather than be quietly papered over with a stub.
    globals: false,
  },
});
