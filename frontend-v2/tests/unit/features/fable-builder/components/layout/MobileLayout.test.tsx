/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import type { BlockFactoryCatalogue } from '@/api/types/fable.types'
import { MobileLayout } from '@/features/fable-builder/components/layout/MobileLayout'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock dependent components
vi.mock('@/features/fable-builder/components/layout/BlockPalette', () => ({
  BlockPalette: ({ catalogue }: { catalogue: BlockFactoryCatalogue }) => (
    <div data-testid="block-palette">
      Block Palette ({Object.keys(catalogue).length} plugins)
    </div>
  ),
}))

vi.mock('@/features/fable-builder/components/layout/ConfigPanel', () => ({
  ConfigPanel: ({ catalogue }: { catalogue: BlockFactoryCatalogue }) => (
    <div data-testid="config-panel">
      Config Panel ({Object.keys(catalogue).length} plugins)
    </div>
  ),
}))

// Mock Sheet components
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }) => (
    <div
      data-testid="sheet"
      data-open={open}
      data-controlled={open !== undefined}
    >
      {children}
    </div>
  ),
  SheetTrigger: ({
    children,
    render: renderProp,
  }: {
    children: React.ReactNode
    render?: React.ReactElement
  }) => (
    <div data-testid="sheet-trigger">
      {renderProp}
      {children}
    </div>
  ),
  SheetContent: ({
    children,
    side,
  }: {
    children: React.ReactNode
    side: string
  }) => (
    <div data-testid={`sheet-content-${side}`} data-side={side}>
      {children}
    </div>
  ),
  SheetHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="sheet-header" className={className}>
      {children}
    </div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">{children}</div>
  ),
}))

const mockCatalogue: BlockFactoryCatalogue = {
  'test-plugin': {
    factories: {
      'test-factory': {
        kind: 'source',
        title: 'Test Factory',
        description: 'A test factory',
        configuration_options: {},
        inputs: [],
      },
    },
  },
}

describe('MobileLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to default state
    useFableBuilderStore.setState({
      isMobileConfigOpen: false,
      fable: { blocks: {} },
    })
  })

  afterEach(() => {
    useFableBuilderStore.getState().reset()
  })

  describe('rendering', () => {
    it('renders canvas content', async () => {
      const screen = await render(
        <MobileLayout
          catalogue={mockCatalogue}
          canvas={<div data-testid="canvas">Canvas Content</div>}
        />,
      )

      await expect
        .element(screen.getByTestId('canvas'))
        .toHaveTextContent('Canvas Content')
    })

    it('renders add block button with Plus icon', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const sheetTrigger = screen.getByTestId('sheet-trigger')
      await expect.element(sheetTrigger).toBeInTheDocument()

      // Button should contain an SVG (Plus icon)
      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('renders block palette in left sheet', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const leftSheetContent = screen.getByTestId('sheet-content-left')
      await expect.element(leftSheetContent).toBeInTheDocument()
      await expect
        .element(screen.getByTestId('block-palette'))
        .toBeInTheDocument()
    })

    it('renders config panel in right sheet', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const rightSheetContent = screen.getByTestId('sheet-content-right')
      await expect.element(rightSheetContent).toBeInTheDocument()
      await expect
        .element(screen.getByTestId('config-panel'))
        .toBeInTheDocument()
    })

    it('passes catalogue to BlockPalette', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      await expect
        .element(screen.getByTestId('block-palette'))
        .toHaveTextContent('1 plugins')
    })

    it('passes catalogue to ConfigPanel', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      await expect
        .element(screen.getByTestId('config-panel'))
        .toHaveTextContent('1 plugins')
    })
  })

  describe('block count indicator', () => {
    it('does not show block count when no blocks exist', async () => {
      useFableBuilderStore.setState({
        fable: { blocks: {} },
      })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      // Should not find text containing "blocks"
      expect(screen.container.textContent).not.toContain('blocks')
    })

    it('shows block count when blocks exist', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            block1: {
              factory_id: { plugin: 'test', factory: 'test' },
              configuration_values: {},
              input_ids: {},
            },
            block2: {
              factory_id: { plugin: 'test', factory: 'test' },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      expect(screen.container.textContent).toContain('2 blocks')
    })

    it('shows correct count for single block', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            block1: {
              factory_id: { plugin: 'test', factory: 'test' },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      expect(screen.container.textContent).toContain('1 blocks')
    })
  })

  describe('config sheet control', () => {
    it('controls config sheet open state from store', async () => {
      useFableBuilderStore.setState({ isMobileConfigOpen: true })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      // Find the config sheet (right side) by checking for right content
      const rightContent = screen.container.querySelector(
        '[data-testid="sheet-content-right"]',
      )
      const configSheet = rightContent?.closest('[data-testid="sheet"]')
      expect(configSheet?.getAttribute('data-open')).toBe('true')
    })

    it('reflects closed state from store', async () => {
      useFableBuilderStore.setState({ isMobileConfigOpen: false })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      // Find the config sheet (right side) by checking for right content
      const rightContent = screen.container.querySelector(
        '[data-testid="sheet-content-right"]',
      )
      const configSheet = rightContent?.closest('[data-testid="sheet"]')
      expect(configSheet?.getAttribute('data-open')).toBe('false')
    })
  })

  describe('palette sheet control', () => {
    it('controls palette sheet open state from store', async () => {
      useFableBuilderStore.setState({ isMobilePaletteOpen: true })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      // Find the palette sheet (left side) by checking for left content
      const leftContent = screen.container.querySelector(
        '[data-testid="sheet-content-left"]',
      )
      const paletteSheet = leftContent?.closest('[data-testid="sheet"]')
      expect(paletteSheet?.getAttribute('data-open')).toBe('true')
    })

    it('reflects closed state from store', async () => {
      useFableBuilderStore.setState({ isMobilePaletteOpen: false })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      // Find the palette sheet (left side) by checking for left content
      const leftContent = screen.container.querySelector(
        '[data-testid="sheet-content-left"]',
      )
      const paletteSheet = leftContent?.closest('[data-testid="sheet"]')
      expect(paletteSheet?.getAttribute('data-open')).toBe('false')
    })
  })

  describe('layout structure', () => {
    it('has flex column layout', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const container = screen.container.firstElementChild
      expect(container?.classList.contains('flex')).toBe(true)
      expect(container?.classList.contains('flex-col')).toBe(true)
      expect(container?.classList.contains('h-full')).toBe(true)
      expect(container?.classList.contains('w-full')).toBe(true)
    })

    it('positions add button in top left', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      // Find the div containing the sheet trigger (positioned element)
      const positionedDiv = screen.container.querySelector(
        '.absolute.top-4.left-4',
      )
      expect(positionedDiv).toBeTruthy()
    })

    it('positions block count in top right', async () => {
      useFableBuilderStore.setState({
        fable: {
          blocks: {
            block1: {
              factory_id: { plugin: 'test', factory: 'test' },
              configuration_values: {},
              input_ids: {},
            },
          },
        },
      })

      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const positionedDiv = screen.container.querySelector(
        '.absolute.top-4.right-4',
      )
      expect(positionedDiv).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('has sr-only header for Add Block sheet', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const sheetHeaders = screen.container.querySelectorAll(
        '[data-testid="sheet-header"]',
      )
      const srOnlyHeader = Array.from(sheetHeaders).find((el) =>
        el.classList.contains('sr-only'),
      )
      expect(srOnlyHeader).toBeTruthy()
    })

    it('has Add Block title in sheet', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const sheetTitles = screen.container.querySelectorAll(
        '[data-testid="sheet-title"]',
      )
      const titles = Array.from(sheetTitles).map((el) => el.textContent)
      expect(titles).toContain('Add Block')
    })

    it('has Block Configuration title in sheet', async () => {
      const screen = await render(
        <MobileLayout catalogue={mockCatalogue} canvas={<div>Canvas</div>} />,
      )

      const sheetTitles = screen.container.querySelectorAll(
        '[data-testid="sheet-title"]',
      )
      const titles = Array.from(sheetTitles).map((el) => el.textContent)
      expect(titles).toContain('Block Configuration')
    })
  })
})
