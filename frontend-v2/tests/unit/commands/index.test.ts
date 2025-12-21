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
import type { Command } from '@/commands'
import { groupCommandsByCategory } from '@/commands'

describe('groupCommandsByCategory', () => {
  it('groups commands by category', () => {
    const commands: Array<Command> = [
      {
        id: 'nav-1',
        label: 'Dashboard',
        category: 'Navigation',
        action: () => {},
      },
      {
        id: 'getting-started-1',
        label: 'Quick Start',
        category: 'Getting Started',
        action: () => {},
      },
      {
        id: 'nav-2',
        label: 'Settings',
        category: 'Navigation',
        action: () => {},
      },
    ]

    const result = groupCommandsByCategory(commands)

    expect(result).toHaveLength(2)
    expect(result[0].category).toBe('Getting Started')
    expect(result[0].commands).toHaveLength(1)
    expect(result[1].category).toBe('Navigation')
    expect(result[1].commands).toHaveLength(2)
  })

  it('returns Getting Started category before Navigation', () => {
    const commands: Array<Command> = [
      {
        id: 'nav-1',
        label: 'Dashboard',
        category: 'Navigation',
        action: () => {},
      },
      {
        id: 'getting-started-1',
        label: 'Quick Start',
        category: 'Getting Started',
        action: () => {},
      },
    ]

    const result = groupCommandsByCategory(commands)

    expect(result[0].category).toBe('Getting Started')
    expect(result[1].category).toBe('Navigation')
  })

  it('returns empty array for empty input', () => {
    const result = groupCommandsByCategory([])
    expect(result).toEqual([])
  })

  it('excludes categories with no commands', () => {
    const commands: Array<Command> = [
      {
        id: 'nav-1',
        label: 'Dashboard',
        category: 'Navigation',
        action: () => {},
      },
    ]

    const result = groupCommandsByCategory(commands)

    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('Navigation')
  })

  it('preserves command properties in groups', () => {
    const mockAction = () => {}
    const commands: Array<Command> = [
      {
        id: 'test-command',
        label: 'Test Label',
        description: 'Test Description',
        shortcut: '⌘T',
        category: 'Navigation',
        keywords: ['test', 'example'],
        action: mockAction,
      },
    ]

    const result = groupCommandsByCategory(commands)

    expect(result[0].commands[0]).toEqual({
      id: 'test-command',
      label: 'Test Label',
      description: 'Test Description',
      shortcut: '⌘T',
      category: 'Navigation',
      keywords: ['test', 'example'],
      action: mockAction,
    })
  })
})
