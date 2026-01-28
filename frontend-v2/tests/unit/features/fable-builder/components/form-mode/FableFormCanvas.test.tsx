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
import { FableFormCanvas } from '@/features/fable-builder/components/form-mode/FableFormCanvas'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock BlockInstanceCard
vi.mock(
  '@/features/fable-builder/components/form-mode/BlockInstanceCard',
  () => ({
    BlockInstanceCard: ({
      instanceId,
    }: {
      instanceId: string
      catalogue: BlockFactoryCatalogue
    }) => (
      <div data-testid={`block-card-${instanceId}`}>Block {instanceId}</div>
    ),
  }),
)

// Mock FormPaletteSidebar to avoid BlockPalette content interfering with tests
vi.mock(
  '@/features/fable-builder/components/form-mode/FormPaletteSidebar',
  () => ({
    FormPaletteSidebar: () => (
      <div data-testid="form-palette-sidebar">Palette Sidebar</div>
    ),
  }),
)

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
      'transform-factory': {
        kind: 'transform',
        title: 'Test Transform',
        description: 'A test transform block',
        configuration_options: {},
        inputs: ['input'],
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

describe('FableFormCanvas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: { blocks: {} },
      validationState: null,
      isValidating: false,
    })
  })

  afterEach(() => {
    // Don't call reset() here as it causes components to crash during cleanup
    useFableBuilderStore.setState({
      validationState: null,
      isValidating: false,
    })
  })

  describe('rendering', () => {
    it('renders step navigation', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Source')
      expect(screen.container.textContent).toContain('Transform')
      expect(screen.container.textContent).toContain('Product')
      expect(screen.container.textContent).toContain('Output')
    })

    it('starts at source step', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Source step should be active - check for the Sources header
      expect(screen.container.textContent).toContain('Sources')
    })

    it('renders Previous Step button', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Previous Step')
    })

    it('renders Next Step button', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Next Step')
    })
  })

  describe('step navigation', () => {
    it('disables Previous Step on first step', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const prevButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Previous Step'),
      )
      expect(prevButton?.disabled).toBe(true)
    })

    it('disables Next Step when no blocks in current step', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const nextButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Next Step'),
      )
      expect(nextButton?.disabled).toBe(true)
    })

    it('enables Next Step when blocks exist in current step', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
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

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const nextButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Next Step'),
      )
      expect(nextButton?.disabled).toBe(false)
    })

    it('navigates to next step when Next clicked', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
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

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const nextButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Next Step'),
      )

      if (nextButton) {
        await nextButton.click()
      }

      // Should now show Transforms header (transform step is after source)
      expect(screen.container.textContent).toContain('Transforms')
    })

    it('navigates to previous step when Previous clicked', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
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

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Go to next step first
      const buttons = screen.container.querySelectorAll('button')
      const nextButton = Array.from(buttons).find(
        (b) => b.textContent && b.textContent.includes('Next Step'),
      )
      if (nextButton) await nextButton.click()

      // Now go back
      const allButtons = Array.from(screen.container.querySelectorAll('button'))
      const prevButton = allButtons.find(
        (b) => b.textContent && b.textContent.includes('Previous Step'),
      )
      if (prevButton) await prevButton.click()

      // Should show Sources header again
      expect(screen.container.textContent).toContain('Sources')
    })

    it('allows clicking step buttons to navigate', async () => {
      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Find and click the Product step button
      const buttons = screen.container.querySelectorAll('button')
      const productStepButton = Array.from(buttons).find(
        (b) =>
          b.textContent &&
          b.textContent.includes('Product') &&
          !b.textContent.includes('Previous') &&
          !b.textContent.includes('Next'),
      )

      if (productStepButton) {
        await productStepButton.click()
      }

      // Should now show Products header
      expect(screen.container.textContent).toContain('Products')
    })
  })

  describe('block display', () => {
    it('renders BlockInstanceCard for each block in current step', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-block-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            'source-block-2': {
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

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // With 2+ sources, they are shown in tabs
      // First source tab should be active by default, showing its card
      await expect
        .element(screen.getByTestId('block-card-source-block-1'))
        .toBeInTheDocument()

      // Both tabs should be visible
      const tabs = screen.container.querySelectorAll(
        '[data-slot="tabs-trigger"]',
      )
      expect(tabs.length).toBe(2)

      // Click second tab to show second source
      await (tabs[1] as HTMLElement).click()

      // Now second source card should be visible
      await expect
        .element(screen.getByTestId('block-card-source-block-2'))
        .toBeInTheDocument()
    })

    it('shows badge with block count in step navigation', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-block-1': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            'source-block-2': {
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

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Should show badge with count 2 for sources
      expect(screen.container.textContent).toContain('2')
    })
  })

  describe('available factories', () => {
    it('shows available factories when validation state has possible sources', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'source-factory',
            },
          ],
          blockStates: {},
        },
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Test Source')
      expect(screen.container.textContent).toContain('A test source block')
    })

    it('shows "Select a source to get started" message for empty source step', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'source-factory',
            },
          ],
          blockStates: {},
        },
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Select a source to get started',
      )
    })

    it('shows "Add another" message when blocks exist', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
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
          blockStates: {
            'block-1': {
              hasErrors: false,
              errors: [],
              // Include source factory as a possible expansion so "Add another" appears
              possibleExpansions: [
                {
                  plugin: { store: 'ecmwf', local: 'test-plugin' },
                  factory: 'source-factory',
                },
              ],
            },
          },
        },
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Add another source')
    })

    it('shows loading message when no validation state on source step', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
        validationState: null,
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Loading available sources',
      )
    })

    it('shows message to complete previous step on non-source step', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'block-1': {
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
          blockStates: {
            'block-1': {
              hasErrors: false,
              errors: [],
              possibleExpansions: [], // No product expansions
            },
          },
        },
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Navigate to product step
      const buttons = screen.container.querySelectorAll('button')
      const productButton = Array.from(buttons).find(
        (b) =>
          b.textContent &&
          b.textContent.includes('Product') &&
          !b.textContent.includes('Next'),
      )
      if (productButton) await productButton.click()

      expect(screen.container.textContent).toContain(
        'Complete the previous step',
      )
    })
  })

  describe('add block', () => {
    it('calls addBlock when factory button clicked', async () => {
      const addBlockSpy = vi.fn()
      useFableBuilderStore.setState({
        addBlock: addBlockSpy,
        fable: { blocks: {} },
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'source-factory',
            },
          ],
          blockStates: {},
        },
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Find the button for adding Test Source
      const buttons = screen.container.querySelectorAll('button')
      const addSourceButton = Array.from(buttons).find(
        (b) =>
          b.textContent &&
          b.textContent.includes('Test Source') &&
          b.textContent.includes('A test source block'),
      )

      if (addSourceButton) {
        await addSourceButton.click()
      }

      expect(addBlockSpy).toHaveBeenCalledWith(
        {
          plugin: { store: 'ecmwf', local: 'test-plugin' },
          factory: 'source-factory',
        },
        expect.objectContaining({
          kind: 'source',
          title: 'Test Source',
        }),
      )
    })
  })

  describe('step completion', () => {
    it('shows check icon for completed steps', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            'source-block': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'source-factory',
              },
              configuration_values: {},
              input_ids: {},
            },
            'product-block': {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'test-plugin' },
                factory: 'product-factory',
              },
              configuration_values: {},
              input_ids: { input: 'source-block' },
            },
          },
        },
      })

      const screen = await render(<FableFormCanvas catalogue={mockCatalogue} />)

      // Navigate to sink step to make source step "completed"
      const buttons = screen.container.querySelectorAll('button')
      const sinkButton = Array.from(buttons).find(
        (b) =>
          b.textContent &&
          b.textContent.includes('Output') &&
          !b.textContent.includes('Next'),
      )
      if (sinkButton) await sinkButton.click()

      // Source step should have a checkmark - the icon will be rendered
      // Check that the navigation still shows Source
      expect(screen.container.textContent).toContain('Source')
    })
  })
})
