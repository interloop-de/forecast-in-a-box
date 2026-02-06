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
import { SaveConfigPopover } from '@/features/fable-builder/components/SaveConfigPopover'

// Use vi.hoisted to declare mock state that's accessible in vi.mock factories
const {
  mockFableState,
  mockMarkSaved,
  mockMutateAsyncState,
  mockIsPendingState,
  mockMetadataState,
  mockSetMetadataStore,
  mockShowToast,
} = vi.hoisted(() => ({
  mockFableState: {
    fable: { blocks: {} } as Fable,
    fableName: 'Untitled Configuration',
    fableId: null as string | null,
  },
  mockMarkSaved: vi.fn(),
  mockMutateAsyncState: { fn: vi.fn() },
  mockIsPendingState: { value: false },
  mockMetadataState: { store: {} as Record<string, unknown> },
  mockSetMetadataStore: vi.fn(),
  mockShowToast: { success: vi.fn(), error: vi.fn() },
}))

// Mock useFableBuilderStore
vi.mock('@/features/fable-builder/stores/fableBuilderStore', () => ({
  useFableBuilderStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) => {
    const state = {
      fable: mockFableState.fable,
      fableName: mockFableState.fableName,
      fableId: mockFableState.fableId,
      markSaved: mockMarkSaved,
    }
    return selector(state)
  },
}))

// Mock useUpsertFable
vi.mock('@/api/hooks/useFable', () => ({
  useUpsertFable: () => ({
    mutateAsync: mockMutateAsyncState.fn,
    isPending: mockIsPendingState.value,
  }),
}))

// Mock useLocalStorage
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => [mockMetadataState.store, mockSetMetadataStore],
}))

// Mock toast
vi.mock('@/lib/toast', () => ({
  showToast: mockShowToast,
}))

// Test catalogue
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
      testTransform: {
        title: 'Test Transform',
        kind: 'transform',
        description: 'A test transform',
        inputs: ['data'],
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

function fableWithBlocks(): Fable {
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
          factory: 'testSource',
        },
        configuration_values: {},
        input_ids: {},
      },
      block3: {
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

describe('SaveConfigPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFableState.fable = fableWithBlocks()
    mockFableState.fableName = 'Untitled Configuration'
    mockFableState.fableId = null
    mockMutateAsyncState.fn = vi.fn().mockResolvedValue('abc-def-123')
    mockIsPendingState.value = false
    mockMetadataState.store = {}
  })

  it('renders trigger button with Save Config text', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await expect.element(screen.getByText('Save Config')).toBeVisible()
  })

  it('opens popover on trigger click', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()

    await expect.element(screen.getByText('Save Configuration')).toBeVisible()
  })

  it('shows correct block summary badges', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()

    await expect.element(screen.getByText('2 sources')).toBeVisible()
    await expect.element(screen.getByText('1 output')).toBeVisible()
  })

  it('title field is empty when fableName is default', async () => {
    mockFableState.fableName = 'Untitled Configuration'

    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()

    await expect.element(screen.getByLabelText('Title')).toHaveValue('')
  })

  it('pre-fills title from non-default fableName', async () => {
    mockFableState.fableName = 'My Custom Config'

    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()

    await expect
      .element(screen.getByLabelText('Title'))
      .toHaveValue('My Custom Config')
  })

  it('calls mutateAsync on Save click', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()
    await screen.getByRole('button', { name: 'Save', exact: true }).click()

    expect(mockMutateAsyncState.fn).toHaveBeenCalledWith({
      fable: mockFableState.fable,
      fableId: undefined,
    })
  })

  it('calls markSaved with user-provided title on success', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()

    // Type a title using the locator API
    await screen.getByLabelText('Title').fill('European forecast run')

    await screen.getByRole('button', { name: 'Save', exact: true }).click()

    // Wait for async save to complete
    await vi.waitFor(() => {
      expect(mockMarkSaved).toHaveBeenCalledWith(
        'abc-def-123',
        'European forecast run',
      )
    })
  })

  it('calls markSaved with generated short title when no title provided', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()
    await screen.getByRole('button', { name: 'Save', exact: true }).click()

    await vi.waitFor(() => {
      // Generated title should be "Config " + first 7 chars of id with dashes stripped
      // ID is "abc-def-123" -> stripped: "abcdef123" -> first 7: "abcdef1"
      expect(mockMarkSaved).toHaveBeenCalledWith(
        'abc-def-123',
        'Config abcdef1',
      )
    })
  })

  it('updates localStorage metadata on success', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()
    await screen.getByRole('button', { name: 'Save', exact: true }).click()

    await vi.waitFor(() => {
      expect(mockSetMetadataStore).toHaveBeenCalledWith(
        expect.objectContaining({
          'abc-def-123': expect.objectContaining({
            title: 'Config abcdef1',
            comments: '',
            summary: { source: 2, transform: 0, product: 0, sink: 1 },
            savedAt: expect.any(String),
          }),
        }),
      )
    })
  })

  it('shows success toast on save', async () => {
    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()
    await screen.getByRole('button', { name: 'Save', exact: true }).click()

    await vi.waitFor(() => {
      expect(mockShowToast.success).toHaveBeenCalledWith('Configuration saved')
    })
  })

  it('shows error toast on failure', async () => {
    mockMutateAsyncState.fn = vi
      .fn()
      .mockRejectedValue(new Error('Network error'))

    const screen = await render(<SaveConfigPopover catalogue={mockCatalogue} />)

    await screen.getByText('Save Config').click()
    await screen.getByRole('button', { name: 'Save', exact: true }).click()

    await vi.waitFor(() => {
      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Failed to save configuration',
        'Network error',
      )
    })
  })

  it('disables trigger button when disabled prop is true', async () => {
    const screen = await render(
      <SaveConfigPopover catalogue={mockCatalogue} disabled />,
    )

    const buttons = screen.container.querySelectorAll('button')
    const saveButton = Array.from(buttons).find((btn) =>
      btn.textContent.includes('Save Config'),
    )
    expect(saveButton).toBeDefined()
    expect(saveButton!.hasAttribute('disabled')).toBe(true)
  })

  describe('update mode (existing fableId)', () => {
    beforeEach(() => {
      mockFableState.fableId = 'existing-id-456'
      mockFableState.fableName = 'My Saved Config'
    })

    it('shows Update Config on trigger when store has fableId', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await expect.element(screen.getByText('Update Config')).toBeVisible()
    })

    it('shows Update Config on trigger when fableId prop is passed', async () => {
      mockFableState.fableId = null

      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} fableId="prop-id" />,
      )

      await expect.element(screen.getByText('Update Config')).toBeVisible()
    })

    it('shows Update Configuration as popover title', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await screen.getByText('Update Config').click()

      await expect
        .element(screen.getByText('Update Configuration'))
        .toBeVisible()
    })

    it('shows Update and Save as New buttons', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await screen.getByText('Update Config').click()

      await expect
        .element(screen.getByRole('button', { name: 'Update', exact: true }))
        .toBeVisible()
      await expect
        .element(screen.getByRole('button', { name: 'Save as New' }))
        .toBeVisible()
    })

    it('passes fableId when Update is clicked', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await screen.getByText('Update Config').click()
      await screen.getByRole('button', { name: 'Update', exact: true }).click()

      await vi.waitFor(() => {
        expect(mockMutateAsyncState.fn).toHaveBeenCalledWith({
          fable: mockFableState.fable,
          fableId: 'existing-id-456',
        })
      })
    })

    it('omits fableId when Save as New is clicked', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await screen.getByText('Update Config').click()
      await screen.getByRole('button', { name: 'Save as New' }).click()

      await vi.waitFor(() => {
        expect(mockMutateAsyncState.fn).toHaveBeenCalledWith({
          fable: mockFableState.fable,
          fableId: undefined,
        })
      })
    })

    it('shows correct toast for Save as New', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await screen.getByText('Update Config').click()
      await screen.getByRole('button', { name: 'Save as New' }).click()

      await vi.waitFor(() => {
        expect(mockShowToast.success).toHaveBeenCalledWith(
          'Configuration saved as new',
        )
      })
    })

    it('shows correct toast for Update', async () => {
      const screen = await render(
        <SaveConfigPopover catalogue={mockCatalogue} />,
      )

      await screen.getByText('Update Config').click()
      await screen.getByRole('button', { name: 'Update', exact: true }).click()

      await vi.waitFor(() => {
        expect(mockShowToast.success).toHaveBeenCalledWith(
          'Configuration saved',
        )
      })
    })
  })
})
