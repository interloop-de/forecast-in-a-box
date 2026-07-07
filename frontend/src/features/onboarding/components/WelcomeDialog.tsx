/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { Trans, useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Link, P } from '@/components/base/typography'
import { Logo } from '@/components/common/Logo'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { buildChecklist } from '@/features/onboarding/checklist'
import { CHECKLIST_ITEM_TITLE_KEYS } from '@/features/onboarding/itemText'
import { useCanManagePlugins } from '@/features/onboarding/hooks/useCanManagePlugins'

interface WelcomeDialogProps {
  /** Live catalogue state — decides whether the plugin step is listed. */
  pluginStepNeeded: boolean
}

/** First-visit welcome: what the guide leads to, and the path it takes. */
export function WelcomeDialog({ pluginStepNeeded }: WelcomeDialogProps) {
  const { t } = useTranslation('onboarding')
  const canManagePlugins = useCanManagePlugins()
  const milestones = useOnboardingStore((state) => state.milestones)

  const items = buildChecklist({
    pluginStepNeeded,
    canManagePlugins,
    milestones,
  })

  // Closing via Esc / X / backdrop is a soft "not now" — the guide stays
  // reachable from the Help button.
  const handleOpenChange = (open: boolean) => {
    if (!open) useOnboardingStore.getState().snooze()
  }

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <Logo className="mb-2" />
          <DialogTitle className="text-lg">{t('welcome.title')}</DialogTitle>
          <DialogDescription>{t('welcome.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <P className="font-medium">{t('welcome.stepsIntro')}</P>
          <ol className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span>{t(CHECKLIST_ITEM_TITLE_KEYS[item.id])}</span>
              </li>
            ))}
          </ol>
        </div>

        <P className="text-xs text-muted-foreground">
          <Trans
            t={t}
            i18nKey="welcome.learnMore"
            components={{
              anemoi: <Link href="https://github.com/ecmwf/anemoi" />,
              earthkit: <Link href="https://earthkit.ecmwf.int" />,
            }}
          />
        </P>

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => useOnboardingStore.getState().skip()}
          >
            {t('welcome.dontShowAgain')}
          </Button>
          <Button
            variant="outline"
            onClick={() => useOnboardingStore.getState().snooze()}
          >
            {t('welcome.later')}
          </Button>
          <Button onClick={() => useOnboardingStore.getState().start()}>
            {t('welcome.start')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
