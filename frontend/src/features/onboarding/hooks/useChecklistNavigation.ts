/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { useNavigate } from '@tanstack/react-router'
import type { ChecklistItemId } from '@/features/onboarding/checklist'
import { FIRST_FORECAST_PRESET_ID } from '@/features/onboarding/checklist'

/** Deep-link to the page where a checklist item is acted on. */
export function useChecklistNavigation(firstRunJobId: string | null) {
  const navigate = useNavigate()

  return (id: ChecklistItemId) => {
    switch (id) {
      case 'installPlugin':
        navigate({ to: '/admin/plugins' })
        break
      case 'openRecipe':
      case 'runForecast':
        navigate({
          to: '/configure',
          search: { preset: FIRST_FORECAST_PRESET_ID },
        })
        break
      case 'viewResults':
        if (firstRunJobId) {
          navigate({
            to: '/executions/$jobId',
            params: { jobId: firstRunJobId },
          })
        }
        break
    }
  }
}
