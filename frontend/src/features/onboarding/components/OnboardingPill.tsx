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
 * Cross-page progress pill expanding to a compact checklist. Bottom-left,
 * clear of the sonner toasts bottom-right.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ChevronDown, ListChecks, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '@/components/ui/progress'
import { useOnboardingStore } from '@/stores/onboardingStore'
import {
  buildChecklist,
  checklistProgress,
  nextChecklistItem,
} from '@/features/onboarding/checklist'
import { CHECKLIST_ITEM_TITLE_KEYS } from '@/features/onboarding/itemText'
import { useCanManagePlugins } from '@/features/onboarding/hooks/useCanManagePlugins'
import { useChecklistNavigation } from '@/features/onboarding/hooks/useChecklistNavigation'

export function OnboardingPill() {
  const { t } = useTranslation('onboarding')
  const [expanded, setExpanded] = useState(false)
  const pluginStepNeeded = useOnboardingStore((state) => state.pluginStepNeeded)
  const milestones = useOnboardingStore((state) => state.milestones)
  const firstRunJobId = useOnboardingStore((state) => state.firstRunJobId)
  const canManagePlugins = useCanManagePlugins()
  const goToItem = useChecklistNavigation(firstRunJobId)

  const items = buildChecklist({
    pluginStepNeeded: pluginStepNeeded === true,
    canManagePlugins,
    milestones,
  })
  const progress = checklistProgress(items)
  const next = nextChecklistItem(items)

  if (expanded) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <Card className="w-72 animate-in gap-3 p-4 shadow-lg fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{t('pill.label')}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label={t('pill.collapse')}
              onClick={() => setExpanded(false)}
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
          <ol className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                {item.complete ? (
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                ) : item.locked ? (
                  <Lock className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-muted-foreground/40" />
                )}
                {next?.id === item.id && !item.locked ? (
                  <button
                    type="button"
                    className="truncate text-left underline-offset-3 hover:underline"
                    onClick={() => goToItem(item.id)}
                  >
                    {t(CHECKLIST_ITEM_TITLE_KEYS[item.id])}
                  </button>
                ) : (
                  <span
                    className={
                      item.complete
                        ? 'truncate text-muted-foreground'
                        : 'truncate'
                    }
                  >
                    {t(CHECKLIST_ITEM_TITLE_KEYS[item.id])}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        type="button"
        aria-label={t('pill.expand')}
        onClick={() => setExpanded(true)}
        className="flex animate-in items-center gap-3 rounded-full border border-border bg-card py-2 pr-4 pl-3 text-sm shadow-lg transition-colors fade-in-0 zoom-in-95 hover:bg-muted"
      >
        <ListChecks className="size-4 text-primary" />
        <span className="font-medium">{t('pill.label')}</span>
        <span className="text-muted-foreground tabular-nums">
          {t('card.progressLabel', {
            done: progress.done,
            total: progress.total,
          })}
        </span>
        <Progress
          value={(progress.done / progress.total) * 100}
          className="w-16"
        >
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      </button>
    </div>
  )
}
