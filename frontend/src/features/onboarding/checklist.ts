/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

/** Pure checklist logic: which items the guide shows and which are complete. */

import type { OnboardingMilestones } from '@/stores/onboardingStore'
import type { PresetId } from '@/features/fable-builder/presets/presets'

/** The preset the guide's first forecast is built on. */
export const FIRST_FORECAST_PRESET_ID = 'first-forecast' satisfies PresetId

export type ChecklistItemId =
  | 'installPlugin'
  | 'openRecipe'
  | 'runForecast'
  | 'viewResults'

export interface ChecklistContext {
  /** Frozen at guide start: was a plugin missing at that moment? */
  pluginStepNeeded: boolean
  /** Anonymous mode or superuser — may visit /admin/plugins */
  canManagePlugins: boolean
  milestones: OnboardingMilestones
}

export interface ChecklistItem {
  id: ChecklistItemId
  complete: boolean
  /** Plugin item for non-admins: cannot act, waits on an administrator */
  locked: boolean
}

/**
 * The items of the setup guide, in order. The plugin item is omitted
 * entirely when the app already had a working plugin at guide start —
 * users shouldn't be told about a problem they never had.
 */
export function buildChecklist(ctx: ChecklistContext): Array<ChecklistItem> {
  const items: Array<ChecklistItem> = []

  if (ctx.pluginStepNeeded) {
    items.push({
      id: 'installPlugin',
      complete: ctx.milestones.pluginReady,
      locked: !ctx.canManagePlugins && !ctx.milestones.pluginReady,
    })
  }

  items.push(
    { id: 'openRecipe', complete: ctx.milestones.presetOpened, locked: false },
    { id: 'runForecast', complete: ctx.milestones.runSubmitted, locked: false },
    { id: 'viewResults', complete: ctx.milestones.resultViewed, locked: false },
  )

  return items
}

export interface ChecklistProgress {
  done: number
  total: number
  allDone: boolean
}

export function checklistProgress(
  items: Array<ChecklistItem>,
): ChecklistProgress {
  const done = items.filter((item) => item.complete).length
  return { done, total: items.length, allDone: done === items.length }
}

/**
 * The next item the user should act on: the first incomplete one.
 * Undefined when everything is done.
 */
export function nextChecklistItem(
  items: Array<ChecklistItem>,
): ChecklistItem | undefined {
  return items.find((item) => !item.complete)
}
