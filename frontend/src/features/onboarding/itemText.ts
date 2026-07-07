/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

/**
 * i18n key lookup per checklist item — explicit maps (not template strings)
 * so tsc verifies every key against the onboarding namespace.
 */

import type { ChecklistItemId } from '@/features/onboarding/checklist'

export const CHECKLIST_ITEM_TITLE_KEYS = {
  installPlugin: 'items.installPlugin.title',
  openRecipe: 'items.openRecipe.title',
  runForecast: 'items.runForecast.title',
  viewResults: 'items.viewResults.title',
} as const satisfies Record<ChecklistItemId, string>

export const CHECKLIST_ITEM_DESCRIPTION_KEYS = {
  installPlugin: 'items.installPlugin.description',
  openRecipe: 'items.openRecipe.description',
  runForecast: 'items.runForecast.description',
  viewResults: 'items.viewResults.description',
} as const satisfies Record<ChecklistItemId, string>
