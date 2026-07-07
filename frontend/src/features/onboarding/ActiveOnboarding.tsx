/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

/** Records guide milestones from real app signals and renders its overlays. */

import { useEffect } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useBlockCatalogue } from '@/api/hooks/useFable'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { FIRST_FORECAST_PRESET_ID } from '@/features/onboarding/checklist'
import { AnchorPopover } from '@/features/onboarding/components/AnchorPopover'
import { OnboardingPill } from '@/features/onboarding/components/OnboardingPill'
import { WelcomeDialog } from '@/features/onboarding/components/WelcomeDialog'
import { useCanManagePlugins } from '@/features/onboarding/hooks/useCanManagePlugins'

/** The Install button on the ECMWF plugin's card in the plugin store. */
const ECMWF_INSTALL_SELECTOR =
  '[data-onboarding="plugin-install"][data-onboarding-key="ecmwf/ecmwf-base"]'
/** The Run Once button in the fable-builder header. */
const RUN_ONCE_SELECTOR = '[data-onboarding="run-once"]'

export function ActiveOnboarding() {
  const { t } = useTranslation('onboarding')
  const status = useOnboardingStore((state) => state.status)
  const pluginStepNeeded = useOnboardingStore((state) => state.pluginStepNeeded)
  const milestones = useOnboardingStore((state) => state.milestones)
  const canManagePlugins = useCanManagePlugins()

  const catalogue = useBlockCatalogue()
  const catalogueReady =
    !!catalogue.data && Object.keys(catalogue.data).length > 0
  const catalogueSettled = catalogue.isSuccess || catalogue.isError

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const presetParam = useRouterState({
    select: (state) => (state.location.search as { preset?: string }).preset,
  })

  // Freeze whether the plugin item belongs to this guide, once, from the
  // catalogue state when the guide starts (also after "Start over").
  useEffect(() => {
    if (status === 'active' && pluginStepNeeded === null && catalogueSettled) {
      useOnboardingStore.getState().setPluginStepNeeded(!catalogueReady)
    }
  }, [status, pluginStepNeeded, catalogueSettled, catalogueReady])

  // Milestone: a plugin is loaded — however it got installed (guide, another
  // tab, an administrator, or the backend's own bootstrap).
  useEffect(() => {
    if (status === 'active' && catalogueReady && !milestones.pluginReady) {
      useOnboardingStore.getState().markMilestone('pluginReady')
    }
  }, [status, catalogueReady, milestones.pluginReady])

  // Milestone: the first-forecast recipe is open in the builder.
  useEffect(() => {
    if (
      status === 'active' &&
      !milestones.presetOpened &&
      pathname === '/configure' &&
      presetParam === FIRST_FORECAST_PRESET_ID
    ) {
      useOnboardingStore.getState().markMilestone('presetOpened')
    }
  }, [status, milestones.presetOpened, pathname, presetParam])

  // The welcome dialog waits for the catalogue to settle so its step list
  // already knows whether plugin installation is part of the journey.
  const showWelcome =
    status === 'not-started' &&
    pathname.startsWith('/dashboard') &&
    catalogueSettled

  if (showWelcome) {
    return <WelcomeDialog pluginStepNeeded={!catalogueReady} />
  }

  if (status !== 'active') return null

  // The two moments where "which button?" genuinely matters get a pointer.
  const showInstallPopover =
    pluginStepNeeded === true &&
    !milestones.pluginReady &&
    canManagePlugins &&
    pathname === '/admin/plugins'
  const showRunOncePopover =
    !milestones.runSubmitted &&
    pathname === '/configure' &&
    presetParam === FIRST_FORECAST_PRESET_ID

  return (
    <>
      {/* Off the dashboard (where the checklist card lives), progress
          follows the user as a floating pill. */}
      {!pathname.startsWith('/dashboard') && <OnboardingPill />}
      {showInstallPopover && (
        <AnchorPopover
          selector={ECMWF_INSTALL_SELECTOR}
          title={t('popovers.installPlugin.title')}
          body={t('popovers.installPlugin.body')}
        />
      )}
      {showRunOncePopover && (
        <AnchorPopover
          selector={RUN_ONCE_SELECTOR}
          title={t('popovers.runOnce.title')}
          body={t('popovers.runOnce.body')}
        />
      )}
    </>
  )
}
