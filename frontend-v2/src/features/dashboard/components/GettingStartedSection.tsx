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
 * GettingStartedSection Component
 *
 * Section showing different ways to start a forecast configuration
 */

import { BarChart3, Database, Layers, PlayCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { GettingStartedCard } from './GettingStartedCard'
import type { DashboardVariant, PanelShadow } from '@/stores/uiStore'
import type { PresetId } from '@/features/fable-builder/presets'
import { Card } from '@/components/ui/card'

interface GettingStartedSectionProps {
  variant?: DashboardVariant
  shadow?: PanelShadow
}

export function GettingStartedSection({
  variant,
  shadow,
}: GettingStartedSectionProps) {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  const handleCardClick = (preset: PresetId) => {
    navigate({ to: '/configure', search: { preset } })
  }

  const content = (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t('gettingStarted.title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('gettingStarted.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Quick Start - Recommended */}
        <GettingStartedCard
          icon={<PlayCircle className="h-5 w-5" />}
          title={t('gettingStarted.quickStart.title')}
          description={t('gettingStarted.quickStart.description')}
          tags={[
            t('gettingStarted.quickStart.tags.model'),
            t('gettingStarted.quickStart.tags.time'),
            t('gettingStarted.quickStart.tags.products'),
          ]}
          isRecommended
          onClick={() => handleCardClick('quick-start')}
        />

        {/* Standard Forecast */}
        <GettingStartedCard
          icon={<BarChart3 className="h-5 w-5" />}
          title={t('gettingStarted.standard.title')}
          description={t('gettingStarted.standard.description')}
          tags={[
            t('gettingStarted.standard.tags.model'),
            t('gettingStarted.standard.tags.time'),
            t('gettingStarted.standard.tags.config'),
          ]}
          iconColor="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          borderColor="border-border hover:border-blue-400"
          onClick={() => handleCardClick('standard')}
        />

        {/* Custom Model Forecast */}
        <GettingStartedCard
          icon={<Layers className="h-5 w-5" />}
          title={t('gettingStarted.customModel.title')}
          description={t('gettingStarted.customModel.description')}
          tags={[
            t('gettingStarted.customModel.tags.canvas'),
            t('gettingStarted.customModel.tags.control'),
            t('gettingStarted.customModel.tags.advanced'),
          ]}
          iconColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          borderColor="border-border hover:border-emerald-400"
          onClick={() => handleCardClick('custom-model')}
        />

        {/* Dataset Forecast */}
        <GettingStartedCard
          icon={<Database className="h-5 w-5" />}
          title={t('gettingStarted.dataset.title')}
          description={t('gettingStarted.dataset.description')}
          tags={[
            t('gettingStarted.dataset.tags.data'),
            t('gettingStarted.dataset.tags.source'),
            t('gettingStarted.dataset.tags.ready'),
          ]}
          iconColor="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          borderColor="border-border hover:border-purple-400"
          onClick={() => handleCardClick('dataset')}
        />
      </div>
    </>
  )

  // Modern variant: no card wrapper, content floats on page background
  if (variant === 'modern') {
    return <div className="space-y-6">{content}</div>
  }

  return (
    <Card className="p-8" variant={variant} shadow={shadow}>
      {content}
    </Card>
  )
}
