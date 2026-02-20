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
 * Schedule Metadata Store
 *
 * Client-side persisted store for schedule metadata (name, description, tags, fable snapshot).
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { FableBuilderV1 } from '@/api/types/fable.types'
import { STORAGE_KEYS, STORE_VERSIONS } from '@/lib/storage-keys'

export interface ScheduleMetadata {
  name: string
  description: string
  tags: Array<string>
  fableId: string | null
  fableName: string
  fableSnapshot: FableBuilderV1
  cronExpr: string
  createdAt: string
}

interface ScheduleMetadataState {
  schedules: Record<string, ScheduleMetadata>
  addSchedule: (scheduleId: string, metadata: ScheduleMetadata) => void
  updateSchedule: (
    scheduleId: string,
    patch: Partial<Pick<ScheduleMetadata, 'name' | 'description' | 'tags'>>,
  ) => void
  removeSchedule: (scheduleId: string) => void
  getSchedule: (scheduleId: string) => ScheduleMetadata | undefined
}

export const useScheduleMetadataStore = create<ScheduleMetadataState>()(
  devtools(
    persist(
      (set, get) => ({
        schedules: {},

        addSchedule: (scheduleId, metadata) =>
          set(
            (state) => ({
              schedules: { ...state.schedules, [scheduleId]: metadata },
            }),
            false,
            'addSchedule',
          ),

        updateSchedule: (scheduleId, patch) =>
          set(
            (state) => ({
              schedules: {
                ...state.schedules,
                [scheduleId]: { ...state.schedules[scheduleId], ...patch },
              },
            }),
            false,
            'updateSchedule',
          ),

        removeSchedule: (scheduleId) =>
          set(
            (state) => {
              const { [scheduleId]: _, ...rest } = state.schedules
              return { schedules: rest }
            },
            false,
            'removeSchedule',
          ),

        getSchedule: (scheduleId) => get().schedules[scheduleId],
      }),
      {
        name: STORAGE_KEYS.stores.scheduleMetadata,
        version: STORE_VERSIONS.scheduleMetadata,
      },
    ),
    { name: 'ScheduleMetadataStore' },
  ),
)
