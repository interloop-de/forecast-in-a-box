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
 * Onboarding Integration Tests
 *
 * - Welcome dialog: step list adapts to plugin state, actions persist status
 * - Checklist card: progress fraction, item states, completion celebration
 */

import { beforeAll, describe, expect, it } from 'vitest'
import { renderWithRouter } from '@tests/utils/render'
import type { AuthContextValue } from '@/features/auth/AuthContext'
import { AuthContext } from '@/features/auth/AuthContext'
import { WelcomeDialog } from '@/features/onboarding/components/WelcomeDialog'
import { OnboardingChecklistCard } from '@/features/onboarding/components/OnboardingChecklistCard'
import { useOnboardingStore } from '@/stores/onboardingStore'

const anonymousAuth: AuthContextValue = {
  isLoading: false,
  isAuthenticated: true,
  authType: 'anonymous',
  signIn: () => {},
  signOut: () => Promise.resolve(),
}

function withAuth(ui: React.ReactNode) {
  return <AuthContext.Provider value={anonymousAuth}>{ui}</AuthContext.Provider>
}

describe('Onboarding', () => {
  // Browser-mode tests render without the app stylesheet, so the dialog loses
  // its Tailwind `fixed`/`z-50` positioning while Base UI's modal backdrop
  // keeps its inline `position: fixed`. Restore the dialog's production
  // stacking so the backdrop can't paint over the popup and swallow clicks —
  // pinned to the viewport origin so the footer buttons stay clickable.
  beforeAll(() => {
    const style = document.createElement('style')
    style.textContent =
      '[data-slot="dialog-content"]{position:fixed;top:0;left:0;z-index:50;max-height:100vh;overflow:auto}'
    document.head.appendChild(style)
  })

  describe('WelcomeDialog', () => {
    it('lists the plugin step when a plugin is missing', async () => {
      const screen = await renderWithRouter(
        withAuth(<WelcomeDialog pluginStepNeeded />),
      )

      await expect.element(screen.getByText(/first AI forecast/i)).toBeVisible()
      await expect
        .element(screen.getByText('Install the ECMWF plugin'))
        .toBeVisible()
    })

    it('omits the plugin step when a plugin is already loaded', async () => {
      const screen = await renderWithRouter(
        withAuth(<WelcomeDialog pluginStepNeeded={false} />),
      )

      await expect
        .element(screen.getByText('Open your first forecast recipe'))
        .toBeVisible()
      expect(screen.getByText('Install the ECMWF plugin').query()).toBeNull()
    })

    it('starts the guide from the primary action', async () => {
      const screen = await renderWithRouter(
        withAuth(<WelcomeDialog pluginStepNeeded={false} />),
      )

      await screen.getByRole('button', { name: "Let's go" }).click()
      expect(useOnboardingStore.getState().status).toBe('active')
    })

    it('supports "maybe later" and "don\'t show again"', async () => {
      const screen = await renderWithRouter(
        withAuth(<WelcomeDialog pluginStepNeeded={false} />),
      )

      await screen.getByRole('button', { name: 'Maybe later' }).click()
      expect(useOnboardingStore.getState().status).toBe('snoozed')

      useOnboardingStore.getState().reset()
      const screen2 = await renderWithRouter(
        withAuth(<WelcomeDialog pluginStepNeeded={false} />),
      )
      await screen2
        .getByRole('button', { name: "Don't show this again" })
        .click()
      expect(useOnboardingStore.getState().status).toBe('skipped')
    })
  })

  describe('OnboardingChecklistCard', () => {
    it('renders nothing while the guide is not active', async () => {
      const screen = await renderWithRouter(
        withAuth(<OnboardingChecklistCard />),
      )
      expect(screen.getByText('Getting set up').query()).toBeNull()
    })

    it('shows progress over the visible items', async () => {
      useOnboardingStore.getState().start()
      useOnboardingStore.getState().setPluginStepNeeded(true)
      useOnboardingStore.getState().markMilestone('pluginReady')

      const screen = await renderWithRouter(
        withAuth(<OnboardingChecklistCard />),
      )

      await expect.element(screen.getByText('Getting set up')).toBeVisible()
      await expect.element(screen.getByText('1 of 4')).toBeVisible()
      await expect
        .element(screen.getByText('Open your first forecast recipe'))
        .toBeVisible()
    })

    it('celebrates and completes once every item is done', async () => {
      const store = useOnboardingStore.getState()
      store.start()
      store.setPluginStepNeeded(false)
      store.markMilestone('presetOpened')
      store.markMilestone('runSubmitted')
      store.markMilestone('resultViewed')

      const screen = await renderWithRouter(
        withAuth(<OnboardingChecklistCard />),
      )

      await expect.element(screen.getByText(/you just ran it/i)).toBeVisible()
      await screen.getByRole('button', { name: 'Done' }).click()
      expect(useOnboardingStore.getState().status).toBe('completed')
    })
  })
})
