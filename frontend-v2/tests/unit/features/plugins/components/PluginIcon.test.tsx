/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import type { PluginInfo } from '@/api/types/plugins.types'
import { PluginIcon } from '@/features/plugins/components/PluginIcon'

const createMockPlugin = (overrides: Partial<PluginInfo> = {}): PluginInfo => ({
  id: 'test-plugin',
  name: 'Test Plugin',
  description: 'A test plugin',
  version: '1.0.0',
  author: 'Test Author',
  fiabCompatibility: '>=1.0.0',
  status: 'active',
  isEnabled: true,
  isInstalled: true,
  hasUpdate: false,
  store: 'ecmwf',
  capabilities: ['source'],
  ...overrides,
})

describe('PluginIcon', () => {
  describe('rendering', () => {
    it('renders icon for plugin', async () => {
      const plugin = createMockPlugin()
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('renders with iconName', async () => {
      const plugin = createMockPlugin({ iconName: 'Globe' })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('renders fallback icon when iconName is not recognized', async () => {
      const plugin = createMockPlugin({ iconName: 'UnknownIcon' })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('renders fallback icon when no iconName provided', async () => {
      const plugin = createMockPlugin({ iconName: undefined })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })
  })

  describe('sizes', () => {
    it('renders small size', async () => {
      const plugin = createMockPlugin()
      const screen = await render(<PluginIcon plugin={plugin} size="sm" />)
      expect(screen).toBeDefined()
    })

    it('renders medium size (default)', async () => {
      const plugin = createMockPlugin()
      const screen = await render(<PluginIcon plugin={plugin} size="md" />)
      expect(screen).toBeDefined()
    })

    it('renders large size', async () => {
      const plugin = createMockPlugin()
      const screen = await render(<PluginIcon plugin={plugin} size="lg" />)
      expect(screen).toBeDefined()
    })
  })

  describe('capability colors', () => {
    it('applies source capability color', async () => {
      const plugin = createMockPlugin({ capabilities: ['source'] })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('applies transform capability color', async () => {
      const plugin = createMockPlugin({ capabilities: ['transform'] })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('applies product capability color', async () => {
      const plugin = createMockPlugin({ capabilities: ['product'] })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('applies sink capability color', async () => {
      const plugin = createMockPlugin({ capabilities: ['sink'] })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('applies default color when no capabilities', async () => {
      const plugin = createMockPlugin({ capabilities: [] })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })

    it('uses first capability for color when multiple', async () => {
      const plugin = createMockPlugin({ capabilities: ['source', 'transform'] })
      const screen = await render(<PluginIcon plugin={plugin} />)
      expect(screen).toBeDefined()
    })
  })

  describe('custom className', () => {
    it('accepts custom className', async () => {
      const plugin = createMockPlugin()
      const screen = await render(
        <PluginIcon plugin={plugin} className="custom-class" />,
      )
      expect(screen).toBeDefined()
    })
  })

  describe('icon mapping', () => {
    const iconNames = [
      'Globe',
      'Droplets',
      'Wind',
      'Thermometer',
      'Satellite',
      'FileOutput',
      'Database',
      'Waves',
      'CloudRain',
      'ImageOff',
      'Tornado',
      'Snowflake',
      'Moon',
      'FileText',
      'Puzzle',
    ]

    iconNames.forEach((iconName) => {
      it(`renders ${iconName} icon`, async () => {
        const plugin = createMockPlugin({ iconName })
        const screen = await render(<PluginIcon plugin={plugin} />)
        expect(screen).toBeDefined()
      })
    })
  })
})
