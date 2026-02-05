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
 * PluginDetailsSheet Component
 *
 * Sheet dialog showing plugin metadata and its block factories with actions
 * to start configurations.
 */

import { Layers } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  createSingleBlockFable,
  generatePluginPipeline,
} from '../utils/pipeline-generator'
import { BlockFactoryList } from './BlockFactoryList'
import { CapabilityBadges } from './CapabilityBadges'
import { PluginIcon } from './PluginIcon'
import { PluginStatusBadge } from './PluginStatusBadge'
import type {
  BlockFactoryCatalogue,
  PluginBlockFactoryId,
} from '@/api/types/fable.types'
import type { PluginInfo } from '@/api/types/plugins.types'
import { getFactory } from '@/api/types/fable.types'
import { toPluginDisplayId } from '@/api/types/plugins.types'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { encodeFableToURL } from '@/features/fable-builder/utils/url-state'

export interface PluginDetailsSheetProps {
  plugin: PluginInfo | null
  catalogue: BlockFactoryCatalogue | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PluginDetailsSheet({
  plugin,
  catalogue,
  open,
  onOpenChange,
}: PluginDetailsSheetProps) {
  const navigate = useNavigate()

  if (!plugin) {
    return null
  }

  const pluginDisplayId = toPluginDisplayId(plugin.id)
  const pluginCatalogue = catalogue?.[pluginDisplayId]
  const hasBlocks =
    pluginCatalogue && Object.keys(pluginCatalogue.factories).length > 0
  const blockCount = pluginCatalogue
    ? Object.keys(pluginCatalogue.factories).length
    : 0

  const handleStartConfiguration = (factoryId: PluginBlockFactoryId) => {
    if (!catalogue) return

    const factory = getFactory(catalogue, factoryId)
    if (!factory) return

    const fable = createSingleBlockFable(factoryId, factory)
    const encoded = encodeFableToURL(fable)

    onOpenChange(false)
    navigate({
      to: '/configure',
      search: { state: encoded },
    })
  }

  const handleUseAllBlocks = () => {
    if (!catalogue) return

    const { fable } = generatePluginPipeline({
      pluginId: pluginDisplayId,
      catalogue,
    })

    const encoded = encodeFableToURL(fable)

    onOpenChange(false)
    navigate({
      to: '/configure',
      search: { state: encoded },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto px-6 sm:max-w-lg"
      >
        <SheetHeader className="px-0 pb-0">
          <div className="flex items-start gap-3">
            <PluginIcon plugin={plugin} size="lg" />
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-xl">{plugin.name}</SheetTitle>
              <SheetDescription className="mt-1">
                {plugin.author}
                {plugin.version && ` · v${plugin.version}`}
              </SheetDescription>
              <div className="mt-2">
                <PluginStatusBadge
                  status={plugin.status}
                  hasUpdate={plugin.hasUpdate}
                />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Description */}
          {plugin.description && (
            <p className="text-sm text-muted-foreground">
              {plugin.description}
            </p>
          )}

          {/* Capabilities */}
          {plugin.capabilities.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Capabilities</h3>
              <CapabilityBadges capabilities={plugin.capabilities} />
            </div>
          )}

          {/* Use All Blocks Button */}
          {hasBlocks && blockCount > 1 && (
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={handleUseAllBlocks}
            >
              <Layers className="h-4 w-4" />
              Use All Blocks ({blockCount})
            </Button>
          )}

          <Separator />

          {/* Block Factories */}
          <div>
            <h3 className="mb-3 text-sm font-medium">
              Block Factories
              {blockCount > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({blockCount})
                </span>
              )}
            </h3>

            {pluginCatalogue ? (
              <BlockFactoryList
                pluginId={plugin.id}
                pluginCatalogue={pluginCatalogue}
                onStartConfiguration={handleStartConfiguration}
              />
            ) : plugin.isInstalled && plugin.isEnabled ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading block factories...
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {plugin.isInstalled
                  ? 'Enable this plugin to view block factories.'
                  : 'Install this plugin to view block factories.'}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
