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
 * Persisted first-run onboarding progress. Milestones derive from real app
 * signals, never "Next" clicks, so progress self-heals against app state.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { STORAGE_KEYS, STORE_VERSIONS } from '@/lib/storage-keys'

export type OnboardingStatus =
  | 'not-started' // never seen — welcome dialog shows on the dashboard
  | 'active' // guide in progress (checklist + pill visible)
  | 'snoozed' // "maybe later" — hidden until reopened via the Help button
  | 'skipped' // "don't show again" / dismissed — hidden until reopened
  | 'completed' // finished — hidden until reopened

export interface OnboardingMilestones {
  /** Block catalogue non-empty — at least one plugin loaded and enabled */
  pluginReady: boolean
  /** The first-forecast recipe was opened in the builder */
  presetOpened: boolean
  /** A run was submitted from the first-forecast recipe */
  runSubmitted: boolean
  /** The maps of the first run were viewed */
  resultViewed: boolean
}

interface OnboardingState {
  status: OnboardingStatus
  /**
   * Whether the guide includes the install-plugin item — frozen at start so
   * it doesn't pop in or vanish mid-flow; null = not yet determined.
   */
  pluginStepNeeded: boolean | null
  milestones: OnboardingMilestones
  /** Run id of the forecast submitted during onboarding */
  firstRunJobId: string | null

  start: () => void
  snooze: () => void
  skip: () => void
  complete: () => void
  /** Reopen the guide from the Help button, preserving progress */
  reopen: () => void
  /** Full reset ("Start over"): clears milestones and restarts the guide */
  restart: () => void
  setPluginStepNeeded: (needed: boolean) => void
  markMilestone: (milestone: keyof OnboardingMilestones) => void
  setFirstRunJobId: (jobId: string) => void
  /** Back to a pristine never-seen state (tests, storage reset) */
  reset: () => void
}

const initialMilestones: OnboardingMilestones = {
  pluginReady: false,
  presetOpened: false,
  runSubmitted: false,
  resultViewed: false,
}

const initialState = {
  status: 'not-started' as OnboardingStatus,
  pluginStepNeeded: null as boolean | null,
  milestones: initialMilestones,
  firstRunJobId: null as string | null,
}

export const useOnboardingStore = create<OnboardingState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        start: () => set({ status: 'active' }),
        snooze: () => set({ status: 'snoozed' }),
        skip: () => set({ status: 'skipped' }),
        complete: () => set({ status: 'completed' }),

        // From 'not-started' stay put so the welcome dialog still shows first.
        reopen: () =>
          set((state) =>
            state.status === 'not-started' ? {} : { status: 'active' },
          ),
        restart: () => set({ ...initialState, status: 'active' }),

        setPluginStepNeeded: (pluginStepNeeded) => set({ pluginStepNeeded }),
        markMilestone: (milestone) =>
          set((state) => ({
            milestones: { ...state.milestones, [milestone]: true },
          })),
        setFirstRunJobId: (firstRunJobId) => set({ firstRunJobId }),
        reset: () => set({ ...initialState }),
      }),
      {
        name: STORAGE_KEYS.stores.onboarding,
        version: STORE_VERSIONS.onboarding,
        partialize: (state) => ({
          status: state.status,
          pluginStepNeeded: state.pluginStepNeeded,
          milestones: state.milestones,
          firstRunJobId: state.firstRunJobId,
        }),
      },
    ),
    { name: 'OnboardingStore' },
  ),
)
