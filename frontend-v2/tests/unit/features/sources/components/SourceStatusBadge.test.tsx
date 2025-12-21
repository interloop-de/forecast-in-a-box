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
import { SourceStatusBadge } from '@/features/sources/components/SourceStatusBadge'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'status.ready': 'Ready',
        'status.available': 'Available',
        'status.downloading': 'Downloading',
        'status.configuring': 'Configuring',
        'status.error': 'Error',
        'status.disabled': 'Disabled',
        'card.downloadProgress': `Downloading ${params?.progress ?? 0}%`,
      }
      return translations[key] || key
    },
  }),
}))

describe('SourceStatusBadge', () => {
  describe('status display', () => {
    it('renders ready status', async () => {
      const screen = await render(<SourceStatusBadge status="ready" />)
      await expect.element(screen.getByText('Ready')).toBeVisible()
    })

    it('renders available status', async () => {
      const screen = await render(<SourceStatusBadge status="available" />)
      await expect.element(screen.getByText('Available')).toBeVisible()
    })

    it('renders downloading status', async () => {
      const screen = await render(<SourceStatusBadge status="downloading" />)
      await expect.element(screen.getByText('Downloading')).toBeVisible()
    })

    it('renders configuring status', async () => {
      const screen = await render(<SourceStatusBadge status="configuring" />)
      await expect.element(screen.getByText('Configuring')).toBeVisible()
    })

    it('renders error status', async () => {
      const screen = await render(<SourceStatusBadge status="error" />)
      await expect.element(screen.getByText('Error')).toBeVisible()
    })

    it('renders disabled status', async () => {
      const screen = await render(<SourceStatusBadge status="disabled" />)
      await expect.element(screen.getByText('Disabled')).toBeVisible()
    })
  })

  describe('download progress', () => {
    it('shows download progress when downloading', async () => {
      const screen = await render(
        <SourceStatusBadge status="downloading" downloadProgress={45} />,
      )
      await expect.element(screen.getByText('Downloading 45%')).toBeVisible()
    })

    it('rounds download progress', async () => {
      const screen = await render(
        <SourceStatusBadge status="downloading" downloadProgress={67.8} />,
      )
      await expect.element(screen.getByText('Downloading 68%')).toBeVisible()
    })
  })
})
