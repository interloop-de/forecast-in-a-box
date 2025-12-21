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
        'status.active': 'Active',
        'status.disabled': 'Disabled',
        'status.uninstalled': 'Uninstalled',
        'status.updateAvailable': 'Update Available',
        'status.incompatible': 'Incompatible',
      }
      return translations[key] || key
    },
  }),
}))

describe('PluginStatusBadge', () => {
  describe('status display', () => {
    it('renders active status', async () => {
      const screen = await render(<PluginStatusBadge status="active" />)
      await expect.element(screen.getByText('Active')).toBeVisible()
    })

    it('renders disabled status', async () => {
      const screen = await render(<PluginStatusBadge status="disabled" />)
      await expect.element(screen.getByText('Disabled')).toBeVisible()
    })

    it('renders uninstalled status', async () => {
      const screen = await render(<PluginStatusBadge status="uninstalled" />)
      await expect.element(screen.getByText('Uninstalled')).toBeVisible()
    })

    it('renders update_available status', async () => {
      const screen = await render(
        <PluginStatusBadge status="update_available" />,
      )
      await expect.element(screen.getByText('Update Available')).toBeVisible()
    })

    it('renders incompatible status', async () => {
      const screen = await render(<PluginStatusBadge status="incompatible" />)
      await expect.element(screen.getByText('Incompatible')).toBeVisible()
    })
  })

  describe('className', () => {
    it('accepts custom className', async () => {
      const screen = await render(
        <PluginStatusBadge status="active" className="custom-class" />,
      )
      await expect.element(screen.getByText('Active')).toBeVisible()
    })
  })
})
