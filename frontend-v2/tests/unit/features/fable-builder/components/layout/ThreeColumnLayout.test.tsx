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
import { ThreeColumnLayout } from '@/features/fable-builder/components/layout/ThreeColumnLayout'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock PanelToggleHandle since it's already tested
vi.mock('@/features/fable-builder/components/layout/PanelToggleHandle', () => ({
  PanelToggleHandle: ({
    isOpen,
    onToggle,
    position,
    label,
  }: {
    isOpen: boolean
    onToggle: () => void
    position: 'left' | 'right'
    label: string
  }) => (
    <button
      data-testid={`toggle-${position}`}
      data-open={isOpen}
      onClick={onToggle}
      aria-label={label}
    >
      Toggle {position}
    </button>
  ),
}))

describe('ThreeColumnLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to default state
    useFableBuilderStore.setState({
      isPaletteOpen: true,
      isConfigPanelOpen: true,
    })
  })

  afterEach(() => {
    useFableBuilderStore.getState().reset()
  })

  describe('rendering', () => {
    it('renders left sidebar content', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div data-testid="left-content">Left Content</div>}
          canvas={<div data-testid="canvas-content">Canvas</div>}
          rightSidebar={<div data-testid="right-content">Right Content</div>}
        />,
      )

      await expect
        .element(screen.getByTestId('left-content'))
        .toHaveTextContent('Left Content')
    })

    it('renders canvas content', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div data-testid="left-content">Left</div>}
          canvas={<div data-testid="canvas-content">Canvas Content</div>}
          rightSidebar={<div data-testid="right-content">Right</div>}
        />,
      )

      await expect
        .element(screen.getByTestId('canvas-content'))
        .toHaveTextContent('Canvas Content')
    })

    it('renders right sidebar content', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div data-testid="left-content">Left</div>}
          canvas={<div data-testid="canvas-content">Canvas</div>}
          rightSidebar={<div data-testid="right-content">Right Content</div>}
        />,
      )

      await expect
        .element(screen.getByTestId('right-content'))
        .toHaveTextContent('Right Content')
    })

    it('renders left toggle handle', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const leftToggle = screen.getByTestId('toggle-left')
      await expect.element(leftToggle).toBeInTheDocument()
    })

    it('renders right toggle handle', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const rightToggle = screen.getByTestId('toggle-right')
      await expect.element(rightToggle).toBeInTheDocument()
    })
  })

  describe('panel visibility', () => {
    it('applies w-0 class when palette is closed', async () => {
      useFableBuilderStore.setState({ isPaletteOpen: false })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const aside = screen.container.querySelector('aside')
      expect(aside?.classList.contains('w-0')).toBe(true)
    })

    it('applies w-64 class when palette is open', async () => {
      useFableBuilderStore.setState({ isPaletteOpen: true })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const aside = screen.container.querySelector('aside')
      expect(aside?.classList.contains('w-64')).toBe(true)
    })

    it('applies w-0 class to right sidebar when config panel is closed', async () => {
      useFableBuilderStore.setState({
        isConfigPanelOpen: false,
      })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const asides = screen.container.querySelectorAll('aside')
      // Second aside is the right sidebar
      expect(asides[1].classList.contains('w-0')).toBe(true)
    })

    it('applies w-80 class to right sidebar when config panel is open', async () => {
      useFableBuilderStore.setState({
        isConfigPanelOpen: true,
      })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const asides = screen.container.querySelectorAll('aside')
      expect(asides[1].classList.contains('w-80')).toBe(true)
    })
  })

  describe('toggle interactions', () => {
    it('toggles palette when left toggle is clicked', async () => {
      useFableBuilderStore.setState({ isPaletteOpen: true })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      await screen.getByTestId('toggle-left').click()

      expect(useFableBuilderStore.getState().isPaletteOpen).toBe(false)
    })

    it('toggles config panel when right toggle is clicked', async () => {
      useFableBuilderStore.setState({
        isConfigPanelOpen: true,
      })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      await screen.getByTestId('toggle-right').click()

      expect(useFableBuilderStore.getState().isConfigPanelOpen).toBe(false)
    })
  })

  describe('toggle labels', () => {
    it('shows correct label for left toggle when open', async () => {
      useFableBuilderStore.setState({ isPaletteOpen: true })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const leftToggle = screen.getByTestId('toggle-left')
      expect(leftToggle.element().getAttribute('aria-label')).toBe(
        'Hide block palette',
      )
    })

    it('shows correct label for left toggle when closed', async () => {
      useFableBuilderStore.setState({ isPaletteOpen: false })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const leftToggle = screen.getByTestId('toggle-left')
      expect(leftToggle.element().getAttribute('aria-label')).toBe(
        'Show block palette',
      )
    })

    it('shows correct label for right toggle when open', async () => {
      useFableBuilderStore.setState({
        isConfigPanelOpen: true,
      })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const rightToggle = screen.getByTestId('toggle-right')
      expect(rightToggle.element().getAttribute('aria-label')).toBe(
        'Hide config panel',
      )
    })

    it('shows correct label for right toggle when closed', async () => {
      useFableBuilderStore.setState({
        isConfigPanelOpen: false,
      })

      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const rightToggle = screen.getByTestId('toggle-right')
      expect(rightToggle.element().getAttribute('aria-label')).toBe(
        'Show config panel',
      )
    })
  })

  describe('layout structure', () => {
    it('has flex layout container', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div>Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const container = screen.container.firstElementChild
      expect(container?.classList.contains('flex')).toBe(true)
      expect(container?.classList.contains('h-full')).toBe(true)
      expect(container?.classList.contains('w-full')).toBe(true)
    })

    it('renders canvas in main element', async () => {
      const screen = await render(
        <ThreeColumnLayout
          leftSidebar={<div>Left</div>}
          canvas={<div data-testid="canvas">Canvas</div>}
          rightSidebar={<div>Right</div>}
        />,
      )

      const main = screen.container.querySelector('main')
      expect(main).toBeTruthy()
      expect(main?.classList.contains('flex-1')).toBe(true)
      expect(main?.querySelector('[data-testid="canvas"]')).toBeTruthy()
    })
  })
})
