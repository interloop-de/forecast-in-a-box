/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { useMemo, useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type {
  BlockFactoryCatalogue,
  BlockInstanceId,
} from '@/api/types/fable.types'
import {
  useBlockValidation,
  useFableBuilderStore,
} from '@/features/fable-builder/stores/fableBuilderStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BLOCK_KIND_METADATA,
  getBlockKindIcon,
  getFactory,
} from '@/api/types/fable.types'
import { cn } from '@/lib/utils'

interface BlockInstanceCardProps {
  instanceId: BlockInstanceId
  catalogue: BlockFactoryCatalogue
}

export function BlockInstanceCard({
  instanceId,
  catalogue,
}: BlockInstanceCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const fable = useFableBuilderStore((state) => state.fable)
  const updateBlockConfig = useFableBuilderStore(
    (state) => state.updateBlockConfig,
  )
  const removeBlock = useFableBuilderStore((state) => state.removeBlock)
  const connectBlocks = useFableBuilderStore((state) => state.connectBlocks)
  const disconnectBlock = useFableBuilderStore((state) => state.disconnectBlock)
  const blockValidation = useBlockValidation(instanceId)

  const instance = fable.blocks[instanceId]
  const factory = getFactory(catalogue, instance.factory_id)

  // Compute available sources that can be connected to this block's inputs
  const availableSources = useMemo(() => {
    return Object.entries(fable.blocks)
      .filter(([id, block]) => {
        if (id === instanceId) return false
        const blockFactory = getFactory(catalogue, block.factory_id)
        // Only source and product blocks can be inputs
        return (
          blockFactory?.kind === 'source' || blockFactory?.kind === 'product'
        )
      })
      .map(([id, block]) => ({
        id,
        block,
        factory: getFactory(catalogue, block.factory_id),
      }))
  }, [fable.blocks, instanceId, catalogue])

  if (!factory) {
    return null
  }

  const metadata = BLOCK_KIND_METADATA[factory.kind]
  const IconComponent = getBlockKindIcon(factory.kind)
  const hasErrors = blockValidation?.hasErrors ?? false
  const errors = blockValidation?.errors ?? []

  return (
    <Card className={cn('transition-all', hasErrors && 'border-destructive')}>
      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('rounded p-1.5', metadata.bgColor)}>
              <IconComponent className={cn('h-4 w-4', metadata.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{factory.title}</span>
                {hasErrors && (
                  <Badge variant="destructive" className="gap-1 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.length} {errors.length === 1 ? 'error' : 'errors'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {factory.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                  />
                }
              >
                <Trash2 className="h-4 w-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Block</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{factory.title}"? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => removeBlock(instanceId)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t px-4 py-3">
          {hasErrors && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive">
              <p className="mb-1 text-sm font-medium">Configuration Issues</p>
              <ul className="list-disc space-y-0.5 pl-4 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(factory.configuration_options).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(factory.configuration_options).map(
                ([key, option]) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={`${instanceId}-${key}`} className="text-sm">
                      {option.title}
                    </Label>
                    <Input
                      id={`${instanceId}-${key}`}
                      value={instance.configuration_values[key] ?? ''}
                      onChange={(e) =>
                        updateBlockConfig(instanceId, key, e.target.value)
                      }
                      placeholder={option.description}
                    />
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="py-2 text-center text-sm text-muted-foreground">
              No configuration options
            </p>
          )}

          {factory.inputs.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-sm font-medium">Input Connections</p>
              <div className="space-y-3">
                {factory.inputs.map((inputName) => {
                  const connectedTo = instance.input_ids[inputName]
                  const connectedBlock = connectedTo
                    ? fable.blocks[connectedTo]
                    : undefined
                  const connectedFactory = connectedBlock
                    ? getFactory(catalogue, connectedBlock.factory_id)
                    : null

                  // Compute display value for the Select
                  const displayValue = connectedFactory
                    ? connectedFactory.title
                    : 'Select source...'

                  return (
                    <div key={inputName} className="space-y-1.5">
                      <Label
                        htmlFor={`${instanceId}-input-${inputName}`}
                        className="text-sm"
                      >
                        {inputName}
                      </Label>
                      <Select
                        value={connectedTo || undefined}
                        onValueChange={(value) => {
                          if (value) {
                            connectBlocks(instanceId, inputName, value)
                          } else {
                            disconnectBlock(instanceId, inputName)
                          }
                        }}
                      >
                        <SelectTrigger
                          id={`${instanceId}-input-${inputName}`}
                          className="h-9 w-full"
                        >
                          <SelectValue>{displayValue}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableSources.length > 0 ? (
                            availableSources.map(
                              ({ id, factory: sourceFactory }) => (
                                <SelectItem key={id} value={id}>
                                  {sourceFactory?.title || id}
                                </SelectItem>
                              ),
                            )
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No compatible sources available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
