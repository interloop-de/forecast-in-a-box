/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AnonymousAuthProvider } from '@/features/auth/AnonymousAuthProvider'
import { useAuth } from '@/features/auth/AuthContext'
import { STORAGE_KEYS } from '@/lib/storage-keys'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-12345',
}))

// Mock logger to suppress expected output in tests
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('AnonymousAuthProvider', () => {
  let localStorageMock: Record<string, string> = {}

  beforeEach(() => {
    localStorageMock = {}

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => localStorageMock[key] ?? null,
    )
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete localStorageMock[key]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AnonymousAuthProvider>{children}</AnonymousAuthProvider>
  )

  describe('initialization', () => {
    it('creates new anonymous ID when none exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(localStorageMock[STORAGE_KEYS.auth.anonymousId]).toBe(
        'mock-uuid-12345',
      )
    })

    it('reuses existing anonymous ID from localStorage', async () => {
      localStorageMock[STORAGE_KEYS.auth.anonymousId] = 'existing-uuid'

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(localStorageMock[STORAGE_KEYS.auth.anonymousId]).toBe(
        'existing-uuid',
      )
    })

    it('finishes loading after initialization', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('authentication state', () => {
    it('is always authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('has anonymous auth type', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.authType).toBe('anonymous')
    })
  })

  describe('signIn', () => {
    it('is a no-op for anonymous auth', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // signIn should not throw and should be callable
      expect(() => result.current.signIn()).not.toThrow()
    })
  })

  // Note: signOut tests are skipped because they trigger window.location.reload()
  // which cannot be mocked in browser mode and causes tests to hang
})
