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
import { Position } from '@xyflow/react'
import { LabeledHandle } from '@/components/labeled-handle'

// Mock @xyflow/react with Handle and Position
vi.mock('@xyflow/react', () => ({
  Handle: ({
    className,
    children,
    ...props
  }: {
    position?: string
    className?: string
    children?: React.ReactNode
  }) => (
    <div data-testid="xyflow-handle" className={className} {...props}>
      {children}
    </div>
  ),
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
}))

describe('LabeledHandle', () => {
  describe('rendering', () => {
    it('renders labeled handle with title', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Right}
          id="test"
          title="Output"
        />,
      )

      await expect.element(screen.getByText('Output')).toBeVisible()
    })

    it('renders label element', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Right}
          id="test"
          title="Test Label"
        />,
      )

      const label = screen.container.querySelector('label')
      expect(label).toBeTruthy()
      expect(label?.textContent).toBe('Test Label')
    })
  })

  describe('positioning', () => {
    it('applies top position styling', async () => {
      const screen = await render(
        <LabeledHandle
          type="target"
          position={Position.Top}
          id="test"
          title="Top Handle"
        />,
      )

      const container = screen.container.querySelector('div')
      expect(container?.classList.contains('flex-col')).toBe(true)
    })

    it('applies right position styling', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Right}
          id="test"
          title="Right Handle"
        />,
      )

      const container = screen.container.querySelector('div')
      expect(container?.classList.contains('flex-row-reverse')).toBe(true)
    })

    it('applies bottom position styling', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Bottom}
          id="test"
          title="Bottom Handle"
        />,
      )

      const container = screen.container.querySelector('div')
      expect(container?.classList.contains('flex-col-reverse')).toBe(true)
    })

    it('applies left position styling', async () => {
      const screen = await render(
        <LabeledHandle
          type="target"
          position={Position.Left}
          id="test"
          title="Left Handle"
        />,
      )

      const container = screen.container.querySelector('div')
      expect(container?.classList.contains('flex-row')).toBe(true)
    })
  })

  describe('styling', () => {
    it('applies custom className to container', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Right}
          id="test"
          title="Test"
          className="custom-container"
        />,
      )

      const container = screen.container.querySelector('div')
      expect(container?.classList.contains('custom-container')).toBe(true)
    })

    it('applies labelClassName to label', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Right}
          id="test"
          title="Test Label"
          labelClassName="custom-label"
        />,
      )

      const label = screen.container.querySelector('label')
      expect(label?.classList.contains('custom-label')).toBe(true)
    })
  })

  describe('title attribute', () => {
    it('sets title attribute on container div', async () => {
      const screen = await render(
        <LabeledHandle
          type="source"
          position={Position.Right}
          id="test"
          title="Hover Title"
        />,
      )

      const container = screen.container.querySelector('div[title]')
      expect(container?.getAttribute('title')).toBe('Hover Title')
    })
  })
})
