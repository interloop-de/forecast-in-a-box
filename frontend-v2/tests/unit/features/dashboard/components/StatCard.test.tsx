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
import { StatCard } from '@/features/dashboard/components/StatCard'

describe('StatCard', () => {
  describe('rendering', () => {
    it('renders label', async () => {
      const screen = await render(<StatCard label="Total Jobs" value={42} />)
      await expect.element(screen.getByText('Total Jobs')).toBeVisible()
    })

    it('renders numeric value', async () => {
      const screen = await render(<StatCard label="Count" value={123} />)
      await expect.element(screen.getByText('123')).toBeVisible()
    })

    it('renders string value', async () => {
      const screen = await render(<StatCard label="Status" value="Active" />)
      await expect.element(screen.getByText('Active')).toBeVisible()
    })

    it('renders ReactNode value', async () => {
      const screen = await render(
        <StatCard
          label="Custom"
          value={<span data-testid="custom-value">Complex</span>}
        />,
      )
      await expect.element(screen.getByTestId('custom-value')).toBeVisible()
    })
  })

  describe('subtext', () => {
    it('renders subtext when provided', async () => {
      const screen = await render(
        <StatCard label="Jobs" value={10} subtext="Last 24 hours" />,
      )
      await expect.element(screen.getByText('Last 24 hours')).toBeVisible()
    })

    it('renders without subtext when not provided', async () => {
      const screen = await render(<StatCard label="Jobs" value={10} />)
      await expect.element(screen.getByText('Jobs')).toBeVisible()
      await expect.element(screen.getByText('10')).toBeVisible()
    })
  })

  describe('icon', () => {
    it('renders icon when provided and no statusDot', async () => {
      const screen = await render(
        <StatCard
          label="Jobs"
          value={10}
          icon={<span data-testid="icon">📊</span>}
        />,
      )
      await expect.element(screen.getByTestId('icon')).toBeVisible()
    })

    it('does not render icon when statusDot is provided', async () => {
      const screen = await render(
        <StatCard
          label="Jobs"
          value={10}
          icon={<span data-testid="icon">📊</span>}
          statusDot="success"
        />,
      )
      await expect.element(screen.getByText('Jobs')).toBeVisible()
    })
  })

  describe('statusDot', () => {
    it('renders success status dot', async () => {
      const screen = await render(
        <StatCard label="Status" value="OK" statusDot="success" />,
      )
      await expect.element(screen.getByText('Status')).toBeVisible()
    })

    it('renders warning status dot', async () => {
      const screen = await render(
        <StatCard label="Status" value="Warning" statusDot="warning" />,
      )
      await expect.element(screen.getByText('Status')).toBeVisible()
    })

    it('renders error status dot', async () => {
      const screen = await render(
        <StatCard label="Status" value="Error" statusDot="error" />,
      )
      await expect.element(screen.getByText('Status')).toBeVisible()
    })

    it('renders info status dot', async () => {
      const screen = await render(
        <StatCard label="Status" value="Info" statusDot="info" />,
      )
      await expect.element(screen.getByText('Status')).toBeVisible()
    })
  })

  describe('className', () => {
    it('accepts custom className', async () => {
      const screen = await render(
        <StatCard label="Jobs" value={10} className="custom-class" />,
      )
      await expect.element(screen.getByText('Jobs')).toBeVisible()
    })
  })

  describe('full composition', () => {
    it('renders all elements together', async () => {
      const screen = await render(
        <StatCard
          label="Total Forecasts"
          value={256}
          subtext="Updated 5 mins ago"
          statusDot="success"
        />,
      )
      await expect.element(screen.getByText('Total Forecasts')).toBeVisible()
      await expect.element(screen.getByText('256')).toBeVisible()
      await expect.element(screen.getByText('Updated 5 mins ago')).toBeVisible()
    })
  })
})
