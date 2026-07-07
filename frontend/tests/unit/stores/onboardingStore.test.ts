/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { useOnboardingStore } from '@/stores/onboardingStore'

describe('onboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.getState().reset()
  })

  it('starts pristine', () => {
    const state = useOnboardingStore.getState()
    expect(state.status).toBe('not-started')
    expect(state.pluginStepNeeded).toBeNull()
    expect(state.firstRunJobId).toBeNull()
    expect(Object.values(state.milestones)).toEqual([
      false,
      false,
      false,
      false,
    ])
  })

  it('transitions through start / snooze / skip / complete', () => {
    const store = useOnboardingStore
    store.getState().start()
    expect(store.getState().status).toBe('active')
    store.getState().snooze()
    expect(store.getState().status).toBe('snoozed')
    store.getState().skip()
    expect(store.getState().status).toBe('skipped')
    store.getState().complete()
    expect(store.getState().status).toBe('completed')
  })

  it('reopen keeps a never-started guide at the welcome dialog', () => {
    useOnboardingStore.getState().reopen()
    expect(useOnboardingStore.getState().status).toBe('not-started')
  })

  it('reopen reactivates a skipped or completed guide with progress intact', () => {
    const store = useOnboardingStore
    store.getState().start()
    store.getState().markMilestone('presetOpened')
    store.getState().skip()

    store.getState().reopen()
    expect(store.getState().status).toBe('active')
    expect(store.getState().milestones.presetOpened).toBe(true)
  })

  it('restart wipes progress and reactivates', () => {
    const store = useOnboardingStore
    store.getState().start()
    store.getState().setPluginStepNeeded(true)
    store.getState().markMilestone('pluginReady')
    store.getState().setFirstRunJobId('run-1')

    store.getState().restart()
    const state = store.getState()
    expect(state.status).toBe('active')
    expect(state.pluginStepNeeded).toBeNull()
    expect(state.milestones.pluginReady).toBe(false)
    expect(state.firstRunJobId).toBeNull()
  })

  it('records milestones individually', () => {
    const store = useOnboardingStore
    store.getState().markMilestone('runSubmitted')
    expect(store.getState().milestones).toMatchObject({
      runSubmitted: true,
      pluginReady: false,
    })
  })
})
