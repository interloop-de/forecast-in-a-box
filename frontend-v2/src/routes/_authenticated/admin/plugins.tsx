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
import type { PluginCompositeId, PluginInfo } from '@/api/types/plugins.types'
import type { CapabilityFilter, StatusFilter } from '@/features/plugins'
import { useBlockCatalogue } from '@/api/hooks/useFable'
import {
  useDisablePlugin,
  useEnablePlugin,
  useInstallPlugin,
  usePlugins,
  useRefreshPlugins,
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

  // Fetch catalogue to derive capabilities
  const { data: catalogue } = useBlockCatalogue()

  // Queries - pass catalogue to derive capabilities
  const { plugins, isLoading } = usePlugins(catalogue)

  // Mutations
  const installPlugin = useInstallPlugin()
  const uninstallPlugin = useUninstallPlugin()
  const enablePlugin = useEnablePlugin()
  const disablePlugin = useDisablePlugin()
  const updatePlugin = useUpdatePlugin()
  const refreshPlugins = useRefreshPlugins()

  // Separate plugins by status
  const {
    pluginsWithUpdates,
    installedPlugins,
    availablePlugins,
    showAvailableOnly,
  } = useMemo(() => {
    if (plugins.length === 0) {
      return {
        pluginsWithUpdates: [],
        installedPlugins: [],
        availablePlugins: [],
        showAvailableOnly: false,
      }
    }

    // Check if filtering for available only
    const filteringAvailable = statusFilter === 'available'

    // Get available plugins (not installed)
    let available = plugins.filter((p) => p.status === 'available')

    // Apply capability filter to available
    if (capabilityFilter !== 'all') {
      available = available.filter((p) =>
        p.capabilities.includes(capabilityFilter),
      )
    }

    // Apply search to available
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      available = available.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.displayId.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    }

    let filteredPlugins = plugins.filter((p) => p.isInstalled)

    // Apply status filter (for installed plugins only)
    if (statusFilter !== 'all' && statusFilter !== 'available') {
      if (statusFilter === 'hasUpdate') {
        filteredPlugins = filteredPlugins.filter((p) => p.hasUpdate)
      } else {
        filteredPlugins = filteredPlugins.filter(
          (p) => p.status === statusFilter,
        )
      }
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
          p.displayId.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    }

    // Separate updates
    const withUpdates = filteredPlugins.filter((p) => p.hasUpdate)
    const installed = filteredPlugins.filter((p) => !p.hasUpdate)

    // Sort: loaded first, then by name
    installed.sort((a, b) => {
      if (a.isEnabled !== b.isEnabled) {
        return a.isEnabled ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return {
      pluginsWithUpdates: filteringAvailable ? [] : withUpdates,
      installedPlugins: filteringAvailable ? [] : installed,
      availablePlugins: available,
      showAvailableOnly: filteringAvailable,
    }
  }, [plugins, searchQuery, statusFilter, capabilityFilter])

  // Handlers
  const handleToggle = (compositeId: PluginCompositeId, enabled: boolean) => {
    if (enabled) {
      enablePlugin.mutate(compositeId)
    } else {
      disablePlugin.mutate(compositeId)
    }
  }

  const handleInstall = (compositeId: PluginCompositeId) => {
    installPlugin.mutate(compositeId)
  }

  const handleUninstall = (compositeId: PluginCompositeId) => {
    uninstallPlugin.mutate(compositeId)
  }

  const handleUpdate = (compositeId: PluginCompositeId) => {
    updatePlugin.mutate(compositeId)
  }

  const handleRefresh = () => {
    refreshPlugins.mutate()
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
        onCheckUpdates={handleRefresh}
        isCheckingUpdates={refreshPlugins.isPending}
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
      {!showAvailableOnly && pluginsWithUpdates.length > 0 && (
        <UpdatesAvailableSection
          plugins={pluginsWithUpdates}
          onUpdate={handleUpdate}
        />
      )}

      {/* Installed Plugins Section */}
      {!showAvailableOnly && (
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

      {/* Available Plugins Section */}
      <UninstalledPluginsSection
        plugins={availablePlugins}
        onInstall={handleInstall}
        onViewDetails={handleViewDetails}
        variant={dashboardVariant}
        shadow={panelShadow}
      />
    </div>
  )
}
