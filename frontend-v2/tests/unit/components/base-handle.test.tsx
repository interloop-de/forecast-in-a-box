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
import { BaseHandle } from '@/components/base-handle'

// Mock @xyflow/react Handle component
vi.mock('@xyflow/react', () => ({
  Handle: ({
    children,
    className,
    type,
    position,
    id,
    ...props
  }: {
    children?: React.ReactNode
    className?: string
    type?: string
    position?: string
    id?: string
  }) => (
    <div
      data-testid="handle"
      data-type={type}
      data-position={position}
      data-id={id}
      className={className}
      {...props}
    >
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

describe('BaseHandle', () => {
  describe('rendering', () => {
    it('renders handle element', async () => {
      const screen = await render(
        <BaseHandle type="source" position={Position.Right} id="test-handle" />,
      )

      const handle = screen.getByTestId('handle')
      expect(handle.element()).toBeTruthy()
    })

    it('passes type prop to Handle', async () => {
      const screen = await render(
        <BaseHandle type="source" position={Position.Right} id="test" />,
      )

      const handle = screen.getByTestId('handle')
      expect(handle.element()).toHaveAttribute('data-type', 'source')
    })

    it('passes position prop to Handle', async () => {
      const screen = await render(
        <BaseHandle type="target" position={Position.Left} id="test" />,
      )

      const handle = screen.getByTestId('handle')
      expect(handle.element()).toHaveAttribute('data-position', 'left')
    })

    it('passes id prop to Handle', async () => {
      const screen = await render(
        <BaseHandle type="source" position={Position.Bottom} id="custom-id" />,
      )

      const handle = screen.getByTestId('handle')
      expect(handle.element()).toHaveAttribute('data-id', 'custom-id')
    })
  })

  describe('styling', () => {
    it('applies default styling classes', async () => {
      const screen = await render(
        <BaseHandle type="source" position={Position.Right} id="test" />,
      )

      const handle = screen.getByTestId('handle')
      const handleEl = handle.element()
      expect(handleEl).toBeTruthy()
      const className = handleEl.getAttribute('class') ?? ''
      expect(className.includes('rounded-full')).toBe(true)
    })

    it('merges custom className with defaults', async () => {
      const screen = await render(
        <BaseHandle
          type="source"
          position={Position.Right}
          id="test"
          className="custom-class"
        />,
      )

      const handle = screen.getByTestId('handle')
      const handleEl = handle.element()
      expect(handleEl).toBeTruthy()
      const className = handleEl.getAttribute('class') ?? ''
      expect(className.includes('custom-class')).toBe(true)
    })
  })

  describe('children', () => {
    it('renders children inside handle', async () => {
      const screen = await render(
        <BaseHandle type="source" position={Position.Right} id="test">
          <span data-testid="child">Child content</span>
        </BaseHandle>,
      )

      await expect.element(screen.getByTestId('child')).toBeVisible()
      await expect.element(screen.getByText('Child content')).toBeVisible()
    })
  })
})
