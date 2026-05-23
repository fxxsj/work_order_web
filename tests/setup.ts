// Vitest test setup
import { beforeEach, afterEach, vi } from 'vitest'

// Global test setup
beforeEach(() => {
  // Reset any mocks before each test
  vi.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  }
})()
vi.stubGlobal('localStorage', localStorageMock)

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  }
})()
vi.stubGlobal('sessionStorage', sessionStorageMock)

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '', pathname: '/', reload: vi.fn() },
  writable: true,
})

// Mock window.alert
vi.stubGlobal('alert', vi.fn())

// Mock console.error to suppress noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})
