/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { AuthContextValue } from '@/features/auth/AuthContext'
import type { ReactNode } from 'react'
import { AuthContext, useAuth } from '@/features/auth/AuthContext'

describe('AuthContext', () => {
  describe('useAuth', () => {
    it('throws error when used outside of AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')
    })

    it('returns context value when used within AuthProvider', () => {
      const mockContextValue: AuthContextValue = {
        isLoading: false,
        isAuthenticated: true,
        authType: 'authenticated',
        signIn: () => {},
        signOut: () => Promise.resolve(),
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthContext.Provider value={mockContextValue}>
          {children}
        </AuthContext.Provider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.authType).toBe('authenticated')
      expect(typeof result.current.signIn).toBe('function')
      expect(typeof result.current.signOut).toBe('function')
    })

    it('returns anonymous auth type when configured', () => {
      const mockContextValue: AuthContextValue = {
        isLoading: false,
        isAuthenticated: true,
        authType: 'anonymous',
        signIn: () => {},
        signOut: () => Promise.resolve(),
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthContext.Provider value={mockContextValue}>
          {children}
        </AuthContext.Provider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.authType).toBe('anonymous')
    })

    it('returns loading state correctly', () => {
      const mockContextValue: AuthContextValue = {
        isLoading: true,
        isAuthenticated: false,
        authType: 'authenticated',
        signIn: () => {},
        signOut: () => Promise.resolve(),
      }

      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthContext.Provider value={mockContextValue}>
          {children}
        </AuthContext.Provider>
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
