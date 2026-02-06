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
import type {
  BlockFactoryCatalogue,
  FableBuilderV1 as Fable,
} from '@/api/types/fable.types'
import { FableBuilderHeader } from '@/features/fable-builder/components/FableBuilderHeader'

// Mock state
let mockMode: 'graph' | 'form' = 'graph'
let mockStep: 'edit' | 'review' = 'edit'
let mockFableName = 'Test Fable'
let mockFable: Fable = { blocks: {} }
let mockIsDirty = false
let mockValidationState: { isValid: boolean } | null = null
let mockFableId: string | null = null
const mockSetMode = vi.fn()
const mockSetStep = vi.fn()
const mockSetFable = vi.fn()

// Mock useFableBuilderStore
vi.mock('@/features/fable-builder/stores/fableBuilderStore', () => ({
  useFableBuilderStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) => {
    const state = {
      mode: mockMode,
      step: mockStep,
      fableName: mockFableName,
      fable: mockFable,
      isDirty: mockIsDirty,
      validationState: mockValidationState,
      fableId: mockFableId,
      setMode: mockSetMode,
      setStep: mockSetStep,
      setFable: mockSetFable,
    }
    return selector(state)
  },
}))

// Mock GraphOptionsDropdown since it's already tested separately
vi.mock(
  '@/features/fable-builder/components/graph-mode/GraphOptionsDropdown',
  () => ({
    GraphOptionsDropdown: () => (
      <button data-testid="graph-options-dropdown">...</button>
    ),
  }),
)

// Mock SaveConfigPopover since it's tested separately
// Only render a single instance; the 'open' prop distinguishes the controlled (mobile) variant
vi.mock('@/features/fable-builder/components/SaveConfigPopover', () => ({
  SaveConfigPopover: ({
    disabled,
    open,
  }: {
    disabled?: boolean
    open?: boolean
  }) =>
    open === undefined ? (
      <button data-testid="save-config-popover" disabled={disabled}>
        Save Config
      </button>
    ) : null,
}))

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace('/', '')}`}>
      {children}
    </a>
  ),
}))

// Mock ValidationStatusBadge
vi.mock('@/features/fable-builder/components/shared/ValidationStatus', () => ({
  ValidationStatusBadge: () => (
    <span data-testid="validation-status-badge">Valid</span>
  ),
}))

// Test catalogue with source and sink factories
const mockCatalogue: BlockFactoryCatalogue = {
  'test/plugin': {
    factories: {
      testSource: {
        title: 'Test Source',
        kind: 'source',
        description: 'A test source',
        inputs: [],
        configuration_options: {},
      },
      testSink: {
        title: 'Test Sink',
        kind: 'sink',
        description: 'A test sink',
        inputs: ['data'],
        configuration_options: {},
      },
    },
  },
}

// Helper to create a fable with a source block
function fableWithSource(): Fable {
  return {
    blocks: {
      block1: {
        factory_id: {
          plugin: { store: 'test', local: 'plugin' },
          factory: 'testSource',
        },
        configuration_values: {},
        input_ids: {},
      },
    },
  }
}

// Helper to create a fable with source + sink blocks
function fableWithSink(): Fable {
  return {
    blocks: {
      block1: {
        factory_id: {
          plugin: { store: 'test', local: 'plugin' },
          factory: 'testSource',
        },
        configuration_values: {},
        input_ids: {},
      },
      block2: {
        factory_id: {
          plugin: { store: 'test', local: 'plugin' },
          factory: 'testSink',
        },
        configuration_values: {},
        input_ids: { data: 'block1' },
      },
    },
  }
}

describe('FableBuilderHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMode = 'graph'
    mockStep = 'edit'
    mockFableName = 'Test Fable'
    mockFable = fableWithSink()
    mockIsDirty = false
    mockValidationState = { isValid: true }
    mockFableId = null
  })

  describe('rendering', () => {
    it('renders header element', async () => {
      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const header = screen.container.querySelector('header')
      expect(header).toBeTruthy()
    })

    it('renders fable name', async () => {
      mockFableName = 'My Custom Fable'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('My Custom Fable')).toBeVisible()
    })

    it('renders back to dashboard link', async () => {
      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByTestId('link-dashboard')).toBeVisible()
    })

    it('renders block count', async () => {
      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('2 blocks')).toBeVisible()
    })

    it('renders singular block when count is 1', async () => {
      mockFable = fableWithSource()

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('1 block')).toBeVisible()
    })

    it('shows validation status badge when blocks exist', async () => {
      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect
        .element(screen.getByTestId('validation-status-badge'))
        .toBeVisible()
    })
  })

  describe('dirty state', () => {
    it('shows unsaved badge when dirty', async () => {
      mockIsDirty = true

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Unsaved')).toBeVisible()
    })

    it('hides unsaved badge when clean', async () => {
      mockIsDirty = false

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      // Query for the Unsaved badge text - should not exist when not dirty
      const unsavedBadge = screen.container.querySelector('[class*="Badge"]')
      const hasUnsavedText = unsavedBadge?.textContent.includes('Unsaved')
      expect(hasUnsavedText).toBeFalsy()
    })
  })

  describe('edit mode', () => {
    it('shows mode toggle buttons in edit step', async () => {
      mockStep = 'edit'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      // Use exact match to avoid matching "Graph Options" from the popover mock
      await expect
        .element(screen.getByRole('button', { name: 'Graph', exact: true }))
        .toBeVisible()
      await expect.element(screen.getByText('Form')).toBeVisible()
    })

    it('calls setMode when Graph button clicked', async () => {
      mockStep = 'edit'
      mockMode = 'form'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await screen.getByRole('button', { name: 'Graph', exact: true }).click()

      expect(mockSetMode).toHaveBeenCalledWith('graph')
    })

    it('calls setMode when Form button clicked', async () => {
      mockStep = 'edit'
      mockMode = 'graph'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await screen.getByText('Form').click()

      expect(mockSetMode).toHaveBeenCalledWith('form')
    })

    it('shows save config and review buttons in edit step', async () => {
      mockStep = 'edit'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Save Config')).toBeVisible()
      await expect.element(screen.getByText('Review & Submit')).toBeVisible()
    })

    it('shows save config button in edit step', async () => {
      mockStep = 'edit'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Save Config')).toBeVisible()
    })

    it('shows review & submit button in edit step', async () => {
      mockStep = 'edit'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Review & Submit')).toBeVisible()
    })
  })

  describe('review mode', () => {
    it('shows back to edit button in review step', async () => {
      mockStep = 'review'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Back to Edit')).toBeVisible()
    })

    it('shows submit job button in review step', async () => {
      mockStep = 'review'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Submit Job')).toBeVisible()
    })

    it('calls setStep when Back to Edit clicked', async () => {
      mockStep = 'review'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await screen.getByText('Back to Edit').click()

      expect(mockSetStep).toHaveBeenCalledWith('edit')
    })

    it('hides mode toggle in review step', async () => {
      mockStep = 'review'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      // Check that Graph/Form toggle buttons are not visible in review mode
      const buttons = screen.container.querySelectorAll('button')
      const graphButton = Array.from(buttons).find(
        (btn) => btn.textContent === 'Graph',
      )
      expect(graphButton).toBeFalsy()
    })
  })

  describe('save functionality', () => {
    it('renders save config popover', async () => {
      mockStep = 'edit'

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await expect
        .element(screen.getByTestId('save-config-popover'))
        .toBeVisible()
    })

    it('disables save popover when no blocks', async () => {
      mockStep = 'edit'
      mockFable = { blocks: {} }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const savePopover = screen.container.querySelector(
        '[data-testid="save-config-popover"]',
      )
      expect(savePopover).toBeDefined()
      expect(savePopover!.hasAttribute('disabled')).toBe(true)
    })
  })

  describe('review transition', () => {
    it('calls setStep with review when review button clicked', async () => {
      mockStep = 'edit'
      // Need valid fable with sink for the button to be enabled
      mockFable = fableWithSink()
      mockValidationState = { isValid: true }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      await screen.getByText('Review & Submit').click()

      expect(mockSetStep).toHaveBeenCalledWith('review')
    })

    it('disables review button when no blocks', async () => {
      mockStep = 'edit'
      mockFable = { blocks: {} }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const buttons = screen.container.querySelectorAll('button')
      const reviewButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes('Review'),
      )
      expect(reviewButton).toBeDefined()
      expect(reviewButton!.hasAttribute('disabled')).toBe(true)
    })

    it('disables review button when valid but no sink block', async () => {
      mockStep = 'edit'
      mockFable = fableWithSource() // has blocks but no sink
      mockValidationState = { isValid: true }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const buttons = screen.container.querySelectorAll('button')
      const reviewButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes('Review'),
      )
      expect(reviewButton).toBeDefined()
      expect(reviewButton!.hasAttribute('disabled')).toBe(true)
    })

    it('disables review button when has sink but not valid', async () => {
      mockStep = 'edit'
      mockFable = fableWithSink()
      mockValidationState = { isValid: false }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const buttons = screen.container.querySelectorAll('button')
      const reviewButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes('Review'),
      )
      expect(reviewButton).toBeDefined()
      expect(reviewButton!.hasAttribute('disabled')).toBe(true)
    })

    it('enables review button when valid and has sink block', async () => {
      mockStep = 'edit'
      mockFable = fableWithSink()
      mockValidationState = { isValid: true }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const buttons = screen.container.querySelectorAll('button')
      const reviewButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes('Review'),
      )
      expect(reviewButton).toBeDefined()
      expect(reviewButton!.hasAttribute('disabled')).toBe(false)
    })
  })

  describe('submit button state', () => {
    it('disables submit button when not valid', async () => {
      mockStep = 'review'
      mockValidationState = { isValid: false }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const buttons = screen.container.querySelectorAll('button')
      const submitButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes('Submit'),
      )
      expect(submitButton).toBeDefined()
      expect(submitButton!.hasAttribute('disabled')).toBe(true)
    })

    it('enables submit button when valid', async () => {
      mockStep = 'review'
      mockValidationState = { isValid: true }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const buttons = screen.container.querySelectorAll('button')
      const submitButton = Array.from(buttons).find((btn) =>
        btn.textContent.includes('Submit'),
      )
      expect(submitButton).toBeDefined()
      expect(submitButton!.hasAttribute('disabled')).toBe(false)
    })
  })

  describe('save config disabled state', () => {
    it('disables save config popover when no blocks', async () => {
      mockStep = 'edit'
      mockFable = { blocks: {} }

      const screen = await render(
        <FableBuilderHeader catalogue={mockCatalogue} />,
      )

      const savePopover = screen.container.querySelector(
        '[data-testid="save-config-popover"]',
      )
      expect(savePopover).toBeDefined()
      expect(savePopover!.hasAttribute('disabled')).toBe(true)
    })
  })
})
