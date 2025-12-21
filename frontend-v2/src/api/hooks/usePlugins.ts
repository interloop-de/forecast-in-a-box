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
 * Plugins Hooks
 *
 * TanStack Query hooks for plugin management.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AddPluginStoreRequest } from '@/api/types/plugins.types'
import {
  addPluginStore,
  checkForUpdates,
  disablePlugin,
  enablePlugin,
  getPlugins,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
} from '@/api/endpoints/plugins'

/** Query keys for plugins */
export const pluginKeys = {
  all: ['plugins'] as const,
  list: () => [...pluginKeys.all, 'list'] as const,
  stores: () => [...pluginKeys.all, 'stores'] as const,
}

/**
 * Hook to get all plugins and stores
 */
export function usePlugins() {
  return useQuery({
    queryKey: pluginKeys.list(),
    queryFn: getPlugins,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to install a plugin
 */
export function useInstallPlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: installPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}

/**
 * Hook to uninstall a plugin
 */
export function useUninstallPlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uninstallPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}

/**
 * Hook to enable a plugin
 */
export function useEnablePlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enablePlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}

/**
 * Hook to disable a plugin
 */
export function useDisablePlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disablePlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}

/**
 * Hook to update a plugin
 */
export function useUpdatePlugin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}

/**
 * Hook to check for plugin updates
 */
export function useCheckForUpdates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: checkForUpdates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}

/**
 * Hook to add a plugin store
 */
export function useAddPluginStore() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddPluginStoreRequest) => addPluginStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pluginKeys.list() })
    },
  })
}
