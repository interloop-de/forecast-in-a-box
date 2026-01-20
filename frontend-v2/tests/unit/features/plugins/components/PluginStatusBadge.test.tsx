/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { PluginStatusBadge } from '@/features/plugins/components/PluginStatusBadge'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'status.loaded': 'Loaded',
        'status.disabled': 'Disabled',
        'status.available': 'Available',
        'status.errored': 'Errored',
      }
      return translations[key] || key
    },
  }),
}))

describe('PluginStatusBadge', () => {
  describe('status display', () => {
    it('renders loaded status', async () => {
      const screen = await render(<PluginStatusBadge status="loaded" />)
      await expect.element(screen.getByText('Loaded')).toBeVisible()
    })

    it('renders disabled status', async () => {
      const screen = await render(<PluginStatusBadge status="disabled" />)
      await expect.element(screen.getByText('Disabled')).toBeVisible()
    })

    it('renders available status', async () => {
      const screen = await render(<PluginStatusBadge status="available" />)
      await expect.element(screen.getByText('Available')).toBeVisible()
    })

    it('renders errored status', async () => {
      const screen = await render(<PluginStatusBadge status="errored" />)
      await expect.element(screen.getByText('Errored')).toBeVisible()
    })
  })

  describe('className', () => {
    it('accepts custom className', async () => {
      const screen = await render(
        <PluginStatusBadge status="loaded" className="custom-class" />,
      )
      await expect.element(screen.getByText('Loaded')).toBeVisible()
    })
  })
})
