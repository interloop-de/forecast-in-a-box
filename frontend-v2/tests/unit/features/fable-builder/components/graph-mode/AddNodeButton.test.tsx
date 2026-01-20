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
import type { BlockFactoryCatalogue } from '@/api/types/fable.types'
import { AddNodeButton } from '@/features/fable-builder/components/graph-mode/AddNodeButton'

// Mock state
let mockLayoutDirection = 'TB'
const mockAddBlock = vi.fn().mockReturnValue('new-block-id')
const mockConnectBlocks = vi.fn()

// Mock useFableBuilderStore
vi.mock('@/features/fable-builder/stores/fableBuilderStore', () => ({
  useFableBuilderStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) => {
    const state = {
      addBlock: mockAddBlock,
      connectBlocks: mockConnectBlocks,
      layoutDirection: mockLayoutDirection,
    }
    return selector(state)
  },
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'ecmwf/test-plugin': {
    factories: {
      'model-factory': {
        kind: 'transform',
        title: 'Test Model',
        description: 'A test model block',
        inputs: ['data'],
        configuration_options: {},
      },
      'data-factory': {
        kind: 'source',
        title: 'Test Data',
        description: 'A test data source',
        inputs: [],
        configuration_options: {},
      },
    },
  },
}

describe('AddNodeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLayoutDirection = 'TB'
    mockAddBlock.mockReturnValue('new-block-id')
  })

  describe('rendering', () => {
    it('renders add button when expansions available', async () => {
      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'model-factory',
            },
          ]}
          catalogue={mockCatalogue}
        />,
      )

      const button = screen.container.querySelector('button')
      expect(button).toBeTruthy()
    })

    it('does not render when no expansions', async () => {
      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[]}
          catalogue={mockCatalogue}
        />,
      )

      const button = screen.container.querySelector('button')
      expect(button).toBeFalsy()
    })

    it('renders Plus icon', async () => {
      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'model-factory',
            },
          ]}
          catalogue={mockCatalogue}
        />,
      )

      // Should contain SVG with plus icon
      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })
  })

  describe('layout positioning', () => {
    it('positions button for TB layout', async () => {
      mockLayoutDirection = 'TB'

      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'model-factory',
            },
          ]}
          catalogue={mockCatalogue}
        />,
      )

      const button = screen.container.querySelector('button')
      expect(button?.classList.contains('-bottom-4')).toBe(true)
    })

    it('positions button for LR layout', async () => {
      mockLayoutDirection = 'LR'

      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'model-factory',
            },
          ]}
          catalogue={mockCatalogue}
        />,
      )

      const button = screen.container.querySelector('button')
      expect(button?.classList.contains('-right-4')).toBe(true)
    })
  })

  describe('popover', () => {
    it('opens popover on button click', async () => {
      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'model-factory',
            },
          ]}
          catalogue={mockCatalogue}
        />,
      )

      const button = screen.container.querySelector('button')
      await button?.click()

      // Popover should be open with search input
      await expect
        .element(screen.getByPlaceholder('Search blocks...'))
        .toBeVisible()
    })

    it('shows no blocks found when search has no matches', async () => {
      const screen = await render(
        <AddNodeButton
          sourceBlockId="source-1"
          possibleExpansions={[
            {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'model-factory',
            },
          ]}
          catalogue={mockCatalogue}
        />,
      )

      const button = screen.container.querySelector('button')
      await button?.click()

      const searchInput = screen.getByPlaceholder('Search blocks...')
      await searchInput.fill('nonexistent')

      await expect.element(screen.getByText('No blocks found')).toBeVisible()
    })
  })
})
