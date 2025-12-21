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
import { PluginsPageHeader } from '@/features/plugins/components/PluginsPageHeader'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        title: 'Plugin Store',
        subtitle: 'Browse and manage plugins for your application.',
        'actions.checkUpdates': 'Check Updates',
      }
      return translations[key] || key
    },
  }),
}))

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: string
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}))

describe('PluginsPageHeader', () => {
  const mockOnCheckUpdates = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders title', async () => {
      const screen = await render(
        <PluginsPageHeader onCheckUpdates={mockOnCheckUpdates} />,
      )
      await expect.element(screen.getByText('Plugin Store')).toBeVisible()
    })

    it('renders subtitle', async () => {
      const screen = await render(
        <PluginsPageHeader onCheckUpdates={mockOnCheckUpdates} />,
      )
      await expect
        .element(
          screen.getByText('Browse and manage plugins for your application.'),
        )
        .toBeVisible()
    })

    it('renders Check Updates button', async () => {
      const screen = await render(
        <PluginsPageHeader onCheckUpdates={mockOnCheckUpdates} />,
      )
      await expect.element(screen.getByText('Check Updates')).toBeVisible()
    })
  })

  describe('check updates button', () => {
    it('calls onCheckUpdates when button is clicked', async () => {
      const screen = await render(
        <PluginsPageHeader onCheckUpdates={mockOnCheckUpdates} />,
      )
      const button = screen.getByTestId('button')
      await button.click()
      expect(mockOnCheckUpdates).toHaveBeenCalledTimes(1)
    })

    it('disables button when isCheckingUpdates is true', async () => {
      const screen = await render(
        <PluginsPageHeader
          onCheckUpdates={mockOnCheckUpdates}
          isCheckingUpdates={true}
        />,
      )
      const button = screen.getByTestId('button').element() as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })

    it('enables button when isCheckingUpdates is false', async () => {
      const screen = await render(
        <PluginsPageHeader
          onCheckUpdates={mockOnCheckUpdates}
          isCheckingUpdates={false}
        />,
      )
      const button = screen.getByTestId('button').element() as HTMLButtonElement
      expect(button.disabled).toBe(false)
    })
  })
})
