/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { Suspense, lazy } from 'react'
import { useOnboardingStore } from '@/stores/onboardingStore'

const ActiveOnboarding = lazy(() =>
  import('@/features/onboarding/ActiveOnboarding').then((m) => ({
    default: m.ActiveOnboarding,
  })),
)

/**
 * Mounted once in the authenticated layout; finished/skipped users pay only
 * this status read — everything else is code-split behind ActiveOnboarding.
 */
export function OnboardingController() {
  const status = useOnboardingStore((state) => state.status)

  if (status !== 'not-started' && status !== 'active') return null

  return (
    <Suspense fallback={null}>
      <ActiveOnboarding />
    </Suspense>
  )
}
