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
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('renders spinner element', async () => {
      const screen = await render(<LoadingSpinner />)
      expect(screen).toBeDefined()
    })

    it('renders with text when provided', async () => {
      const screen = await render(<LoadingSpinner text="Loading data..." />)
      await expect.element(screen.getByText('Loading data...')).toBeVisible()
    })
  })

  describe('size variants', () => {
    it('renders with small size', async () => {
      const screen = await render(<LoadingSpinner size="sm" />)
      expect(screen).toBeDefined()
    })

    it('renders with medium size by default', async () => {
      const screen = await render(<LoadingSpinner />)
      expect(screen).toBeDefined()
    })

    it('renders with large size', async () => {
      const screen = await render(<LoadingSpinner size="lg" />)
      expect(screen).toBeDefined()
    })
  })

  describe('custom className', () => {
    it('accepts custom className', async () => {
      const screen = await render(<LoadingSpinner className="custom-class" />)
      expect(screen).toBeDefined()
    })
  })

  describe('text display', () => {
    it('shows loading text with spinner', async () => {
      const screen = await render(<LoadingSpinner text="Please wait..." />)
      await expect.element(screen.getByText('Please wait...')).toBeVisible()
    })
  })
})
