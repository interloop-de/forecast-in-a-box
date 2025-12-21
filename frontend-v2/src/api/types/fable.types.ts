/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { Cloud, Cog, Download, Shuffle } from 'lucide-react'
import { z } from 'zod'
import type { LucideIcon } from 'lucide-react'

export type PluginId = string
export type BlockFactoryId = string
export type BlockInstanceId = string

export const PluginBlockFactoryIdSchema = z.object({
  plugin: z.string(),
  factory: z.string(),
})

export type PluginBlockFactoryId = z.infer<typeof PluginBlockFactoryIdSchema>

export const BlockConfigurationOptionSchema = z.object({
  title: z.string(),
  description: z.string(),
  value_type: z.string(),
})

export type BlockConfigurationOption = z.infer<
  typeof BlockConfigurationOptionSchema
>

export const BlockKindSchema = z.enum([
  'source',
  'transform',
  'product',
  'sink',
])

export type BlockKind = z.infer<typeof BlockKindSchema>

export const BlockFactorySchema = z.object({
  kind: BlockKindSchema,
  title: z.string(),
  description: z.string(),
  configuration_options: z.record(z.string(), BlockConfigurationOptionSchema),
  inputs: z.array(z.string()),
})

export type BlockFactory = z.infer<typeof BlockFactorySchema>

export const PluginCatalogueSchema = z.object({
  factories: z.record(z.string(), BlockFactorySchema),
})

export type PluginCatalogue = z.infer<typeof PluginCatalogueSchema>

export const BlockFactoryCatalogueSchema = z.record(
  z.string(),
  PluginCatalogueSchema,
)

export type BlockFactoryCatalogue = z.infer<typeof BlockFactoryCatalogueSchema>

export const BlockInstanceSchema = z.object({
  factory_id: PluginBlockFactoryIdSchema,
  configuration_values: z.record(z.string(), z.string()),
  input_ids: z.record(z.string(), z.string()),
})

export type BlockInstance = z.infer<typeof BlockInstanceSchema>

export const FableBuilderV1Schema = z.object({
  blocks: z.record(z.string(), BlockInstanceSchema),
})

export type FableBuilderV1 = z.infer<typeof FableBuilderV1Schema>

export const FableValidationExpansionSchema = z.object({
  global_errors: z.array(z.string()),
  block_errors: z.record(z.string(), z.array(z.string())),
  possible_sources: z.array(PluginBlockFactoryIdSchema),
  possible_expansions: z.record(
    z.string(),
    z.array(PluginBlockFactoryIdSchema),
  ),
})

export type FableValidationExpansion = z.infer<
  typeof FableValidationExpansionSchema
>

export const SavedFableSchema = z.object({
  id: z.string(),
  name: z.string(),
  fable: FableBuilderV1Schema,
  tags: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  user_id: z.string().optional(),
})

export type SavedFable = z.infer<typeof SavedFableSchema>

export const UpsertFableResponseSchema = z.object({
  id: z.string(),
})

export type UpsertFableResponse = z.infer<typeof UpsertFableResponseSchema>

export interface BlockWithFactory {
  instanceId: BlockInstanceId
  instance: BlockInstance
  factory: BlockFactory
}

export interface BlockValidationState {
  errors: Array<string>
  hasErrors: boolean
  possibleExpansions: Array<PluginBlockFactoryId>
}

export interface FableValidationState {
  isValid: boolean
  globalErrors: Array<string>
  blockStates: Record<BlockInstanceId, BlockValidationState>
  possibleSources: Array<PluginBlockFactoryId>
}

export interface BlockKindMetadata {
  kind: BlockKind
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  topBarColor: string
  handleColor: string
  icon: string
}

export const BLOCK_KIND_ORDER: Array<BlockKind> = [
  'source',
  'transform',
  'product',
  'sink',
]

export const BLOCK_KIND_METADATA: Record<BlockKind, BlockKindMetadata> = {
  source: {
    kind: 'source',
    label: 'Source',
    description: 'Data sources like forecasts and initial conditions',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    topBarColor: 'bg-blue-500',
    handleColor: 'border-blue-500',
    icon: 'Cloud',
  },
  transform: {
    kind: 'transform',
    label: 'Transform',
    description: 'Transform and process data',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
    topBarColor: 'bg-amber-500',
    handleColor: 'border-amber-500',
    icon: 'Shuffle',
  },
  product: {
    kind: 'product',
    label: 'Product',
    description: 'Compute derived products from data',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    topBarColor: 'bg-purple-500',
    handleColor: 'border-purple-500',
    icon: 'Cog',
  },
  sink: {
    kind: 'sink',
    label: 'Output',
    description: 'Store or visualize results',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    topBarColor: 'bg-emerald-500',
    handleColor: 'border-emerald-500',
    icon: 'Download',
  },
}

const BLOCK_KIND_ICONS: Record<BlockKind, LucideIcon> = {
  source: Cloud,
  transform: Shuffle,
  product: Cog,
  sink: Download,
}

export function getBlockKindIcon(kind: BlockKind): LucideIcon {
  return BLOCK_KIND_ICONS[kind]
}

export function createEmptyFable(): FableBuilderV1 {
  return {
    blocks: {},
  }
}

export function generateBlockInstanceId(): BlockInstanceId {
  return `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get a factory from the nested catalogue by PluginBlockFactoryId
 */
export function getFactory(
  catalogue: BlockFactoryCatalogue,
  factoryId: PluginBlockFactoryId,
): BlockFactory | undefined {
  const pluginCatalogue = catalogue[factoryId.plugin] as
    | PluginCatalogue
    | undefined
  return pluginCatalogue?.factories[factoryId.factory]
}

/**
 * Convert PluginBlockFactoryId to a string key for use in maps/comparisons
 */
export function factoryIdToKey(id: PluginBlockFactoryId): string {
  return `${id.plugin}:${id.factory}`
}

/**
 * Parse a string key back to PluginBlockFactoryId
 */
export function keyToFactoryId(key: string): PluginBlockFactoryId {
  const [plugin, factory] = key.split(':')
  return { plugin, factory }
}

/**
 * Flatten the nested catalogue into a flat map for iteration
 */
export function flattenCatalogue(catalogue: BlockFactoryCatalogue): Array<{
  pluginId: PluginId
  factoryId: BlockFactoryId
  factory: BlockFactory
}> {
  const result: Array<{
    pluginId: PluginId
    factoryId: BlockFactoryId
    factory: BlockFactory
  }> = []
  for (const [pluginId, pluginCatalogue] of Object.entries(catalogue)) {
    for (const [factoryId, factory] of Object.entries(
      pluginCatalogue.factories,
    )) {
      result.push({ pluginId, factoryId, factory })
    }
  }
  return result
}

/**
 * Group flattened catalogue entries by kind
 */
export function groupCatalogueByKind(catalogue: BlockFactoryCatalogue): Record<
  BlockKind,
  Array<{
    pluginId: PluginId
    factoryId: BlockFactoryId
    factory: BlockFactory
  }>
> {
  const result: Record<
    BlockKind,
    Array<{
      pluginId: PluginId
      factoryId: BlockFactoryId
      factory: BlockFactory
    }>
  > = {
    source: [],
    transform: [],
    product: [],
    sink: [],
  }
  for (const entry of flattenCatalogue(catalogue)) {
    result[entry.factory.kind].push(entry)
  }
  return result
}

export function createBlockInstance(
  factoryId: PluginBlockFactoryId,
  factory: BlockFactory,
): BlockInstance {
  const configurationValues: Record<string, string> = {}
  for (const key of Object.keys(factory.configuration_options)) {
    configurationValues[key] = ''
  }

  const inputIds: Record<string, string> = {}
  for (const inputName of factory.inputs) {
    inputIds[inputName] = ''
  }

  return {
    factory_id: factoryId,
    configuration_values: configurationValues,
    input_ids: inputIds,
  }
}

export function fableHasBlocks(fable: FableBuilderV1): boolean {
  return Object.keys(fable.blocks).length > 0
}

export function getBlocksByKind(
  fable: FableBuilderV1,
  catalogue: BlockFactoryCatalogue,
  kind: BlockKind,
): Array<{ instanceId: BlockInstanceId; instance: BlockInstance }> {
  return Object.entries(fable.blocks)
    .filter(([_, instance]) => {
      const factory = getFactory(catalogue, instance.factory_id)
      return factory?.kind === kind
    })
    .map(([instanceId, instance]) => ({ instanceId, instance }))
}

export function toValidationState(
  expansion: FableValidationExpansion,
): FableValidationState {
  const blockStates: Record<BlockInstanceId, BlockValidationState> = {}

  for (const [blockId, errors] of Object.entries(expansion.block_errors)) {
    blockStates[blockId] = {
      errors,
      hasErrors: errors.length > 0,
      possibleExpansions: expansion.possible_expansions[blockId] ?? [],
    }
  }

  for (const [blockId, expansions] of Object.entries(
    expansion.possible_expansions,
  )) {
    // Only add blocks that weren't already added from block_errors
    if (!(blockId in blockStates)) {
      blockStates[blockId] = {
        errors: [],
        hasErrors: false,
        possibleExpansions: expansions,
      }
    }
  }

  const hasAnyErrors =
    expansion.global_errors.length > 0 ||
    Object.values(blockStates).some((state) => state.hasErrors)

  return {
    isValid: !hasAnyErrors,
    globalErrors: expansion.global_errors,
    blockStates,
    possibleSources: expansion.possible_sources,
  }
}
