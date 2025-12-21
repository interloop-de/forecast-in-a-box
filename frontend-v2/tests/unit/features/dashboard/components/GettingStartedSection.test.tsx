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
import { GettingStartedSection } from '@/features/dashboard/components/GettingStartedSection'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'gettingStarted.title': 'Getting Started',
        'gettingStarted.subtitle': 'Choose how you want to start your forecast',
        'gettingStarted.quickStart.title': 'Quick Start',
        'gettingStarted.quickStart.description':
          'Start a forecast with default settings',
        'gettingStarted.quickStart.tags.model': 'AIFS',
        'gettingStarted.quickStart.tags.time': '72h',
        'gettingStarted.quickStart.tags.products': '4 Products',
        'gettingStarted.standard.title': 'Standard Forecast',
        'gettingStarted.standard.description': 'Configure a standard forecast',
        'gettingStarted.standard.tags.model': 'Any Model',
        'gettingStarted.standard.tags.time': 'Custom Time',
        'gettingStarted.standard.tags.config': 'Full Config',
        'gettingStarted.customModel.title': 'Custom Model',
        'gettingStarted.customModel.description':
          'Use canvas to build custom pipeline',
        'gettingStarted.customModel.tags.canvas': 'Canvas',
        'gettingStarted.customModel.tags.control': 'Full Control',
        'gettingStarted.customModel.tags.advanced': 'Advanced',
        'gettingStarted.dataset.title': 'Dataset Forecast',
        'gettingStarted.dataset.description': 'Start with prepared dataset',
        'gettingStarted.dataset.tags.data': 'Your Data',
        'gettingStarted.dataset.tags.source': 'Any Source',
        'gettingStarted.dataset.tags.ready': 'Production Ready',
      }
      return translations[key] || key
    },
  }),
}))

// Track navigation calls
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock GettingStartedCard
vi.mock('@/features/dashboard/components/GettingStartedCard', () => ({
  GettingStartedCard: ({
    title,
    description,
    tags,
    isRecommended,
    onClick,
  }: {
    title: string
    description: string
    tags: Array<string>
    isRecommended?: boolean
    onClick: () => void
  }) => (
    <div
      data-testid={`card-${title.toLowerCase().replace(/\s/g, '-')}`}
      data-recommended={isRecommended}
      onClick={onClick}
    >
      <span data-testid="card-title">{title}</span>
      <span data-testid="card-description">{description}</span>
      <div data-testid="card-tags">
        {tags.map((tag, i) => (
          <span key={i}>{tag}</span>
        ))}
      </div>
    </div>
  ),
}))

describe('GettingStartedSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders section title', async () => {
      const screen = await render(<GettingStartedSection />)

      await expect.element(screen.getByText('Getting Started')).toBeVisible()
    })

    it('renders section subtitle', async () => {
      const screen = await render(<GettingStartedSection />)

      await expect
        .element(screen.getByText('Choose how you want to start your forecast'))
        .toBeVisible()
    })

    it('renders quick start card', async () => {
      const screen = await render(<GettingStartedSection />)

      await expect.element(screen.getByTestId('card-quick-start')).toBeVisible()
      await expect.element(screen.getByText('Quick Start')).toBeVisible()
    })

    it('renders standard forecast card', async () => {
      const screen = await render(<GettingStartedSection />)

      await expect
        .element(screen.getByTestId('card-standard-forecast'))
        .toBeVisible()
    })

    it('renders custom model card', async () => {
      const screen = await render(<GettingStartedSection />)

      await expect
        .element(screen.getByTestId('card-custom-model'))
        .toBeVisible()
    })

    it('renders dataset forecast card', async () => {
      const screen = await render(<GettingStartedSection />)

      await expect
        .element(screen.getByTestId('card-dataset-forecast'))
        .toBeVisible()
    })

    it('marks quick start card as recommended', async () => {
      const screen = await render(<GettingStartedSection />)

      const quickStartCard = screen.getByTestId('card-quick-start')
      expect(quickStartCard.element().getAttribute('data-recommended')).toBe(
        'true',
      )
    })
  })

  describe('navigation', () => {
    it('navigates to configure with quick-start preset when quick start is clicked', async () => {
      const screen = await render(<GettingStartedSection />)

      const quickStartCard = screen.getByTestId('card-quick-start')
      await quickStartCard.click()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'quick-start' },
      })
    })

    it('navigates to configure with standard preset when standard is clicked', async () => {
      const screen = await render(<GettingStartedSection />)

      const standardCard = screen.getByTestId('card-standard-forecast')
      await standardCard.click()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'standard' },
      })
    })

    it('navigates to configure with custom-model preset when custom model is clicked', async () => {
      const screen = await render(<GettingStartedSection />)

      const customModelCard = screen.getByTestId('card-custom-model')
      await customModelCard.click()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'custom-model' },
      })
    })

    it('navigates to configure with dataset preset when dataset is clicked', async () => {
      const screen = await render(<GettingStartedSection />)

      const datasetCard = screen.getByTestId('card-dataset-forecast')
      await datasetCard.click()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'dataset' },
      })
    })
  })

  describe('variants', () => {
    it('renders with card wrapper by default', async () => {
      const screen = await render(<GettingStartedSection />)

      // Default variant wraps in Card which has p-8 class
      const card = screen.container.querySelector('.p-8')
      expect(card).not.toBeNull()
    })

    it('renders without card wrapper in modern variant', async () => {
      const screen = await render(<GettingStartedSection variant="modern" />)

      // Modern variant has space-y-6 class on wrapper div
      const wrapper = screen.container.querySelector('.space-y-6')
      expect(wrapper).not.toBeNull()
    })
  })
})
