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
 * CapabilityBadges Component
 *
 * Displays badges for plugin capabilities (source, product, sink)
 */

import { useTranslation } from 'react-i18next'
import type { PluginCapability } from '@/api/types/plugins.types'
import { Badge } from '@/components/ui/badge'

interface CapabilityBadgesProps {
  capabilities: Array<PluginCapability>
  className?: string
}

const capabilityStyles: Record<PluginCapability, string> = {
  source: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  transform:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  product:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  sink: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export function CapabilityBadges({
  capabilities,
  className,
}: CapabilityBadgesProps) {
  const { t } = useTranslation('plugins')

  if (capabilities.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ''}`}>
      {capabilities.map((capability) => (
        <Badge
          key={capability}
          variant="secondary"
          className={`text-xs font-medium ${capabilityStyles[capability]}`}
        >
          {t(`filters.capability.${capability}`)}
        </Badge>
      ))}
    </div>
  )
}
