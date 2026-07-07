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
import type { OnboardingMilestones } from '@/stores/onboardingStore'
import {
  buildChecklist,
  checklistProgress,
  nextChecklistItem,
} from '@/features/onboarding/checklist'

function milestones(
  overrides: Partial<OnboardingMilestones> = {},
): OnboardingMilestones {
  return {
    pluginReady: false,
    presetOpened: false,
    runSubmitted: false,
    resultViewed: false,
    ...overrides,
  }
}

describe('buildChecklist', () => {
  it('omits the plugin item when the app already had a plugin at start', () => {
    const items = buildChecklist({
      pluginStepNeeded: false,
      canManagePlugins: true,
      milestones: milestones(),
    })
    expect(items.map((item) => item.id)).toEqual([
      'openRecipe',
      'runForecast',
      'viewResults',
    ])
  })

  it('includes the plugin item first when a plugin was missing at start', () => {
    const items = buildChecklist({
      pluginStepNeeded: true,
      canManagePlugins: true,
      milestones: milestones(),
    })
    expect(items.map((item) => item.id)).toEqual([
      'installPlugin',
      'openRecipe',
      'runForecast',
      'viewResults',
    ])
    expect(items[0].locked).toBe(false)
  })

  it('locks the plugin item for users who cannot manage plugins', () => {
    const items = buildChecklist({
      pluginStepNeeded: true,
      canManagePlugins: false,
      milestones: milestones(),
    })
    expect(items[0]).toMatchObject({ id: 'installPlugin', locked: true })
  })

  it('unlocks the plugin item once a plugin is ready, even for non-admins', () => {
    const items = buildChecklist({
      pluginStepNeeded: true,
      canManagePlugins: false,
      milestones: milestones({ pluginReady: true }),
    })
    expect(items[0]).toMatchObject({
      id: 'installPlugin',
      complete: true,
      locked: false,
    })
  })

  it('maps milestones onto item completion', () => {
    const items = buildChecklist({
      pluginStepNeeded: true,
      canManagePlugins: true,
      milestones: milestones({
        pluginReady: true,
        presetOpened: true,
        runSubmitted: true,
      }),
    })
    expect(items.map((item) => item.complete)).toEqual([
      true,
      true,
      true,
      false,
    ])
  })
})

describe('checklistProgress', () => {
  it('counts completed items', () => {
    const items = buildChecklist({
      pluginStepNeeded: true,
      canManagePlugins: true,
      milestones: milestones({ pluginReady: true, presetOpened: true }),
    })
    expect(checklistProgress(items)).toEqual({
      done: 2,
      total: 4,
      allDone: false,
    })
  })

  it('reports allDone when every item is complete', () => {
    const items = buildChecklist({
      pluginStepNeeded: false,
      canManagePlugins: true,
      milestones: milestones({
        presetOpened: true,
        runSubmitted: true,
        resultViewed: true,
      }),
    })
    expect(checklistProgress(items)).toEqual({
      done: 3,
      total: 3,
      allDone: true,
    })
  })
})

describe('nextChecklistItem', () => {
  it('returns the first incomplete item', () => {
    const items = buildChecklist({
      pluginStepNeeded: true,
      canManagePlugins: true,
      milestones: milestones({ pluginReady: true }),
    })
    expect(nextChecklistItem(items)?.id).toBe('openRecipe')
  })

  it('returns undefined when everything is done', () => {
    const items = buildChecklist({
      pluginStepNeeded: false,
      canManagePlugins: true,
      milestones: milestones({
        presetOpened: true,
        runSubmitted: true,
        resultViewed: true,
      }),
    })
    expect(nextChecklistItem(items)).toBeUndefined()
  })
})
