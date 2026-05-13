// Vitest test setup
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend expect with jest-dom matchers
expect.extend(matchers)

// Global test setup
global.beforeEach(() => {
  // Reset any mocks before each test
})

global.afterEach(() => {
  // Clean up after each test
})
