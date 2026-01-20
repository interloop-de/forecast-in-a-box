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
import { ConfigSummaryCard } from '@/features/fable-builder/components/review/ConfigSummaryCard'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

const mockCatalogue: BlockFactoryCatalogue = {
  'ecmwf/test-plugin': {
    factories: {
      'source-factory': {
        kind: 'source',
        title: 'Test Source',
        description: 'A test source block',
        configuration_options: {
          option1: {
            title: 'Option 1',
            description: 'First option',
            value_type: 'string',
          },
          option2: {
            title: 'Option 2',
            description: 'Second option',
            value_type: 'string',
          },
        },
        inputs: [],
      },
      'transform-factory': {
        kind: 'transform',
        title: 'Test Transform',
        description: 'A test transform block',
        configuration_options: {},
        inputs: ['input'],
      },
    },
  },
}

describe('ConfigSummaryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useFableBuilderStore.setState({
      fable: {
        blocks: {
          'block-1': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'source-factory',
            },
            configuration_values: { option1: 'value1', option2: '' },
            input_ids: {},
          },
          'block-2': {
            factory_id: {
              plugin: { store: 'ecmwf', local: 'test-plugin' },
              factory: 'transform-factory',
            },
            configuration_values: {},
            input_ids: { input: 'block-1' },
          },
        },
      },
      validationState: null,
      isValidating: false,
    })
  })

  afterEach(() => {
    useFableBuilderStore.setState({
      validationState: null,
      isValidating: false,
    })
  })

  describe('rendering', () => {
    it('renders factory title', async () => {
      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Test Source')
    })

    it('renders configured values', async () => {
      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Option 1')
      expect(screen.container.textContent).toContain('value1')
    })

    it('does not render empty configuration values', async () => {
      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      // option2 is empty string, should not be shown
      const text = screen.container.textContent || ''
      const option2Count = (text.match(/Option 2/g) ?? []).length
      expect(option2Count).toBe(0)
    })

    it('shows default configuration message when no values configured', async () => {
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

      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Default configuration')
    })

    it('returns null for unknown factory', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            unknown: {
              factory_id: {
                plugin: { store: 'ecmwf', local: 'unknown' },
                factory: 'unknown',
              },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <ConfigSummaryCard instanceId="unknown" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toBe('')
    })
  })

  describe('connected inputs', () => {
    it('shows connected block for inputs', async () => {
      const screen = await render(
        <ConfigSummaryCard instanceId="block-2" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('input')
      expect(screen.container.textContent).toContain('Test Source')
    })

    it('does not show inputs section when no inputs connected', async () => {
      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      // Source factory has no inputs
      expect(screen.container.textContent).not.toContain('input:')
    })
  })

  describe('validation errors', () => {
    it('shows error badge when block has errors', async () => {
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
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'block-1': {
              hasErrors: true,
              errors: ['Missing required value'],
              possibleExpansions: [],
            },
          },
        },
      })

      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('1')
    })

    it('shows error messages', async () => {
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
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'block-1': {
              hasErrors: true,
              errors: ['Missing required value', 'Invalid format'],
              possibleExpansions: [],
            },
          },
        },
      })

      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      expect(screen.container.textContent).toContain('Missing required value')
      expect(screen.container.textContent).toContain('Invalid format')
    })

    it('applies destructive border when has errors', async () => {
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
          isValid: false,
          globalErrors: [],
          possibleSources: [],
          blockStates: {
            'block-1': {
              hasErrors: true,
              errors: ['Error'],
              possibleExpansions: [],
            },
          },
        },
      })

      const screen = await render(
        <ConfigSummaryCard instanceId="block-1" catalogue={mockCatalogue} />,
      )

      const card = screen.container.querySelector('.border-destructive')
      expect(card).toBeTruthy()
    })
  })
})
