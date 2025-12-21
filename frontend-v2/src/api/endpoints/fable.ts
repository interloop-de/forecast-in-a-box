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
 * Fable API Endpoints
 *
 * API functions for fable (configuration builder) operations.
 */

import type {
  BlockFactoryCatalogue,
  FableBuilderV1,
  FableValidationExpansion,
} from '@/api/types/fable.types'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import {
  BlockFactoryCatalogueSchema,
  FableBuilderV1Schema,
  FableValidationExpansionSchema,
} from '@/api/types/fable.types'

/**
 * Get the block factory catalogue
 * @param language - Optional ISO 639-1 language code for localized content (e.g., 'de', 'fr')
 */
export async function getCatalogue(
  language?: string,
): Promise<BlockFactoryCatalogue> {
  return apiClient.get(API_ENDPOINTS.fable.catalogue, {
    params: language ? { language } : undefined,
    schema: BlockFactoryCatalogueSchema,
  })
}

/**
 * Expand a fable configuration for validation
 */
export async function expandFable(
  fable: FableBuilderV1,
): Promise<FableValidationExpansion> {
  const fableJson = JSON.stringify(fable)

  return apiClient.get(API_ENDPOINTS.fable.expand, {
    params: { fable: fableJson },
    schema: FableValidationExpansionSchema,
  })
}

/**
 * Compile a fable configuration
 */
export async function compileFable(fable: FableBuilderV1): Promise<unknown> {
  const fableJson = JSON.stringify(fable)
  return apiClient.get(API_ENDPOINTS.fable.compile, {
    params: { fable: fableJson },
  })
}

/**
 * Retrieve a saved fable by ID
 */
export async function retrieveFable(fableId: string): Promise<FableBuilderV1> {
  return apiClient.get(API_ENDPOINTS.fable.retrieve, {
    params: { fable_builder_id: fableId },
    schema: FableBuilderV1Schema,
  })
}

/**
 * Create or update a fable configuration
 */
export async function upsertFable(
  fable: FableBuilderV1,
  fableId?: string,
  tags: Array<string> = [],
): Promise<string> {
  const params: Record<string, string> = {}

  if (fableId) {
    params.fable_builder_id = fableId
  }

  if (tags.length > 0) {
    params.tags = tags.join(',')
  }

  return apiClient.post(API_ENDPOINTS.fable.upsert, fable, {
    params,
  })
}
