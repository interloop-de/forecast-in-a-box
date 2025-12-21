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
import { StatusBadge } from '@/features/status/components/StatusBadge'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'status.up': 'Up',
        'status.down': 'Down',
        'status.off': 'Off',
      }
      return translations[key] || key
    },
  }),
}))

describe('StatusBadge', () => {
  describe('status display', () => {
    it('renders up status', async () => {
      const screen = await render(<StatusBadge status="up" />)
      await expect.element(screen.getByText('Up')).toBeVisible()
    })

    it('renders down status', async () => {
      const screen = await render(<StatusBadge status="down" />)
      await expect.element(screen.getByText('Down')).toBeVisible()
    })

    it('renders off status', async () => {
      const screen = await render(<StatusBadge status="off" />)
      await expect.element(screen.getByText('Off')).toBeVisible()
    })

    it('renders unknown status as uppercase', async () => {
      const screen = await render(<StatusBadge status="unknown" />)
      await expect.element(screen.getByText('UNKNOWN')).toBeVisible()
    })
  })

  describe('case insensitivity', () => {
    it('handles uppercase UP', async () => {
      const screen = await render(<StatusBadge status="UP" />)
      await expect.element(screen.getByText('Up')).toBeVisible()
    })

    it('handles mixed case Down', async () => {
      const screen = await render(<StatusBadge status="Down" />)
      await expect.element(screen.getByText('Down')).toBeVisible()
    })
  })

  describe('className', () => {
    it('accepts custom className', async () => {
      const screen = await render(
        <StatusBadge status="up" className="custom-class" />,
      )
      await expect.element(screen.getByText('Up')).toBeVisible()
    })
  })
})
