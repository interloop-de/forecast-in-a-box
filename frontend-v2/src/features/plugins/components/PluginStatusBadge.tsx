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
 * PluginStatusBadge Component
 *
 * Displays a status badge for a plugin
 */

import { useTranslation } from 'react-i18next'
import type { PluginStatus } from '@/api/types/plugins.types'
import { cn } from '@/lib/utils'

interface PluginStatusBadgeProps {
  status: PluginStatus
  className?: string
}

export function PluginStatusBadge({
  status,
  className,
}: PluginStatusBadgeProps) {
  const { t } = useTranslation('plugins')

  const statusConfig: Record<
    PluginStatus,
    { label: string; dotClass: string; badgeClass: string }
  > = {
    active: {
      label: t('status.active'),
      dotClass: 'bg-emerald-500',
      badgeClass:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    },
    disabled: {
      label: t('status.disabled'),
      dotClass: 'bg-slate-400',
      badgeClass:
        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    },
    uninstalled: {
      label: t('status.uninstalled'),
      dotClass: 'bg-blue-400',
      badgeClass:
        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
    update_available: {
      label: t('status.updateAvailable'),
      dotClass: 'bg-amber-500',
      badgeClass:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    incompatible: {
      label: t('status.incompatible'),
      dotClass: 'bg-red-400',
      badgeClass:
        'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium',
        config.badgeClass,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
