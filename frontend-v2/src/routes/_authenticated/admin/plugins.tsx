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
 * Plugins Page Route
 *
 * Plugin Store page for browsing, installing, and managing FIAB plugins.
 */

import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { PluginInfo } from '@/api/types/plugins.types'
import type { CapabilityFilter, StatusFilter } from '@/features/plugins'
import {
  useCheckForUpdates,
  useDisablePlugin,
  useEnablePlugin,
  useInstallPlugin,
  usePlugins,
  useUninstallPlugin,
  useUpdatePlugin,
} from '@/api/hooks/usePlugins'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  PluginsFilters,
  PluginsList,
  PluginsPageHeader,
  UninstalledPluginsSection,
  UpdatesAvailableSection,
} from '@/features/plugins'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'

export const Route = createFileRoute('/_authenticated/admin/plugins')({
  component: PluginsPage,
})

function PluginsPage() {
  const { t } = useTranslation('plugins')
  const layoutMode = useUiStore((state) => state.layoutMode)
  const dashboardVariant = useUiStore((state) => state.dashboardVariant)
  const panelShadow = useUiStore((state) => state.panelShadow)
  const pluginsViewMode = useUiStore((state) => state.pluginsViewMode)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [capabilityFilter, setCapabilityFilter] =
    useState<CapabilityFilter>('all')

  // Queries
  const { data, isLoading } = usePlugins()

  // Mutations
  const installPlugin = useInstallPlugin()
  const uninstallPlugin = useUninstallPlugin()
  const enablePlugin = useEnablePlugin()
  const disablePlugin = useDisablePlugin()
  const updatePlugin = useUpdatePlugin()
  const checkForUpdates = useCheckForUpdates()

  // Separate plugins by status
  const {
    pluginsWithUpdates,
    installedPlugins,
    uninstalledPlugins,
    showUninstalledOnly,
  } = useMemo(() => {
    if (!data?.plugins) {
      return {
        pluginsWithUpdates: [],
        installedPlugins: [],
        uninstalledPlugins: [],
        showUninstalledOnly: false,
      }
    }

    // Check if filtering for uninstalled only
    const filteringUninstalled = statusFilter === 'uninstalled'

    // Get uninstalled plugins (not installed)
    let uninstalled = data.plugins.filter(
      (p) => p.status === 'uninstalled' || p.status === 'incompatible',
    )

    // Apply capability filter to uninstalled
    if (capabilityFilter !== 'all') {
      uninstalled = uninstalled.filter((p) =>
        p.capabilities.includes(capabilityFilter),
      )
    }

    // Apply search to uninstalled
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      uninstalled = uninstalled.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    }

    let filteredPlugins = data.plugins.filter((p) => p.isInstalled)

    // Apply status filter (for installed plugins only)
    if (statusFilter !== 'all' && statusFilter !== 'uninstalled') {
      filteredPlugins = filteredPlugins.filter((p) => p.status === statusFilter)
    }

    // Apply capability filter
    if (capabilityFilter !== 'all') {
      filteredPlugins = filteredPlugins.filter((p) =>
        p.capabilities.includes(capabilityFilter),
      )
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredPlugins = filteredPlugins.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    }

    // Separate updates
    const withUpdates = filteredPlugins.filter((p) => p.hasUpdate)
    const installed = filteredPlugins.filter((p) => !p.hasUpdate)

    // Sort: active first, then by name
    installed.sort((a, b) => {
      if (a.isEnabled !== b.isEnabled) {
        return a.isEnabled ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return {
      pluginsWithUpdates: filteringUninstalled ? [] : withUpdates,
      installedPlugins: filteringUninstalled ? [] : installed,
      uninstalledPlugins: uninstalled,
      showUninstalledOnly: filteringUninstalled,
    }
  }, [data?.plugins, searchQuery, statusFilter, capabilityFilter])

  // Handlers
  const handleToggle = (pluginId: string, enabled: boolean) => {
    if (enabled) {
      enablePlugin.mutate(pluginId)
    } else {
      disablePlugin.mutate(pluginId)
    }
  }

  const handleInstall = (pluginId: string) => {
    installPlugin.mutate(pluginId)
  }

  const handleUninstall = (pluginId: string) => {
    uninstallPlugin.mutate(pluginId)
  }

  const handleUpdate = (pluginId: string) => {
    updatePlugin.mutate(pluginId)
  }

  const handleCheckUpdates = () => {
    checkForUpdates.mutate()
  }

  const handleViewDetails = (plugin: PluginInfo) => {
    // TODO: Open details dialog
    console.log('View details:', plugin)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8',
        layoutMode === 'boxed' ? 'max-w-7xl' : 'max-w-none',
      )}
    >
      {/* Page Header */}
      <PluginsPageHeader
        onCheckUpdates={handleCheckUpdates}
        isCheckingUpdates={checkForUpdates.isPending}
      />

      {/* Search & Filters */}
      <PluginsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        capabilityFilter={capabilityFilter}
        onCapabilityFilterChange={setCapabilityFilter}
      />

      {/* Updates Available Section */}
      {!showUninstalledOnly && pluginsWithUpdates.length > 0 && (
        <UpdatesAvailableSection
          plugins={pluginsWithUpdates}
          onUpdate={handleUpdate}
        />
      )}

      {/* Installed Plugins Section */}
      {!showUninstalledOnly && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {t('installedSection.title')}
            </h3>
            <span className="font-mono text-sm text-muted-foreground">
              {t('installedSection.total', { count: installedPlugins.length })}
            </span>
          </div>

          <PluginsList
            plugins={installedPlugins}
            viewMode={pluginsViewMode}
            onToggle={handleToggle}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            onUpdate={handleUpdate}
            onViewDetails={handleViewDetails}
            variant={dashboardVariant}
            shadow={panelShadow}
          />
        </div>
      )}

      {/* Uninstalled Plugins Section */}
      <UninstalledPluginsSection
        plugins={uninstalledPlugins}
        onInstall={handleInstall}
        onViewDetails={handleViewDetails}
        variant={dashboardVariant}
        shadow={panelShadow}
      />
    </div>
  )
}
