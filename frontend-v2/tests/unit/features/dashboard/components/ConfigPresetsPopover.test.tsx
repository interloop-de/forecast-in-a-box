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
import type { FableMetadataStore } from '@/features/fable-builder/components/SaveConfigPopover'
import { ConfigPresetsPopover } from '@/features/dashboard/components/ConfigPresetsPopover'

// Use vi.hoisted for mock state accessible in vi.mock factories
const { mockMetadataState, mockSetMetadataStore } = vi.hoisted(() => ({
  mockMetadataState: { store: {} as FableMetadataStore },
  mockSetMetadataStore: vi.fn(),
}))

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'welcome.actions.myPresets': 'My Configuration Presets',
      }
      return translations[key] || key
    },
  }),
}))

// Mock useLocalStorage
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: () => [mockMetadataState.store, mockSetMetadataStore],
}))

// Mock Link component - builds href from to + search params
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    search,
    ...props
  }: {
    children: React.ReactNode
    to?: string
    search?: Record<string, string>
    className?: string
  }) => {
    let href = to || ''
    if (search) {
      const params = new URLSearchParams(search)
      href = `${href}?${params.toString()}`
    }
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

describe('ConfigPresetsPopover', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMetadataState.store = {}
  })

  it('renders trigger button with correct text', async () => {
    const screen = await render(<ConfigPresetsPopover />)

    await expect
      .element(screen.getByText('My Configuration Presets'))
      .toBeVisible()
  })

  it('opens popover on click', async () => {
    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    // Popover title should appear (same text but within PopoverTitle)
    const elements = screen.getByText('My Configuration Presets')
    await expect.element(elements.first()).toBeVisible()
  })

  it('shows empty state when no presets in localStorage', async () => {
    mockMetadataState.store = {}

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    await expect
      .element(screen.getByText('No saved configurations yet'))
      .toBeVisible()
    await expect
      .element(
        screen.getByText(
          'Save a configuration from the Fable Builder to see it here.',
        ),
      )
      .toBeVisible()
  })

  it('lists presets with title', async () => {
    mockMetadataState.store = {
      'fable-1': {
        title: 'European Forecast',
        comments: '',
        summary: { source: 1, transform: 0, product: 2, sink: 0 },
        savedAt: new Date().toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    await expect.element(screen.getByText('European Forecast')).toBeVisible()
  })

  it('shows block summary badges', async () => {
    mockMetadataState.store = {
      'fable-1': {
        title: 'Test Config',
        comments: '',
        summary: { source: 2, transform: 1, product: 0, sink: 1 },
        savedAt: new Date().toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    await expect.element(screen.getByText('2 sources')).toBeVisible()
    await expect.element(screen.getByText('1 transform')).toBeVisible()
    await expect.element(screen.getByText('1 output')).toBeVisible()
  })

  it('shows comments when present', async () => {
    mockMetadataState.store = {
      'fable-1': {
        title: 'Test Config',
        comments: 'Testing the new setup',
        summary: { source: 1, transform: 0, product: 0, sink: 0 },
        savedAt: new Date().toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    await expect
      .element(screen.getByText('Testing the new setup'))
      .toBeVisible()
  })

  it('shows relative time', async () => {
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    mockMetadataState.store = {
      'fable-1': {
        title: 'Old Config',
        comments: '',
        summary: { source: 1, transform: 0, product: 0, sink: 0 },
        savedAt: twoDaysAgo.toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    await expect.element(screen.getByText('2 days ago')).toBeVisible()
  })

  it('each preset has a Load link pointing to /configure/{fableId}', async () => {
    mockMetadataState.store = {
      'fable-abc-123': {
        title: 'My Config',
        comments: '',
        summary: { source: 1, transform: 0, product: 0, sink: 0 },
        savedAt: new Date().toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    const loadLink = screen.getByText('Load')
    await expect.element(loadLink).toBeVisible()

    // Verify it links to the correct route (popover content renders in a portal)
    const anchor = document.querySelector(
      'a[href="/configure?fableId=fable-abc-123"]',
    )
    expect(anchor).not.toBeNull()
  })

  it('sorts presets by most recently saved first', async () => {
    const older = new Date('2026-01-01T00:00:00Z')
    const newer = new Date('2026-02-01T00:00:00Z')

    mockMetadataState.store = {
      'fable-old': {
        title: 'Old Config',
        comments: '',
        summary: { source: 1, transform: 0, product: 0, sink: 0 },
        savedAt: older.toISOString(),
      },
      'fable-new': {
        title: 'New Config',
        comments: '',
        summary: { source: 2, transform: 0, product: 0, sink: 0 },
        savedAt: newer.toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    await screen.getByText('My Configuration Presets').click()

    // Both should be visible
    await expect.element(screen.getByText('New Config')).toBeVisible()
    await expect.element(screen.getByText('Old Config')).toBeVisible()

    // New Config should appear first in the DOM (popover renders in a portal)
    const titles = document.querySelectorAll('.font-medium')
    const titleTexts = Array.from(titles)
      .map((el) => el.textContent)
      .filter((t) => t === 'New Config' || t === 'Old Config')
    expect(titleTexts[0]).toBe('New Config')
    expect(titleTexts[1]).toBe('Old Config')
  })

  it('deletes a preset via the three-dot menu', async () => {
    mockMetadataState.store = {
      'fable-1': {
        title: 'Config to Delete',
        comments: '',
        summary: { source: 1, transform: 0, product: 0, sink: 0 },
        savedAt: new Date().toISOString(),
      },
    }

    const screen = await render(<ConfigPresetsPopover />)

    // Open the popover
    await screen.getByText('My Configuration Presets').click()
    await expect.element(screen.getByText('Config to Delete')).toBeVisible()

    // Click the three-dot menu trigger
    const menuTrigger = document.querySelector(
      '[data-slot="dropdown-menu-trigger"]',
    ) as HTMLElement
    expect(menuTrigger).not.toBeNull()
    menuTrigger.click()

    // Click Delete in the dropdown
    await screen.getByRole('menuitem', { name: 'Delete' }).click()

    // Verify setMetadataStore was called without the deleted entry
    expect(mockSetMetadataStore).toHaveBeenCalledWith({})
  })
})
