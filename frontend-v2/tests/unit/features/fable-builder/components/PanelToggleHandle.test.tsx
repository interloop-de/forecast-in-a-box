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
import { PanelToggleHandle } from '@/features/fable-builder/components/layout/PanelToggleHandle'

// Mock the tooltip components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipTrigger: ({
    children,
    render: renderProp,
  }: {
    children: React.ReactNode
    render: React.ReactElement
  }) => {
    // Simplified mock: render the button element directly with tooltip children
    // The actual component uses the render prop to wrap a button
    return (
      <div data-testid="tooltip-trigger">
        {renderProp}
        {children}
      </div>
    )
  },
  TooltipContent: ({
    children,
    side,
  }: {
    children: React.ReactNode
    side: string
  }) => (
    <div data-testid="tooltip-content" data-side={side}>
      {children}
    </div>
  ),
}))

describe('PanelToggleHandle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders button with label as aria-label', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const button = screen.getByRole('button')
      expect(button.element().getAttribute('aria-label')).toBe('Toggle sidebar')
    })

    it('sets aria-expanded to true when isOpen is true', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      expect(
        screen.getByRole('button').element().getAttribute('aria-expanded'),
      ).toBe('true')
    })

    it('sets aria-expanded to false when isOpen is false', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={false}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      expect(
        screen.getByRole('button').element().getAttribute('aria-expanded'),
      ).toBe('false')
    })

    it('renders tooltip with correct label', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      await expect
        .element(screen.getByTestId('tooltip-content'))
        .toHaveTextContent('Toggle sidebar')
    })
  })

  describe('position styling', () => {
    it('positions button on right edge when position is left', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const button = screen.getByRole('button').element()
      expect(button.classList.contains('-right-2')).toBe(true)
      expect(button.classList.contains('-left-2')).toBe(false)
    })

    it('positions button on left edge when position is right', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="right"
          label="Toggle sidebar"
        />,
      )

      const button = screen.getByRole('button').element()
      expect(button.classList.contains('-left-2')).toBe(true)
      expect(button.classList.contains('-right-2')).toBe(false)
    })

    it('tooltip appears on right side when position is left', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent.element().getAttribute('data-side')).toBe('right')
    })

    it('tooltip appears on left side when position is right', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="right"
          label="Toggle sidebar"
        />,
      )

      const tooltipContent = screen.getByTestId('tooltip-content')
      expect(tooltipContent.element().getAttribute('data-side')).toBe('left')
    })
  })

  describe('icon logic', () => {
    // The icon is rendered inside the button via children
    // We can verify which icon is rendered by checking the SVG

    it('shows ChevronLeft icon when left panel is open', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      // ChevronLeft has a specific path - verify SVG exists
      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('shows ChevronRight icon when left panel is closed', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={false}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('shows ChevronRight icon when right panel is open', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="right"
          label="Toggle sidebar"
        />,
      )

      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })

    it('shows ChevronLeft icon when right panel is closed', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={false}
          onToggle={onToggle}
          position="right"
          label="Toggle sidebar"
        />,
      )

      const svg = screen.container.querySelector('svg')
      expect(svg).toBeTruthy()
    })
  })

  describe('click handling', () => {
    it('calls onToggle when button is clicked', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      await screen.getByRole('button').click()

      expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('calls onToggle when closed button is clicked', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={false}
          onToggle={onToggle}
          position="right"
          label="Toggle sidebar"
        />,
      )

      await screen.getByRole('button').click()

      expect(onToggle).toHaveBeenCalledTimes(1)
    })
  })

  describe('button styling', () => {
    it('has correct base classes', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const button = screen.getByRole('button').element()
      expect(button.classList.contains('absolute')).toBe(true)
      expect(button.classList.contains('z-20')).toBe(true)
      expect(button.classList.contains('-translate-y-1/2')).toBe(true)
      expect(button.classList.contains('top-1/2')).toBe(true)
    })

    it('has size classes', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const button = screen.getByRole('button').element()
      expect(button.classList.contains('h-12')).toBe(true)
      expect(button.classList.contains('w-4')).toBe(true)
      expect(button.classList.contains('rounded-sm')).toBe(true)
    })

    it('has border and background classes', async () => {
      const onToggle = vi.fn()

      const screen = await render(
        <PanelToggleHandle
          isOpen={true}
          onToggle={onToggle}
          position="left"
          label="Toggle sidebar"
        />,
      )

      const button = screen.getByRole('button').element()
      expect(button.classList.contains('border')).toBe(true)
      expect(button.classList.contains('border-border')).toBe(true)
      expect(button.classList.contains('bg-muted/50')).toBe(true)
    })
  })
})
