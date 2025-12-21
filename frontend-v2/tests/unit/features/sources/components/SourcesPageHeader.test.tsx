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
import { SourcesPageHeader } from '@/features/sources/components/SourcesPageHeader'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        title: 'Data Sources',
        subtitle: 'Manage AI models and datasets for your forecasts.',
      }
      return translations[key] || key
    },
  }),
}))

describe('SourcesPageHeader', () => {
  describe('rendering', () => {
    it('renders title', async () => {
      const screen = await render(<SourcesPageHeader />)
      await expect.element(screen.getByText('Data Sources')).toBeVisible()
    })

    it('renders subtitle', async () => {
      const screen = await render(<SourcesPageHeader />)
      await expect
        .element(
          screen.getByText('Manage AI models and datasets for your forecasts.'),
        )
        .toBeVisible()
    })

    it('renders as h1 element', async () => {
      const screen = await render(<SourcesPageHeader />)
      const heading = screen.container.querySelector('h1')
      expect(heading).not.toBeNull()
      expect(heading?.textContent).toBe('Data Sources')
    })

    it('renders subtitle as paragraph', async () => {
      const screen = await render(<SourcesPageHeader />)
      const paragraph = screen.container.querySelector('p')
      expect(paragraph).not.toBeNull()
      expect(paragraph?.textContent).toBe(
        'Manage AI models and datasets for your forecasts.',
      )
    })
  })
})
