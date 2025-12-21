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
import { BlockPalette } from '@/features/fable-builder/components/layout/BlockPalette'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock Collapsible components
vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open: boolean
    onOpenChange?: () => void
  }) => (
    <div data-testid="collapsible" data-open={open}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <button data-testid="collapsible-trigger" className={className}>
      {children}
    </button>
  ),
  CollapsibleContent: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="collapsible-content" className={className}>
      {children}
    </div>
  ),
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'test-plugin': {
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
      'sink-factory': {
        kind: 'sink',
        title: 'Test Output',
        description: 'A test output block',
        configuration_options: {},
        inputs: ['data'],
      },
    },
  },
  'another-plugin': {
    factories: {
      'another-source': {
        kind: 'source',
        title: 'Another Source',
        description: 'Another source block',
        configuration_options: {},
        inputs: [],
      },
    },
  },
}

describe('BlockPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: { blocks: {} },
      validationState: null,
      isValidating: false,
    })
  })

  afterEach(() => {
    useFableBuilderStore.getState().reset()
  })

  describe('rendering', () => {
    it('renders title', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Block Palette')
    })

    it('renders search input', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      const searchInput = screen.container.querySelector('input[type="search"]')
      expect(searchInput).toBeTruthy()
      expect(searchInput?.getAttribute('placeholder')).toBe('Search blocks...')
    })

    it('renders collapsible sections for each block kind', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // Check for section labels (singular labels as defined in BLOCK_KIND_METADATA)
      expect(screen.container.textContent).toContain('Source')
      expect(screen.container.textContent).toContain('Transform')
      expect(screen.container.textContent).toContain('Output')
    })

    it('renders factory items', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Test Source')
      expect(screen.container.textContent).toContain('Test Transform')
      expect(screen.container.textContent).toContain('Test Output')
      expect(screen.container.textContent).toContain('Another Source')
    })

    it('shows factory descriptions', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('A test source block')
      expect(screen.container.textContent).toContain('A test transform block')
    })
  })

  describe('search functionality', () => {
    it('filters factories by title', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // Type in search
      await screen.getByPlaceholder('Search blocks...').fill('Transform')

      // Should show matching factories
      expect(screen.container.textContent).toContain('Test Transform')
      // Should not show non-matching factories
      expect(screen.container.textContent).not.toContain('Test Source')
      expect(screen.container.textContent).not.toContain('Test Output')
    })

    it('filters factories by description', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      await screen.getByPlaceholder('Search blocks...').fill('output block')

      expect(screen.container.textContent).toContain('Test Output')
      expect(screen.container.textContent).not.toContain('Test Source')
    })

    it('shows empty state for sections with no matches', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      await screen.getByPlaceholder('Search blocks...').fill('nonexistent')

      // All sections should be hidden since no factories match
      const buttons = screen.container.querySelectorAll('button')
      const factoryButtons = Array.from(buttons).filter(
        (b) =>
          !b.classList.contains('collapsible-trigger') &&
          !b.hasAttribute('data-testid'),
      )
      // No factory buttons should be visible
      expect(factoryButtons.length).toBe(0)
    })

    it('is case insensitive', async () => {
      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      await screen.getByPlaceholder('Search blocks...').fill('TEST SOURCE')

      expect(screen.container.textContent).toContain('Test Source')
    })
  })

  describe('factory availability', () => {
    it('shows all factories as available when no validation state', async () => {
      useFableBuilderStore.setState({ validationState: null })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // All factory buttons should be enabled
      const buttons = screen.container.querySelectorAll('button')
      const factoryButtons = Array.from(buttons).filter((b) =>
        b.textContent.includes('Test'),
      )
      factoryButtons.forEach((button) => {
        expect(button.disabled).toBe(false)
      })
    })

    it('shows sources as available when fable is empty with validation state', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [
            { plugin: 'test-plugin', factory: 'source-factory' },
          ],
          blockStates: {},
        },
      })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // Source should be available
      expect(screen.container.textContent).toContain('Test Source')
    })

    it('disables factories during validation', async () => {
      useFableBuilderStore.setState({ isValidating: true })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // All factory buttons should be disabled during validation
      const buttons = screen.container.querySelectorAll('button')
      const factoryButtons = Array.from(buttons).filter((b) =>
        b.textContent.includes('Test Source'),
      )
      factoryButtons.forEach((button) => {
        expect(button.disabled).toBe(true)
      })
    })
  })

  describe('footer status', () => {
    it('shows loading message during validation', async () => {
      useFableBuilderStore.setState({ isValidating: true })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Loading available blocks...',
      )
    })

    it('shows instruction for empty fable', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
        isValidating: false,
      })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain(
        'Click a source to get started',
      )
    })

    it('shows add instruction when blocks exist', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            block1: {
              factory_id: { plugin: 'test', factory: 'test' },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
        isValidating: false,
      })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      expect(screen.container.textContent).toContain('Click to add blocks')
    })
  })

  describe('add block interaction', () => {
    it('calls addBlock when factory is clicked', async () => {
      const addBlockSpy = vi.fn()
      useFableBuilderStore.setState({
        addBlock: addBlockSpy,
        validationState: null,
        isValidating: false,
      })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // Find and click the Test Source button
      const buttons = screen.container.querySelectorAll('button')
      const sourceButton = Array.from(buttons).find(
        (b) =>
          b.textContent.includes('Test Source') &&
          b.textContent.includes('A test source block'),
      )

      if (sourceButton) {
        await sourceButton.click()
      }

      expect(addBlockSpy).toHaveBeenCalledWith(
        { plugin: 'test-plugin', factory: 'source-factory' },
        expect.objectContaining({
          kind: 'source',
          title: 'Test Source',
        }),
      )
    })

    it('does not call addBlock when factory is disabled', async () => {
      const addBlockSpy = vi.fn()
      useFableBuilderStore.setState({
        addBlock: addBlockSpy,
        isValidating: true, // Disables all buttons
      })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      const buttons = screen.container.querySelectorAll('button')
      const sourceButton = Array.from(buttons).find(
        (b) =>
          b.textContent.includes('Test Source') &&
          b.textContent.includes('A test source block'),
      )

      if (sourceButton) {
        await sourceButton.click()
      }

      expect(addBlockSpy).not.toHaveBeenCalled()
    })
  })

  describe('badge counts', () => {
    it('shows total factory count in section badge when no validation', async () => {
      useFableBuilderStore.setState({ validationState: null })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // Sources section should show 2 (Test Source + Another Source)
      expect(screen.container.textContent).toContain('2')
      expect(screen.container.textContent).toContain('1')
    })

    it('shows available/total count when validation state exists', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
        validationState: {
          isValid: true,
          globalErrors: [],
          possibleSources: [
            { plugin: 'test-plugin', factory: 'source-factory' },
          ],
          blockStates: {},
        },
      })

      const screen = await render(<BlockPalette catalogue={mockCatalogue} />)

      // Should show "1/2" for sources (1 available out of 2)
      expect(screen.container.textContent).toContain('1/2')
    })
  })
})
