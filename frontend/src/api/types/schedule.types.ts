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
 * Schedule Types
 *
 * TypeScript types matching the backend schedule API (Pydantic models).
 */

import type { ExecutionSpecification, JobStatus } from '@/api/types/job.types'

/** PUT /schedule/create - request body */
export interface ScheduleSpecification {
  exec_spec: ExecutionSpecification
  dynamic_expr: Record<string, string>
  cron_expr: string
  max_acceptable_delay_hours: number
}

/** POST /schedule/{id} - request body (all fields optional) */
export interface ScheduleUpdate {
  exec_spec?: ExecutionSpecification
  dynamic_expr?: Record<string, string>
  enabled?: boolean
  cron_expr?: string
  max_acceptable_delay_hours?: number
}

/** GET /schedule/{id} - response */
export interface GetScheduleResponse {
  schedule_id: string
  cron_expr: string | null
  created_at: string
  updated_at: string
  exec_spec: string
  dynamic_expr: string
  enabled: boolean
  created_by: string | null
}

/** GET /schedule/ - paginated response */
export interface GetMultipleSchedulesResponse {
  schedules: Record<string, GetScheduleResponse>
  total: number
  page: number
  page_size: number
  total_pages: number
  error: string | null
}

/** PUT /schedule/create - response */
export interface CreateScheduleResponse {
  schedule_id: string
}

export type ScheduleRunTrigger = 'cron' | 'rerun' | 'cron_skipped' | 'event'

/** GET /schedule/{id}/runs - individual run */
export interface GetScheduleRunResponse {
  schedule_run_id: string
  schedule_id: string
  job_id: string | null
  attempt_cnt: number
  scheduled_at: string
  trigger: ScheduleRunTrigger
  status: JobStatus | null
}

/** GET /schedule/{id}/runs - paginated response */
export interface GetScheduleRunsResponse {
  runs: Record<string, GetScheduleRunResponse>
  total: number
  page: number
  page_size: number
  total_pages: number
  error: string | null
}
