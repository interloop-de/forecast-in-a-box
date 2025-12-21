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
 * PluginCard Component
 *
 * Card view for a plugin
 */

import { differenceInDays, formatDistanceToNow } from 'date-fns'
import { Download, MoreVertical, Sparkles, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CapabilityBadges } from './CapabilityBadges'
import { PluginIcon } from './PluginIcon'
import { PluginStatusBadge } from './PluginStatusBadge'
import type { PluginInfo } from '@/api/types/plugins.types'
import type { DashboardVariant, PanelShadow } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface PluginCardProps {
  plugin: PluginInfo
  onToggle: (pluginId: string, enabled: boolean) => void
  onInstall: (pluginId: string) => void
  onUninstall: (pluginId: string) => void
  onUpdate: (pluginId: string) => void
  onViewDetails?: (plugin: PluginInfo) => void
  variant?: DashboardVariant
  shadow?: PanelShadow
}

export function PluginCard({
  plugin,
  onToggle,
  onInstall,
  onUninstall,
  onUpdate,
  onViewDetails,
  variant,
  shadow,
}: PluginCardProps) {
  const { t } = useTranslation('plugins')

  const installedTimeAgo = plugin.installedAt
    ? formatDistanceToNow(new Date(plugin.installedAt), { addSuffix: true })
    : null

  // Check if released within the past month (30 days)
  const isNewRelease =
    plugin.releaseDate &&
    differenceInDays(new Date(), new Date(plugin.releaseDate)) <= 30

  const releasedTimeAgo = plugin.releaseDate
    ? formatDistanceToNow(new Date(plugin.releaseDate), { addSuffix: true })
    : null

  // Use compact layout for uninstalled plugins
  const isCompact = !plugin.isInstalled

  return (
    <Card
      className={cn(
        'group relative flex flex-col transition-all duration-300 hover:border-primary/50',
        isCompact ? 'p-3 sm:p-4' : 'p-4 sm:p-5',
        !plugin.isEnabled &&
          plugin.isInstalled &&
          'opacity-80 hover:opacity-100',
      )}
      variant={variant}
      shadow={shadow}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-start justify-between gap-2',
          isCompact ? 'mb-2' : 'mb-3 sm:mb-4',
        )}
      >
        <div className="flex min-w-0 gap-2 sm:gap-3">
          <PluginIcon plugin={plugin} size={isCompact ? 'sm' : 'md'} />
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                'truncate font-semibold transition-colors group-hover:text-primary',
                isCompact ? 'text-sm' : 'text-base sm:text-lg',
              )}
            >
              {plugin.name}
            </h3>
            <p className="mt-0.5 truncate text-sm font-medium text-muted-foreground">
              {plugin.author}
            </p>
          </div>
        </div>
        <PluginStatusBadge status={plugin.status} className="shrink-0" />
      </div>

      {/* Description */}
      <p
        className={cn(
          'text-sm leading-relaxed text-muted-foreground',
          isCompact ? 'mb-2 line-clamp-1' : 'mb-3 line-clamp-2 sm:mb-5',
        )}
      >
        {plugin.description}
      </p>

      {/* Capabilities - only show for installed plugins */}
      {plugin.isInstalled && plugin.capabilities.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <CapabilityBadges capabilities={plugin.capabilities} />
        </div>
      )}

      {/* Version Info */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-2',
          isCompact ? 'mb-2' : 'mb-3 sm:mb-6',
        )}
      >
        <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 font-mono text-sm font-medium text-muted-foreground">
          v{plugin.version}
        </span>
        {installedTimeAgo && (
          <span className="text-sm text-muted-foreground">
            Installed {installedTimeAgo}
          </span>
        )}
        {!plugin.isInstalled && releasedTimeAgo && (
          <span className="text-sm text-muted-foreground">
            {t('uninstalledSection.releasedAgo', { time: releasedTimeAgo })}
          </span>
        )}
        {!plugin.isInstalled && isNewRelease && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />
            {t('uninstalledSection.new')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        {plugin.isInstalled ? (
          <>
            {plugin.hasUpdate ? (
              <Button className="flex-1" onClick={() => onUpdate(plugin.id)}>
                <Download className="mr-1 h-4 w-4" />
                {t('actions.update')}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onViewDetails?.(plugin)}
              >
                {t('actions.viewDetails')}
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Switch
                checked={plugin.isEnabled}
                onCheckedChange={(checked) => onToggle(plugin.id, checked)}
                aria-label={
                  plugin.isEnabled ? t('actions.disable') : t('actions.enable')
                }
              />
              {!plugin.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onUninstall(plugin.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewDetails?.(plugin)}
            >
              {t('actions.viewDetails')}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-primary text-primary hover:bg-primary/5"
              onClick={() => onInstall(plugin.id)}
              disabled={plugin.status === 'incompatible'}
              title={
                plugin.status === 'incompatible'
                  ? t('uninstalledSection.incompatibleMessage', {
                      version: plugin.fiabCompatibility,
                    })
                  : undefined
              }
            >
              <Download className="mr-1 h-4 w-4" />
              {t('actions.install')}
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <MoreVertical className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {plugin.homepage && (
              <DropdownMenuItem
                render={
                  <a
                    href={plugin.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                {t('actions.viewDocs')}
              </DropdownMenuItem>
            )}
            {plugin.repository && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={
                    <a
                      href={plugin.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  {t('actions.reportIssue')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
