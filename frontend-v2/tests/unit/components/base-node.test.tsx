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
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from '@/components/base-node'

describe('BaseNode', () => {
  describe('rendering', () => {
    it('renders with default styling', async () => {
      const screen = await render(
        <BaseNode data-testid="node">Content</BaseNode>,
      )

      const node = screen.getByTestId('node')
      expect(node.element()).toBeTruthy()
      await expect.element(node).toHaveTextContent('Content')
    })

    it('applies custom className', async () => {
      const screen = await render(
        <BaseNode data-testid="node" className="custom-class">
          Content
        </BaseNode>,
      )

      const node = screen.getByTestId('node')
      expect(node.element().classList.contains('custom-class')).toBe(true)
    })

    it('spreads additional props', async () => {
      const screen = await render(
        <BaseNode data-testid="node" data-custom="value">
          Content
        </BaseNode>,
      )

      const node = screen.getByTestId('node')
      expect(node.element().getAttribute('data-custom')).toBe('value')
    })

    it('has tabIndex for accessibility', async () => {
      const screen = await render(
        <BaseNode data-testid="node">Content</BaseNode>,
      )

      const node = screen.getByTestId('node')
      expect(node.element().getAttribute('tabindex')).toBe('0')
    })

    it('has base styling classes', async () => {
      const screen = await render(
        <BaseNode data-testid="node">Content</BaseNode>,
      )

      const node = screen.getByTestId('node')
      const el = node.element()
      expect(el.classList.contains('rounded-md')).toBe(true)
      expect(el.classList.contains('border')).toBe(true)
      expect(el.classList.contains('bg-card')).toBe(true)
    })
  })
})

describe('BaseNodeHeader', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      const screen = await render(
        <BaseNodeHeader data-testid="header">Header Content</BaseNodeHeader>,
      )

      const header = screen.getByTestId('header')
      expect(header.element()).toBeTruthy()
      await expect.element(header).toHaveTextContent('Header Content')
    })

    it('renders as header element', async () => {
      const screen = await render(
        <BaseNodeHeader data-testid="header">Content</BaseNodeHeader>,
      )

      const header = screen.getByTestId('header')
      expect(header.element().tagName.toLowerCase()).toBe('header')
    })

    it('applies custom className', async () => {
      const screen = await render(
        <BaseNodeHeader data-testid="header" className="custom-header">
          Content
        </BaseNodeHeader>,
      )

      const header = screen.getByTestId('header')
      expect(header.element().classList.contains('custom-header')).toBe(true)
    })

    it('spreads additional props', async () => {
      const screen = await render(
        <BaseNodeHeader data-testid="header" aria-label="Header section">
          Content
        </BaseNodeHeader>,
      )

      const header = screen.getByTestId('header')
      expect(header.element().getAttribute('aria-label')).toBe('Header section')
    })
  })
})

describe('BaseNodeHeaderTitle', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      const screen = await render(
        <BaseNodeHeaderTitle data-testid="title">
          Title Text
        </BaseNodeHeaderTitle>,
      )

      const title = screen.getByTestId('title')
      expect(title.element()).toBeTruthy()
      await expect.element(title).toHaveTextContent('Title Text')
    })

    it('renders as h3 element', async () => {
      const screen = await render(
        <BaseNodeHeaderTitle data-testid="title">Title</BaseNodeHeaderTitle>,
      )

      const title = screen.getByTestId('title')
      expect(title.element().tagName.toLowerCase()).toBe('h3')
    })

    it('has data-slot attribute', async () => {
      const screen = await render(
        <BaseNodeHeaderTitle data-testid="title">Title</BaseNodeHeaderTitle>,
      )

      const title = screen.getByTestId('title')
      expect(title.element().getAttribute('data-slot')).toBe('base-node-title')
    })

    it('applies custom className', async () => {
      const screen = await render(
        <BaseNodeHeaderTitle data-testid="title" className="custom-title">
          Title
        </BaseNodeHeaderTitle>,
      )

      const title = screen.getByTestId('title')
      expect(title.element().classList.contains('custom-title')).toBe(true)
    })

    it('has font-semibold styling', async () => {
      const screen = await render(
        <BaseNodeHeaderTitle data-testid="title">Title</BaseNodeHeaderTitle>,
      )

      const title = screen.getByTestId('title')
      expect(title.element().classList.contains('font-semibold')).toBe(true)
    })
  })
})

describe('BaseNodeContent', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      const screen = await render(
        <BaseNodeContent data-testid="content">Content Text</BaseNodeContent>,
      )

      const content = screen.getByTestId('content')
      expect(content.element()).toBeTruthy()
      await expect.element(content).toHaveTextContent('Content Text')
    })

    it('renders as div element', async () => {
      const screen = await render(
        <BaseNodeContent data-testid="content">Content</BaseNodeContent>,
      )

      const content = screen.getByTestId('content')
      expect(content.element().tagName.toLowerCase()).toBe('div')
    })

    it('has data-slot attribute', async () => {
      const screen = await render(
        <BaseNodeContent data-testid="content">Content</BaseNodeContent>,
      )

      const content = screen.getByTestId('content')
      expect(content.element().getAttribute('data-slot')).toBe(
        'base-node-content',
      )
    })

    it('applies custom className', async () => {
      const screen = await render(
        <BaseNodeContent data-testid="content" className="custom-content">
          Content
        </BaseNodeContent>,
      )

      const content = screen.getByTestId('content')
      expect(content.element().classList.contains('custom-content')).toBe(true)
    })

    it('has flex column styling', async () => {
      const screen = await render(
        <BaseNodeContent data-testid="content">Content</BaseNodeContent>,
      )

      const content = screen.getByTestId('content')
      const el = content.element()
      expect(el.classList.contains('flex')).toBe(true)
      expect(el.classList.contains('flex-col')).toBe(true)
    })
  })
})

describe('BaseNodeFooter', () => {
  describe('rendering', () => {
    it('renders children', async () => {
      const screen = await render(
        <BaseNodeFooter data-testid="footer">Footer Content</BaseNodeFooter>,
      )

      const footer = screen.getByTestId('footer')
      expect(footer.element()).toBeTruthy()
      await expect.element(footer).toHaveTextContent('Footer Content')
    })

    it('renders as div element', async () => {
      const screen = await render(
        <BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>,
      )

      const footer = screen.getByTestId('footer')
      expect(footer.element().tagName.toLowerCase()).toBe('div')
    })

    it('has data-slot attribute', async () => {
      const screen = await render(
        <BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>,
      )

      const footer = screen.getByTestId('footer')
      expect(footer.element().getAttribute('data-slot')).toBe(
        'base-node-footer',
      )
    })

    it('applies custom className', async () => {
      const screen = await render(
        <BaseNodeFooter data-testid="footer" className="custom-footer">
          Footer
        </BaseNodeFooter>,
      )

      const footer = screen.getByTestId('footer')
      expect(footer.element().classList.contains('custom-footer')).toBe(true)
    })

    it('has border-t styling', async () => {
      const screen = await render(
        <BaseNodeFooter data-testid="footer">Footer</BaseNodeFooter>,
      )

      const footer = screen.getByTestId('footer')
      expect(footer.element().classList.contains('border-t')).toBe(true)
    })
  })
})

describe('BaseNode composition', () => {
  it('renders complete node with all parts', async () => {
    const screen = await render(
      <BaseNode data-testid="node">
        <BaseNodeHeader data-testid="header">
          <BaseNodeHeaderTitle data-testid="title">
            Node Title
          </BaseNodeHeaderTitle>
        </BaseNodeHeader>
        <BaseNodeContent data-testid="content">
          Node content goes here
        </BaseNodeContent>
        <BaseNodeFooter data-testid="footer">Footer actions</BaseNodeFooter>
      </BaseNode>,
    )

    await expect.element(screen.getByTestId('node')).toBeInTheDocument()
    await expect.element(screen.getByTestId('header')).toBeInTheDocument()
    await expect
      .element(screen.getByTestId('title'))
      .toHaveTextContent('Node Title')
    await expect
      .element(screen.getByTestId('content'))
      .toHaveTextContent('Node content goes here')
    await expect
      .element(screen.getByTestId('footer'))
      .toHaveTextContent('Footer actions')
  })
})
