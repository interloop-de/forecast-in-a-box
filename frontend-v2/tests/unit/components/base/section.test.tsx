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
  Container,
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/base/section'

describe('Section Components', () => {
  describe('Section', () => {
    it('renders section element by default', async () => {
      const screen = await render(<Section>Content</Section>)
      await expect.element(screen.getByText('Content')).toBeVisible()
    })

    it('renders children', async () => {
      const screen = await render(
        <Section>
          <p>Section content here</p>
        </Section>,
      )
      await expect
        .element(screen.getByText('Section content here'))
        .toBeVisible()
    })

    it('accepts custom element with as prop', async () => {
      const screen = await render(<Section as="div">Div content</Section>)
      await expect.element(screen.getByText('Div content')).toBeVisible()
    })

    it('accepts variant prop', async () => {
      const screen = await render(
        <Section variant="muted">Muted section</Section>,
      )
      await expect.element(screen.getByText('Muted section')).toBeVisible()
    })

    it('accepts padding prop', async () => {
      const screen = await render(<Section padding="lg">Large padding</Section>)
      await expect.element(screen.getByText('Large padding')).toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(
        <Section className="custom-class">Styled</Section>,
      )
      await expect.element(screen.getByText('Styled')).toBeVisible()
    })
  })

  describe('Container', () => {
    it('renders children', async () => {
      const screen = await render(<Container>Container content</Container>)
      await expect.element(screen.getByText('Container content')).toBeVisible()
    })

    it('accepts size prop', async () => {
      const screen = await render(
        <Container size="sm">Small container</Container>,
      )
      await expect.element(screen.getByText('Small container')).toBeVisible()
    })

    it('accepts lg size', async () => {
      const screen = await render(
        <Container size="lg">Large container</Container>,
      )
      await expect.element(screen.getByText('Large container')).toBeVisible()
    })

    it('accepts full size', async () => {
      const screen = await render(<Container size="full">Full width</Container>)
      await expect.element(screen.getByText('Full width')).toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(
        <Container className="my-class">Styled</Container>,
      )
      await expect.element(screen.getByText('Styled')).toBeVisible()
    })
  })

  describe('SectionHeader', () => {
    it('renders children', async () => {
      const screen = await render(<SectionHeader>Header content</SectionHeader>)
      await expect.element(screen.getByText('Header content')).toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(
        <SectionHeader className="text-center">Centered header</SectionHeader>,
      )
      await expect.element(screen.getByText('Centered header')).toBeVisible()
    })
  })

  describe('SectionTitle', () => {
    it('renders h2 with children', async () => {
      const screen = await render(
        <SectionTitle>Main Section Title</SectionTitle>,
      )
      const heading = screen.getByRole('heading', { level: 2 })
      await expect.element(heading).toBeVisible()
      await expect.element(screen.getByText('Main Section Title')).toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(
        <SectionTitle className="text-primary">Colored title</SectionTitle>,
      )
      await expect.element(screen.getByText('Colored title')).toBeVisible()
    })
  })

  describe('SectionDescription', () => {
    it('renders paragraph with children', async () => {
      const screen = await render(
        <SectionDescription>
          This is a description of the section.
        </SectionDescription>,
      )
      await expect
        .element(screen.getByText('This is a description of the section.'))
        .toBeVisible()
    })

    it('accepts custom className', async () => {
      const screen = await render(
        <SectionDescription className="text-lg">
          Large description
        </SectionDescription>,
      )
      await expect.element(screen.getByText('Large description')).toBeVisible()
    })
  })

  describe('Composition', () => {
    it('renders complete section with all components', async () => {
      const screen = await render(
        <Section variant="muted" padding="default">
          <Container size="default">
            <SectionHeader>
              <SectionTitle>Features</SectionTitle>
              <SectionDescription>
                Discover what makes our product unique.
              </SectionDescription>
            </SectionHeader>
          </Container>
        </Section>,
      )
      await expect.element(screen.getByText('Features')).toBeVisible()
      await expect
        .element(screen.getByText('Discover what makes our product unique.'))
        .toBeVisible()
    })
  })
})
