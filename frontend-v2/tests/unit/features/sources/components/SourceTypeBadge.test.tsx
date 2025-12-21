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
import { SourceTypeBadge } from '@/features/sources/components/SourceTypeBadge'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sourceTypes.model': 'Model',
        'sourceTypes.dataset': 'Dataset',
        'sourceTypes.connector': 'Connector',
      }
      return translations[key] || key
    },
  }),
}))

describe('SourceTypeBadge', () => {
  describe('type display', () => {
    it('renders model type', async () => {
      const screen = await render(<SourceTypeBadge type="model" />)
      await expect.element(screen.getByText('Model')).toBeVisible()
    })

    it('renders dataset type', async () => {
      const screen = await render(<SourceTypeBadge type="dataset" />)
      await expect.element(screen.getByText('Dataset')).toBeVisible()
    })
  })

  describe('size', () => {
    it('renders with default size', async () => {
      const screen = await render(<SourceTypeBadge type="model" />)
      await expect.element(screen.getByText('Model')).toBeVisible()
    })

    it('renders with small size', async () => {
      const screen = await render(<SourceTypeBadge type="model" size="sm" />)
      await expect.element(screen.getByText('Model')).toBeVisible()
    })
  })

  describe('showIcon', () => {
    it('shows icon by default', async () => {
      const screen = await render(<SourceTypeBadge type="model" />)
      await expect.element(screen.getByText('Model')).toBeVisible()
    })

    it('hides icon when showIcon is false', async () => {
      const screen = await render(
        <SourceTypeBadge type="model" showIcon={false} />,
      )
      await expect.element(screen.getByText('Model')).toBeVisible()
    })
  })
})
