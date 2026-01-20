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
 * PluginRow Component
 *
 * Individual row in the plugins table/list
 */

import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, MoreVertical, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CapabilityBadges } from './CapabilityBadges'
import { PluginIcon } from './PluginIcon'
import { PluginStatusBadge } from './PluginStatusBadge'
import type { PluginCompositeId, PluginInfo } from '@/api/types/plugins.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PluginRowProps {
  plugin: PluginInfo
  onToggle: (compositeId: PluginCompositeId, enabled: boolean) => void
  onUninstall: (compositeId: PluginCompositeId) => void
  onViewDetails?: (plugin: PluginInfo) => void
}

export function PluginRow({
  plugin,
  onToggle,
  onUninstall,
  onViewDetails,
}: PluginRowProps) {
  const { t } = useTranslation('plugins')

  const updatedTimeAgo = plugin.updatedAt
    ? formatDistanceToNow(new Date(plugin.updatedAt), { addSuffix: true })
    : null

  const hasError = plugin.status === 'errored'

  return (
    <div
      className={cn(
        'group grid grid-cols-1 items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/50 sm:grid-cols-12',
        !plugin.isEnabled && 'opacity-75 hover:opacity-100',
        hasError && 'bg-red-50/50 dark:bg-red-950/20',
      )}
    >
      {/* Plugin Details */}
      <div className="flex items-start gap-4 sm:col-span-5">
        <PluginIcon plugin={plugin} />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{plugin.name}</h4>
            {hasError && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    {plugin.errorDetail || t('status.errored')}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {plugin.description}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {plugin.version && (
              <span className="font-mono text-sm text-muted-foreground">
                v{plugin.version}
                {updatedTimeAgo && <> · Updated {updatedTimeAgo}</>}
              </span>
            )}
            {plugin.capabilities.length > 0 && (
              <CapabilityBadges capabilities={plugin.capabilities} />
            )}
          </div>
        </div>
      </div>

      {/* Author */}
      <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:col-span-3 sm:flex">
        <div className="size-5 rounded-full bg-muted" />
        {plugin.author}
      </div>

      {/* Status */}
      <div className="flex items-center sm:col-span-2">
        <PluginStatusBadge
          status={plugin.status}
          hasUpdate={plugin.hasUpdate}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sm:col-span-2">
        {/* Toggle Switch */}
        {plugin.isInstalled && (
          <Switch
            checked={plugin.isEnabled}
            onCheckedChange={(checked) => onToggle(plugin.id, checked)}
            aria-label={
              plugin.isEnabled ? t('actions.disable') : t('actions.enable')
            }
          />
        )}

        {/* Delete Button */}
        {plugin.isInstalled && (
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title={t('actions.uninstall')}
            onClick={() => onUninstall(plugin.id)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="More options"
              />
            }
          >
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(plugin)}>
                {t('actions.viewDetails')}
              </DropdownMenuItem>
            )}
            {plugin.pipSource && (
              <DropdownMenuItem
                render={
                  <a
                    href={`https://pypi.org/project/${plugin.pipSource.split('/').pop()?.replace('.git', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t('actions.viewOnPyPI')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
