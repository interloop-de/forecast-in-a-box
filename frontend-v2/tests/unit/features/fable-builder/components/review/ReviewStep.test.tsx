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
import { render } from 'vitest-browser-react'
import type { BlockFactoryCatalogue } from '@/api/types/fable.types'
import { ReviewStep } from '@/features/fable-builder/components/review/ReviewStep'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock ConfigSummaryCard
vi.mock('@/features/fable-builder/components/review/ConfigSummaryCard', () => ({
  ConfigSummaryCard: ({
    instanceId,
  }: {
    instanceId: string
    catalogue: BlockFactoryCatalogue
  }) => (
    <div data-testid={`config-summary-${instanceId}`}>Config {instanceId}</div>
  ),
}))

// Mock useCompileFable
const mockMutateAsync = vi.fn()
vi.mock('@/api/hooks/useFable', () => ({
  useCompileFable: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  })),
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'ecmwf/test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'Test Source',
        description: 'A test source block',
        configuration_options: {},
        inputs: [],
      },
      'product-factory': {
        kind: 'product',
        title: 'Test Product',
        description: 'A test product block',
        configuration_options: {},
        inputs: ['input'],
      },
      'sink-factory': {
        kind: 'sink',
        title: 'Test Output',
        description: 'A test output block',
        configuration_options: {},
        inputs: ['data'],
      },
    },
  },
}

describe('ReviewStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: {
        blocks: {
          'source-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'source-factory',
            },
            configuration_values: {},
            input_ids: {},
          },
        },
      },
      validationState: {
        isValid: true,
        globalErrors: [],
        possibleSources: [],
        blockStates: {},
      },
      isValidating: false,
      step: 'review',
    })
  })

  afterEach(() => {
    useFableBuilderStore.setState({
      validationState: null,
      isValidating: false,
    })
  })

  describe('rendering', () => {
    it('renders review title', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Review Configuration')
    })

    it('renders description', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Review your forecast configuration before submitting',
      )
    })

    it('renders configuration summary card', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Configuration Summary')
    })

    it('renders ConfigSummaryCard for each block', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      await expect
        .element(screen.getByTestId('config-summary-source-1'))
        .toBeInTheDocument()
    })

    it('shows block count in card description', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('1 block configured')
    })

    it('shows plural blocks when multiple', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            'source-2': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('2 blocks configured')
    })
  })

  describe('validation states', () => {
    it('shows validating message when isValidating', async () => {
      useFableBuilderStore.setState({ isValidating: true })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Validating Configuration')
    })

    it('shows ready to submit when valid', async () => {
      useFableBuilderStore.setState({
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [],
          blockStates: {},
        },
        isValidating: false,
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Ready to Submit')
    })

    it('shows error alert when not valid', async () => {
      useFableBuilderStore.setState({
        validationState: {
          isValid: false,
          globalErrors: ['Missing required source block'],
          possibleSources: [],
          blockStates: {},
        },
        isValidating: false,
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Configuration Has Errors')
      expect(screen.container.textContent).toContain(
        'Missing required source block',
      )
    })

    it('shows block error count when blocks have errors', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
        validationState: {
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'source-1': {
              hasErrors: true,
              errors: ['Error 1', 'Error 2'],
              possibleExpansions: [],
            },
          },
        },
        isValidating: false,
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('2 block-level errors')
    })
  })

  describe('navigation buttons', () => {
    it('renders Back to Edit button', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Back to Edit')
    })

    it('renders Submit Job button', async () => {
      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Submit Job')
    })

    it('calls setStep when Back to Edit clicked', async () => {
      const setStepSpy = vi.fn()
      useFableBuilderStore.setState({ setStep: setStepSpy })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const backButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Back to Edit'),
      )

      if (backButton) await backButton.click()

      expect(setStepSpy).toHaveBeenCalledWith('edit')
    })

    it('disables Submit when validating', async () => {
      useFableBuilderStore.setState({ isValidating: true })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const submitButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Submit'),
      )

      expect(submitButton?.disabled).toBe(true)
    })

    it('disables Submit when not valid', async () => {
      useFableBuilderStore.setState({
        validationState: {
          isValid: false,
          globalErrors: ['Error'],
          possibleSources: [],
          blockStates: {},
        },
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const submitButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Submit'),
      )

      expect(submitButton?.disabled).toBe(true)
    })

    it('enables Submit when valid', async () => {
      useFableBuilderStore.setState({
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [],
          blockStates: {},
        },
        isValidating: false,
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const submitButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Submit'),
      )

      expect(submitButton?.disabled).toBe(false)
    })
  })

  describe('block grouping by kind', () => {
    it('groups blocks by kind', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            'product-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'product-factory',
              },
              configuration_values: {},
              input_ids: { input: 'source-1' },
            },
          },
        },
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Sources')
      expect(screen.container.textContent).toContain('Products')
    })

    it('shows badge with count for each kind', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            'source-2': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(<ReviewStep catalogue={mockCatalogue} />)

      // Should show "2" badge for sources
      expect(screen.container.textContent).toContain('2')
    })
  })
})
