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
 * Schedule API Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { FableBuilderV1 } from '@/api/types/fable.types'
import type {
  CreateScheduleResponse,
  GetMultipleSchedulesResponse,
  GetScheduleResponse,
  GetScheduleRunsResponse,
  ScheduleSpecification,
  ScheduleUpdate,
} from '@/api/types/schedule.types'
import type { EnvironmentSpecification } from '@/api/types/job.types'
import type { ScheduleMetadata } from '@/features/schedules/stores/useScheduleMetadataStore'
import { createDefaultEnvironment } from '@/api/types/job.types'
import {
  createSchedule,
  getSchedule,
  getScheduleNextRun,
  getScheduleRuns,
  getSchedules,
  rerunScheduleRun,
  updateSchedule,
} from '@/api/endpoints/schedule'
import { compileFable } from '@/api/endpoints/fable'
import { useScheduleMetadataStore } from '@/features/schedules/stores/useScheduleMetadataStore'

export const scheduleKeys = {
  all: ['schedules'] as const,
  list: (page: number, pageSize: number, enabled?: boolean) =>
    [...scheduleKeys.all, 'list', page, pageSize, enabled] as const,
  detail: (scheduleId: string) =>
    [...scheduleKeys.all, 'detail', scheduleId] as const,
  runs: (scheduleId: string, page: number, pageSize: number, status?: string) =>
    [...scheduleKeys.all, 'runs', scheduleId, page, pageSize, status] as const,
  nextRun: (scheduleId: string) =>
    [...scheduleKeys.all, 'nextRun', scheduleId] as const,
}

export function useSchedules(
  page: number = 1,
  pageSize: number = 10,
  enabled?: boolean,
) {
  return useQuery<GetMultipleSchedulesResponse>({
    queryKey: scheduleKeys.list(page, pageSize, enabled),
    queryFn: () => getSchedules(page, pageSize, enabled),
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  })
}

export function useSchedule(scheduleId: string | undefined) {
  return useQuery<GetScheduleResponse>({
    queryKey: scheduleKeys.detail(scheduleId ?? ''),
    queryFn: () => getSchedule(scheduleId!),
    enabled: !!scheduleId,
    refetchOnWindowFocus: false,
  })
}

export function useScheduleRuns(
  scheduleId: string | undefined,
  page: number = 1,
  pageSize: number = 10,
  status?: string,
) {
  return useQuery<GetScheduleRunsResponse>({
    queryKey: scheduleKeys.runs(scheduleId ?? '', page, pageSize, status),
    queryFn: () => getScheduleRuns(scheduleId!, page, pageSize, status),
    enabled: !!scheduleId,
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  })
}

export function useScheduleNextRun(scheduleId: string | undefined) {
  return useQuery<string>({
    queryKey: scheduleKeys.nextRun(scheduleId ?? ''),
    queryFn: () => getScheduleNextRun(scheduleId!),
    enabled: !!scheduleId,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, { scheduleId: string; update: ScheduleUpdate }>({
    mutationFn: ({ scheduleId, update }) => updateSchedule(scheduleId, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useRerunScheduleRun() {
  const queryClient = useQueryClient()

  return useMutation<unknown, Error, string>({
    mutationFn: rerunScheduleRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

interface CreateScheduleParams {
  fable: FableBuilderV1
  name: string
  description: string
  tags: Array<string>
  fableId: string | null
  fableName: string
  cronExpr: string
  maxAcceptableDelayHours: number
  dynamicExpr: Record<string, string>
  environment?: EnvironmentSpecification
  compiledSpec?: Record<string, unknown>
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()
  const addSchedule = useScheduleMetadataStore((s) => s.addSchedule)

  return useMutation<CreateScheduleResponse, Error, CreateScheduleParams>({
    mutationFn: async ({
      fable,
      environment,
      cronExpr,
      maxAcceptableDelayHours,
      dynamicExpr,
      compiledSpec,
    }) => {
      const cascadeJob = compiledSpec ?? await compileFable(fable)

      const spec: ScheduleSpecification = {
        exec_spec: {
          job: cascadeJob as {
            job_type: 'raw_cascade_job'
            job_instance: unknown
          },
          environment: environment ?? createDefaultEnvironment(),
          shared: false,
        },
        dynamic_expr: dynamicExpr,
        cron_expr: cronExpr,
        max_acceptable_delay_hours: maxAcceptableDelayHours,
      }

      return createSchedule(spec)
    },
    onSuccess: (response, params) => {
      const metadata: ScheduleMetadata = {
        name: params.name,
        description: params.description,
        tags: params.tags,
        fableId: params.fableId,
        fableName: params.fableName,
        fableSnapshot: params.fable,
        cronExpr: params.cronExpr,
        createdAt: new Date().toISOString(),
      }
      addSchedule(response.schedule_id, metadata)
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}
