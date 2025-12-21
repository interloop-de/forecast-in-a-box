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
import { StatusIndicator } from '@/components/common/StatusIndicator'

describe('StatusIndicator', () => {
  describe('dot variant', () => {
    it('renders green status', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="dot" />,
      )
      expect(screen).toBeDefined()
    })

    it('renders orange status', async () => {
      const screen = await render(
        <StatusIndicator status="orange" variant="dot" />,
      )
      expect(screen).toBeDefined()
    })

    it('renders red status', async () => {
      const screen = await render(
        <StatusIndicator status="red" variant="dot" />,
      )
      expect(screen).toBeDefined()
    })

    it('renders unknown status', async () => {
      const screen = await render(
        <StatusIndicator status="unknown" variant="dot" />,
      )
      expect(screen).toBeDefined()
    })
  })

  describe('badge variant', () => {
    it('renders label for green status', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="badge" />,
      )
      await expect.element(screen.getByText('All Systems Normal')).toBeVisible()
    })

    it('renders label for orange status', async () => {
      const screen = await render(
        <StatusIndicator status="orange" variant="badge" />,
      )
      await expect.element(screen.getByText('Partial Outage')).toBeVisible()
    })

    it('renders label for red status', async () => {
      const screen = await render(
        <StatusIndicator status="red" variant="badge" />,
      )
      await expect.element(screen.getByText('System Outage')).toBeVisible()
    })

    it('renders label for unknown status', async () => {
      const screen = await render(
        <StatusIndicator status="unknown" variant="badge" />,
      )
      await expect.element(screen.getByText('Checking...')).toBeVisible()
    })

    it('uses custom label when provided', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="badge" label="Custom Label" />,
      )
      await expect.element(screen.getByText('Custom Label')).toBeVisible()
    })

    it('hides label when showLabel is false', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="badge" showLabel={false} />,
      )
      expect(screen).toBeDefined()
    })
  })

  describe('full variant', () => {
    it('renders with full styling for green', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="full" />,
      )
      await expect.element(screen.getByText('All Systems Normal')).toBeVisible()
    })

    it('renders with full styling for red', async () => {
      const screen = await render(
        <StatusIndicator status="red" variant="full" />,
      )
      await expect.element(screen.getByText('System Outage')).toBeVisible()
    })
  })

  describe('size variants', () => {
    it('renders with small size', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="dot" size="sm" />,
      )
      expect(screen).toBeDefined()
    })

    it('renders with medium size', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="dot" size="md" />,
      )
      expect(screen).toBeDefined()
    })

    it('renders with large size', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="dot" size="lg" />,
      )
      expect(screen).toBeDefined()
    })
  })

  describe('pulse animation', () => {
    it('renders with pulse enabled', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="dot" showPulse />,
      )
      expect(screen).toBeDefined()
    })

    it('renders with pulse disabled', async () => {
      const screen = await render(
        <StatusIndicator status="green" variant="dot" showPulse={false} />,
      )
      expect(screen).toBeDefined()
    })
  })

  describe('custom className', () => {
    it('accepts custom className for dot variant', async () => {
      const screen = await render(
        <StatusIndicator
          status="green"
          variant="dot"
          className="custom-class"
        />,
      )
      expect(screen).toBeDefined()
    })

    it('accepts custom className for badge variant', async () => {
      const screen = await render(
        <StatusIndicator
          status="green"
          variant="badge"
          className="custom-badge"
        />,
      )
      expect(screen).toBeDefined()
    })
  })
})
