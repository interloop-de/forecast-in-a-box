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
import {
  NodeTooltip,
  NodeTooltipContent,
  NodeTooltipTrigger,
} from '@/components/node-tooltip'

// Track isVisible prop passed to NodeToolbar
let capturedIsVisible: boolean | undefined

// Mock @xyflow/react
vi.mock('@xyflow/react', () => ({
  NodeToolbar: ({
    isVisible,
    children,
    className,
    tabIndex,
  }: {
    isVisible: boolean
    children: React.ReactNode
    className?: string
    tabIndex?: number
  }) => {
    capturedIsVisible = isVisible
    return (
      <div
        data-testid="node-toolbar"
        data-visible={isVisible}
        className={className}
        tabIndex={tabIndex}
      >
        {children}
      </div>
    )
  },
}))

describe('NodeTooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedIsVisible = undefined
  })

  describe('rendering', () => {
    it('renders children', async () => {
      const screen = await render(
        <NodeTooltip>
          <div data-testid="child">Content</div>
        </NodeTooltip>,
      )

      await expect.element(screen.getByTestId('child')).toBeInTheDocument()
      await expect
        .element(screen.getByTestId('child'))
        .toHaveTextContent('Content')
    })

    it('wraps children in a div', async () => {
      const screen = await render(
        <NodeTooltip>
          <span data-testid="child">Content</span>
        </NodeTooltip>,
      )

      const child = screen.getByTestId('child')
      expect(child.element().parentElement?.tagName.toLowerCase()).toBe('div')
    })
  })
})

describe('NodeTooltipTrigger', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipTrigger data-testid="trigger">
            Trigger Content
          </NodeTooltipTrigger>
        </NodeTooltip>,
      )

      await expect
        .element(screen.getByTestId('trigger'))
        .toHaveTextContent('Trigger Content')
    })

    it('spreads additional props', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipTrigger data-testid="trigger" aria-label="Trigger">
            Content
          </NodeTooltipTrigger>
        </NodeTooltip>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger.element().getAttribute('aria-label')).toBe('Trigger')
    })
  })

  describe('mouse events', () => {
    it('shows tooltip on mouse enter', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipTrigger data-testid="trigger">Trigger</NodeTooltipTrigger>
          <NodeTooltipContent>Tooltip Content</NodeTooltipContent>
        </NodeTooltip>,
      )

      const trigger = screen.getByTestId('trigger')

      // Initially not visible
      expect(capturedIsVisible).toBe(false)

      // Hover over trigger
      await trigger.hover()

      // Should become visible
      expect(capturedIsVisible).toBe(true)
    })

    it('calls custom onMouseEnter handler', async () => {
      const onMouseEnter = vi.fn()

      const screen = await render(
        <NodeTooltip>
          <NodeTooltipTrigger data-testid="trigger" onMouseEnter={onMouseEnter}>
            Trigger
          </NodeTooltipTrigger>
        </NodeTooltip>,
      )

      const trigger = screen.getByTestId('trigger')
      await trigger.hover()

      expect(onMouseEnter).toHaveBeenCalled()
    })
  })
})

describe('NodeTooltipContent', () => {
  beforeEach(() => {
    capturedIsVisible = undefined
  })

  describe('rendering', () => {
    it('renders NodeToolbar with children', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipContent>Tooltip Content</NodeTooltipContent>
        </NodeTooltip>,
      )

      const toolbar = screen.getByTestId('node-toolbar')
      expect(toolbar.element()).toBeTruthy()
      await expect.element(toolbar).toHaveTextContent('Tooltip Content')
    })

    it('passes isVisible state to NodeToolbar', async () => {
      await render(
        <NodeTooltip>
          <NodeTooltipContent>Content</NodeTooltipContent>
        </NodeTooltip>,
      )

      // Initially false
      expect(capturedIsVisible).toBe(false)
    })

    it('applies custom className', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipContent className="custom-tooltip">
            Content
          </NodeTooltipContent>
        </NodeTooltip>,
      )

      const toolbar = screen.getByTestId('node-toolbar')
      expect(toolbar.element().classList.contains('custom-tooltip')).toBe(true)
    })

    it('has default styling classes', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipContent>Content</NodeTooltipContent>
        </NodeTooltip>,
      )

      const toolbar = screen.getByTestId('node-toolbar')
      const el = toolbar.element()
      expect(el.classList.contains('rounded-sm')).toBe(true)
      expect(el.classList.contains('bg-primary')).toBe(true)
      expect(el.classList.contains('p-2')).toBe(true)
    })

    it('has tabIndex of 1', async () => {
      const screen = await render(
        <NodeTooltip>
          <NodeTooltipContent>Content</NodeTooltipContent>
        </NodeTooltip>,
      )

      const toolbar = screen.getByTestId('node-toolbar')
      expect(toolbar.element().getAttribute('tabindex')).toBe('1')
    })
  })
})

describe('NodeTooltip integration', () => {
  beforeEach(() => {
    capturedIsVisible = undefined
  })

  it('renders complete tooltip structure', async () => {
    const screen = await render(
      <NodeTooltip>
        <NodeTooltipTrigger data-testid="trigger">Hover me</NodeTooltipTrigger>
        <NodeTooltipContent>
          <span data-testid="tooltip-text">Tooltip text</span>
        </NodeTooltipContent>
      </NodeTooltip>,
    )

    await expect
      .element(screen.getByTestId('trigger'))
      .toHaveTextContent('Hover me')
    await expect
      .element(screen.getByTestId('tooltip-text'))
      .toHaveTextContent('Tooltip text')
  })
})
