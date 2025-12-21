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
import { PageHeader } from '@/components/common/PageHeader'

describe('PageHeader', () => {
  describe('title', () => {
    it('renders title as h1', async () => {
      const screen = await render(<PageHeader title="Dashboard" />)
      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'Dashboard',
      })
      await expect.element(heading).toBeVisible()
    })

    it('renders title text correctly', async () => {
      const screen = await render(<PageHeader title="My Page Title" />)
      await expect.element(screen.getByText('My Page Title')).toBeVisible()
    })
  })

  describe('description', () => {
    it('renders description when provided', async () => {
      const screen = await render(
        <PageHeader
          title="Dashboard"
          description="Welcome to your dashboard"
        />,
      )
      await expect
        .element(screen.getByText('Welcome to your dashboard'))
        .toBeVisible()
    })

    it('renders title without description', async () => {
      const screen = await render(<PageHeader title="Dashboard" />)
      await expect.element(screen.getByText('Dashboard')).toBeVisible()
    })
  })

  describe('actions', () => {
    it('renders actions when provided', async () => {
      const screen = await render(
        <PageHeader
          title="Dashboard"
          actions={<button data-testid="action-btn">Action</button>}
        />,
      )
      await expect.element(screen.getByTestId('action-btn')).toBeVisible()
    })

    it('renders multiple actions', async () => {
      const screen = await render(
        <PageHeader
          title="Dashboard"
          actions={
            <>
              <button data-testid="btn-1">First</button>
              <button data-testid="btn-2">Second</button>
            </>
          }
        />,
      )
      await expect.element(screen.getByTestId('btn-1')).toBeVisible()
      await expect.element(screen.getByTestId('btn-2')).toBeVisible()
    })

    it('renders action buttons that can be clicked', async () => {
      const screen = await render(
        <PageHeader
          title="Dashboard"
          actions={<button data-testid="clickable-btn">Click me</button>}
        />,
      )
      const button = screen.getByTestId('clickable-btn')
      await expect.element(button).toBeVisible()
    })
  })

  describe('full composition', () => {
    it('renders title, description, and actions together', async () => {
      const screen = await render(
        <PageHeader
          title="Settings"
          description="Manage your preferences"
          actions={<button data-testid="save-btn">Save</button>}
        />,
      )
      await expect
        .element(screen.getByRole('heading', { level: 1, name: 'Settings' }))
        .toBeVisible()
      await expect
        .element(screen.getByText('Manage your preferences'))
        .toBeVisible()
      await expect.element(screen.getByTestId('save-btn')).toBeVisible()
    })
  })
})
