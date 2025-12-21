/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { FableValidationState } from '@/api/types/fable.types'
import {
  ValidationStatus,
  ValidationStatusBadge,
} from '@/features/fable-builder/components/shared/ValidationStatus'

// Import the mock to control it
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock the fableBuilderStore - use unknown for selector type to allow partial state in tests
vi.mock('@/features/fable-builder/stores/fableBuilderStore', () => ({
  useFableBuilderStore: vi.fn((selector: (state: any) => unknown) => {
    const state: {
      validationState: FableValidationState | null
      isValidating: boolean
    } = {
      validationState: null,
      isValidating: false,
    }
    return selector(state)
  }),
}))

// Helper to mock the store with partial state - avoids type errors with full state requirement

const mockStore = (partialState: {
  validationState: any
  isValidating: boolean
}) => {
  vi.mocked(useFableBuilderStore).mockImplementation(((
    selector: (state: any) => unknown,
  ) => selector(partialState)) as typeof useFableBuilderStore)
}

describe('ValidationStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when validating', () => {
    it('shows validating badge', async () => {
      mockStore({ validationState: null, isValidating: true })
      const screen = await render(<ValidationStatusBadge />)
      await expect.element(screen.getByText('Validating')).toBeVisible()
    })
  })

  describe('when no validation state', () => {
    it('renders nothing', async () => {
      mockStore({ validationState: null, isValidating: false })
      const screen = await render(<ValidationStatusBadge />)
      expect(screen.container.textContent).toBe('')
    })
  })

  describe('when valid', () => {
    it('shows valid badge', async () => {
      mockStore({
        validationState: { globalErrors: [], blockStates: {} },
        isValidating: false,
      })
      const screen = await render(<ValidationStatusBadge />)
      await expect.element(screen.getByText('Valid')).toBeVisible()
    })
  })

  describe('when has errors', () => {
    it('shows error count for single error', async () => {
      mockStore({
        validationState: { globalErrors: ['Some error'], blockStates: {} },
        isValidating: false,
      })
      const screen = await render(<ValidationStatusBadge />)
      await expect.element(screen.getByText('1 error')).toBeVisible()
    })

    it('shows error count for multiple errors', async () => {
      mockStore({
        validationState: {
          globalErrors: ['Error 1', 'Error 2'],
          blockStates: {
            'block-1': { hasErrors: true, errors: ['Block error'] },
          },
        },
        isValidating: false,
      })
      const screen = await render(<ValidationStatusBadge />)
      await expect.element(screen.getByText('3 errors')).toBeVisible()
    })
  })
})

describe('ValidationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when validating', () => {
    it('shows validating message', async () => {
      mockStore({ validationState: null, isValidating: true })
      const screen = await render(<ValidationStatus />)
      await expect
        .element(screen.getByText('Validating configuration...'))
        .toBeVisible()
    })
  })

  describe('when valid', () => {
    it('renders nothing', async () => {
      mockStore({
        validationState: { globalErrors: [], blockStates: {} },
        isValidating: false,
      })
      const screen = await render(<ValidationStatus />)
      expect(screen.container.textContent).toBe('')
    })
  })

  describe('when has global errors', () => {
    it('shows alert with error list', async () => {
      mockStore({
        validationState: {
          globalErrors: ['Missing required field', 'Invalid configuration'],
          blockStates: {},
        },
        isValidating: false,
      })
      const screen = await render(<ValidationStatus />)
      await expect
        .element(screen.getByText('Configuration Issues'))
        .toBeVisible()
      await expect
        .element(screen.getByText('Missing required field'))
        .toBeVisible()
      await expect
        .element(screen.getByText('Invalid configuration'))
        .toBeVisible()
    })
  })

  describe('compact mode', () => {
    it('shows compact error count for block errors only', async () => {
      mockStore({
        validationState: {
          globalErrors: [],
          blockStates: {
            'block-1': { hasErrors: true, errors: ['Error 1', 'Error 2'] },
          },
        },
        isValidating: false,
      })
      const screen = await render(<ValidationStatus compact />)
      await expect.element(screen.getByText('2 block errors')).toBeVisible()
    })

    it('shows singular for single error', async () => {
      mockStore({
        validationState: {
          globalErrors: [],
          blockStates: { 'block-1': { hasErrors: true, errors: ['Error 1'] } },
        },
        isValidating: false,
      })
      const screen = await render(<ValidationStatus compact />)
      await expect.element(screen.getByText('1 block error')).toBeVisible()
    })
  })
})
