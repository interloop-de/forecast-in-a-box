/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NavigateFn } from '@tanstack/react-router'
import { navigationCommands } from '@/commands/navigationCommands.tsx'

describe('navigationCommands', () => {
  const mockNavigate = vi.fn() as unknown as NavigateFn

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns an array of commands', () => {
    const commands = navigationCommands(mockNavigate)
    expect(Array.isArray(commands)).toBe(true)
    expect(commands.length).toBeGreaterThan(0)
  })

  describe('Getting Started presets', () => {
    it('includes Quick Start preset', () => {
      const commands = navigationCommands(mockNavigate)
      const quickStart = commands.find((c) => c.id === 'preset-quick-start')

      expect(quickStart).toBeDefined()
      expect(quickStart?.label).toBe('Quick Start')
      expect(quickStart?.category).toBe('Getting Started')
    })

    it('includes Standard Forecast preset', () => {
      const commands = navigationCommands(mockNavigate)
      const standard = commands.find((c) => c.id === 'preset-standard')

      expect(standard).toBeDefined()
      expect(standard?.label).toBe('Standard Forecast')
      expect(standard?.category).toBe('Getting Started')
    })

    it('includes Custom Model preset', () => {
      const commands = navigationCommands(mockNavigate)
      const customModel = commands.find((c) => c.id === 'preset-custom-model')

      expect(customModel).toBeDefined()
      expect(customModel?.label).toBe('Custom Model Forecast')
      expect(customModel?.category).toBe('Getting Started')
    })

    it('includes Dataset preset', () => {
      const commands = navigationCommands(mockNavigate)
      const dataset = commands.find((c) => c.id === 'preset-dataset')

      expect(dataset).toBeDefined()
      expect(dataset?.label).toBe('Dataset Forecast')
      expect(dataset?.category).toBe('Getting Started')
    })

    it('Quick Start action navigates to configure with preset', () => {
      const commands = navigationCommands(mockNavigate)
      const quickStart = commands.find((c) => c.id === 'preset-quick-start')

      quickStart?.action()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'quick-start' },
      })
    })

    it('Standard action navigates to configure with preset', () => {
      const commands = navigationCommands(mockNavigate)
      const standard = commands.find((c) => c.id === 'preset-standard')

      standard?.action()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'standard' },
      })
    })

    it('Custom Model action navigates to configure with preset', () => {
      const commands = navigationCommands(mockNavigate)
      const customModel = commands.find((c) => c.id === 'preset-custom-model')

      customModel?.action()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'custom-model' },
      })
    })

    it('Dataset action navigates to configure with preset', () => {
      const commands = navigationCommands(mockNavigate)
      const dataset = commands.find((c) => c.id === 'preset-dataset')

      dataset?.action()

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/configure',
        search: { preset: 'dataset' },
      })
    })
  })

  describe('Navigation commands', () => {
    it('includes Dashboard navigation', () => {
      const commands = navigationCommands(mockNavigate)
      const dashboard = commands.find((c) => c.id === 'nav-dashboard')

      expect(dashboard).toBeDefined()
      expect(dashboard?.label).toBe('Dashboard')
      expect(dashboard?.category).toBe('Navigation')
    })

    it('includes Configure navigation', () => {
      const commands = navigationCommands(mockNavigate)
      const configure = commands.find((c) => c.id === 'nav-configure')

      expect(configure).toBeDefined()
      expect(configure?.label).toBe('Configure')
      expect(configure?.category).toBe('Navigation')
    })

    it('includes History navigation', () => {
      const commands = navigationCommands(mockNavigate)
      const history = commands.find((c) => c.id === 'nav-history')

      expect(history).toBeDefined()
      expect(history?.label).toBe('History')
      expect(history?.category).toBe('Navigation')
    })

    it('includes Admin navigation', () => {
      const commands = navigationCommands(mockNavigate)
      const admin = commands.find((c) => c.id === 'nav-admin')

      expect(admin).toBeDefined()
      expect(admin?.label).toBe('Admin')
      expect(admin?.category).toBe('Navigation')
    })

    it('Dashboard action navigates to dashboard', () => {
      const commands = navigationCommands(mockNavigate)
      const dashboard = commands.find((c) => c.id === 'nav-dashboard')

      dashboard?.action()

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' })
    })

    it('Configure action navigates to configure', () => {
      const commands = navigationCommands(mockNavigate)
      const configure = commands.find((c) => c.id === 'nav-configure')

      configure?.action()

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/configure' })
    })

    it('History action navigates to history', () => {
      const commands = navigationCommands(mockNavigate)
      const history = commands.find((c) => c.id === 'nav-history')

      history?.action()

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/history' })
    })

    it('Admin action navigates to admin', () => {
      const commands = navigationCommands(mockNavigate)
      const admin = commands.find((c) => c.id === 'nav-admin')

      admin?.action()

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/admin' })
    })
  })

  describe('command properties', () => {
    it('all commands have required properties', () => {
      const commands = navigationCommands(mockNavigate)

      for (const command of commands) {
        expect(command.id).toBeDefined()
        expect(command.label).toBeDefined()
        expect(command.category).toBeDefined()
        expect(command.action).toBeDefined()
        expect(typeof command.action).toBe('function')
      }
    })

    it('all commands have icons', () => {
      const commands = navigationCommands(mockNavigate)

      for (const command of commands) {
        expect(command.icon).toBeDefined()
      }
    })

    it('all commands have keywords for search', () => {
      const commands = navigationCommands(mockNavigate)

      for (const command of commands) {
        expect(command.keywords).toBeDefined()
        expect(Array.isArray(command.keywords)).toBe(true)
        expect(command.keywords!.length).toBeGreaterThan(0)
      }
    })
  })
})
