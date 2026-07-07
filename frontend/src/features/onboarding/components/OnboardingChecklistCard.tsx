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
 * Dashboard face of the guide: checklist while items remain, congratulations
 * once done. Renders nothing unless the guide is active.
 */

import { useTranslation } from 'react-i18next'
import { CheckCircle2, Lock, MoreVertical, PartyPopper } from 'lucide-react'
import type { DashboardVariant, PanelShadow } from '@/stores/uiStore'
import type { ChecklistItem } from '@/features/onboarding/checklist'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { H2, P } from '@/components/base/typography'
import { useJobStatus } from '@/api/hooks/useJobs'
import { useOnboardingStore } from '@/stores/onboardingStore'
import {
  buildChecklist,
  checklistProgress,
  nextChecklistItem,
} from '@/features/onboarding/checklist'
import {
  CHECKLIST_ITEM_DESCRIPTION_KEYS,
  CHECKLIST_ITEM_TITLE_KEYS,
} from '@/features/onboarding/itemText'
import { useCanManagePlugins } from '@/features/onboarding/hooks/useCanManagePlugins'
import { useChecklistNavigation } from '@/features/onboarding/hooks/useChecklistNavigation'

interface OnboardingChecklistCardProps {
  variant?: DashboardVariant
  shadow?: PanelShadow
}

export function OnboardingChecklistCard({
  variant,
  shadow,
}: OnboardingChecklistCardProps) {
  const { t } = useTranslation('onboarding')
  const status = useOnboardingStore((state) => state.status)
  const pluginStepNeeded = useOnboardingStore((state) => state.pluginStepNeeded)
  const milestones = useOnboardingStore((state) => state.milestones)
  const firstRunJobId = useOnboardingStore((state) => state.firstRunJobId)
  const canManagePlugins = useCanManagePlugins()
  const goToItem = useChecklistNavigation(firstRunJobId)

  // Polling stops on its own once the run reaches a terminal status.
  const { data: run } = useJobStatus(firstRunJobId ?? undefined)
  const runFailed = run?.status === 'failed' && !milestones.resultViewed

  if (status !== 'active') return null

  const items = buildChecklist({
    // Until frozen (catalogue still loading) leave the plugin item out
    // rather than flashing it in and back out.
    pluginStepNeeded: pluginStepNeeded === true,
    canManagePlugins,
    milestones,
  })
  const progress = checklistProgress(items)
  const next = nextChecklistItem(items)

  if (progress.allDone) {
    return (
      <Card variant={variant} shadow={shadow} className="gap-3 p-6">
        <div className="flex items-center gap-3">
          <PartyPopper className="size-6 shrink-0 text-primary" />
          <H2 className="text-xl font-semibold">{t('completion.title')}</H2>
        </div>
        <P className="text-muted-foreground">{t('completion.description')}</P>
        <P>{t('completion.next')}</P>
        <div className="flex items-center justify-between gap-4">
          <P className="text-xs text-muted-foreground">
            {t('completion.reopenHint')}
          </P>
          <Button onClick={() => useOnboardingStore.getState().complete()}>
            {t('completion.done')}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card variant={variant} shadow={shadow} className="gap-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <H2 className="text-xl font-semibold">{t('card.title')}</H2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground tabular-nums">
            {t('card.progressLabel', {
              done: progress.done,
              total: progress.total,
            })}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label={t('card.menuLabel')}
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => useOnboardingStore.getState().restart()}
              >
                {t('card.startOver')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => useOnboardingStore.getState().skip()}
              >
                {t('card.dismiss')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Progress value={(progress.done / progress.total) * 100} />

      <ol className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-start gap-3">
            <ItemStateIcon item={item} index={index} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className={
                  item.complete
                    ? 'font-medium text-muted-foreground'
                    : 'font-medium'
                }
              >
                {t(CHECKLIST_ITEM_TITLE_KEYS[item.id])}
              </span>
              <ItemDescription item={item} runFailed={runFailed} />
            </div>
            {next?.id === item.id && !item.locked && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto shrink-0"
                onClick={() => goToItem(item.id)}
              >
                <ItemActionLabel item={item} />
              </Button>
            )}
          </li>
        ))}
      </ol>
    </Card>
  )
}

function ItemStateIcon({
  item,
  index,
}: {
  item: ChecklistItem
  index: number
}) {
  if (item.complete) {
    return <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
  }
  if (item.locked) {
    return <Lock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
  }
  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {index + 1}
    </span>
  )
}

function ItemDescription({
  item,
  runFailed,
}: {
  item: ChecklistItem
  runFailed: boolean
}) {
  const { t } = useTranslation('onboarding')

  if (item.id === 'installPlugin' && item.locked) {
    return (
      <span className="text-sm text-muted-foreground">
        {t('items.installPlugin.locked')}
      </span>
    )
  }
  if (item.id === 'runForecast' && runFailed) {
    return (
      <span className="text-sm text-destructive">
        {t('items.runForecast.failed')}
      </span>
    )
  }
  if (item.complete) return null
  return (
    <span className="text-sm text-muted-foreground">
      {t(CHECKLIST_ITEM_DESCRIPTION_KEYS[item.id])}
    </span>
  )
}

function ItemActionLabel({ item }: { item: ChecklistItem }) {
  const { t } = useTranslation('onboarding')

  switch (item.id) {
    case 'installPlugin':
      return t('items.installPlugin.action')
    // Both run-related items act in the builder, reached via the recipe.
    case 'openRecipe':
    case 'runForecast':
      return t('items.openRecipe.action')
    case 'viewResults':
      return t('items.viewResults.action')
  }
}
