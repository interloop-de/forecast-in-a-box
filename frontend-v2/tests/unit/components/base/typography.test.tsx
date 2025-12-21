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
import {
  Blockquote,
  H1,
  H2,
  H3,
  Link,
  List,
  P,
  Typography,
} from '@/components/base/typography'

// Mock TanStack Router Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
}))

describe('Typography Components', () => {
  describe('H1', () => {
    it('renders h1 element', async () => {
      const screen = await render(<H1>Main Title</H1>)
      const heading = screen.getByRole('heading', { level: 1 })
      await expect.element(heading).toBeVisible()
    })

    it('renders children correctly', async () => {
      const screen = await render(<H1>Welcome</H1>)
      await expect.element(screen.getByText('Welcome')).toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(<H1 className="custom-class">Title</H1>)
      await expect.element(screen.getByText('Title')).toBeVisible()
    })
  })

  describe('H2', () => {
    it('renders h2 element', async () => {
      const screen = await render(<H2>Section Title</H2>)
      const heading = screen.getByRole('heading', { level: 2 })
      await expect.element(heading).toBeVisible()
    })

    it('renders children correctly', async () => {
      const screen = await render(<H2>About Us</H2>)
      await expect.element(screen.getByText('About Us')).toBeVisible()
    })
  })

  describe('H3', () => {
    it('renders h3 element', async () => {
      const screen = await render(<H3>Subsection</H3>)
      const heading = screen.getByRole('heading', { level: 3 })
      await expect.element(heading).toBeVisible()
    })

    it('renders children correctly', async () => {
      const screen = await render(<H3>Features</H3>)
      await expect.element(screen.getByText('Features')).toBeVisible()
    })
  })

  describe('P', () => {
    it('renders paragraph', async () => {
      const screen = await render(<P>This is a paragraph of text.</P>)
      await expect
        .element(screen.getByText('This is a paragraph of text.'))
        .toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(<P className="text-lg">Large text</P>)
      await expect.element(screen.getByText('Large text')).toBeVisible()
    })
  })

  describe('Blockquote', () => {
    it('renders blockquote', async () => {
      const screen = await render(<Blockquote>A famous quote</Blockquote>)
      await expect.element(screen.getByText('A famous quote')).toBeVisible()
    })
  })

  describe('List', () => {
    it('renders unordered list', async () => {
      const screen = await render(
        <List>
          <li>Item 1</li>
          <li>Item 2</li>
        </List>,
      )
      await expect.element(screen.getByText('Item 1')).toBeVisible()
      await expect.element(screen.getByText('Item 2')).toBeVisible()
    })
  })

  describe('Typography (generic)', () => {
    it('renders with default p element', async () => {
      const screen = await render(<Typography>Default text</Typography>)
      await expect.element(screen.getByText('Default text')).toBeVisible()
    })

    it('renders with custom element using as prop', async () => {
      const screen = await render(<Typography as="span">Span text</Typography>)
      await expect.element(screen.getByText('Span text')).toBeVisible()
    })

    it('applies variant styling', async () => {
      const screen = await render(
        <Typography variant="h1">Styled as h1</Typography>,
      )
      await expect.element(screen.getByText('Styled as h1')).toBeVisible()
    })
  })

  describe('Link', () => {
    it('renders internal link', async () => {
      const screen = await render(<Link to="/about">About</Link>)
      await expect.element(screen.getByTestId('router-link')).toBeVisible()
      await expect.element(screen.getByText('About')).toBeVisible()
    })

    it('renders external link with target blank', async () => {
      const screen = await render(
        <Link href="https://example.com">External</Link>,
      )
      const link = screen.getByRole('link', { name: 'External' })
      await expect.element(link).toHaveAttribute('target', '_blank')
      await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders external link when external prop is true', async () => {
      const screen = await render(
        <Link to="/" external>
          Forced External
        </Link>,
      )
      const link = screen.getByRole('link', { name: 'Forced External' })
      await expect.element(link).toHaveAttribute('target', '_blank')
    })
  })
})
