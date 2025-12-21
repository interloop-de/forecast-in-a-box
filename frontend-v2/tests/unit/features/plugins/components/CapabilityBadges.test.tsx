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
import type { PluginCapability } from '@/api/types/plugins.types'
import { CapabilityBadges } from '@/features/plugins/components/CapabilityBadges'

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'filters.capability.source': 'Source',
        'filters.capability.transform': 'Transform',
        'filters.capability.product': 'Product',
        'filters.capability.sink': 'Sink',
      }
      return translations[key] || key
    },
  }),
}))

describe('CapabilityBadges', () => {
  describe('rendering', () => {
    it('renders nothing when capabilities array is empty', async () => {
      const screen = await render(<CapabilityBadges capabilities={[]} />)
      expect(screen).toBeDefined()
    })

    it('renders source capability', async () => {
      const screen = await render(
        <CapabilityBadges capabilities={['source']} />,
      )
      await expect.element(screen.getByText('Source')).toBeVisible()
    })

    it('renders transform capability', async () => {
      const screen = await render(
        <CapabilityBadges capabilities={['transform']} />,
      )
      await expect.element(screen.getByText('Transform')).toBeVisible()
    })

    it('renders product capability', async () => {
      const screen = await render(
        <CapabilityBadges capabilities={['product']} />,
      )
      await expect.element(screen.getByText('Product')).toBeVisible()
    })

    it('renders sink capability', async () => {
      const screen = await render(<CapabilityBadges capabilities={['sink']} />)
      await expect.element(screen.getByText('Sink')).toBeVisible()
    })
  })

  describe('multiple capabilities', () => {
    it('renders multiple capabilities', async () => {
      const capabilities: Array<PluginCapability> = ['source', 'product']
      const screen = await render(
        <CapabilityBadges capabilities={capabilities} />,
      )
      await expect.element(screen.getByText('Source')).toBeVisible()
      await expect.element(screen.getByText('Product')).toBeVisible()
    })

    it('renders all four capabilities', async () => {
      const capabilities: Array<PluginCapability> = [
        'source',
        'transform',
        'product',
        'sink',
      ]
      const screen = await render(
        <CapabilityBadges capabilities={capabilities} />,
      )
      await expect.element(screen.getByText('Source')).toBeVisible()
      await expect.element(screen.getByText('Transform')).toBeVisible()
      await expect.element(screen.getByText('Product')).toBeVisible()
      await expect.element(screen.getByText('Sink')).toBeVisible()
    })
  })

  describe('className', () => {
    it('accepts custom className', async () => {
      const screen = await render(
        <CapabilityBadges capabilities={['source']} className="custom-class" />,
      )
      await expect.element(screen.getByText('Source')).toBeVisible()
    })
  })
})
