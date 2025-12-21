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
 * StatusCard component
 * Displays the system status information in a card
 */

import { useTranslation } from 'react-i18next'
import { StatusBadge } from './StatusBadge'
import type { ServiceStatus } from '@/types/status.types'
import { useStatus } from '@/api/hooks/useStatus'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatusCard() {
  const { t } = useTranslation('status')
  const { data, isLoading, isError, error, dataUpdatedAt } = useStatus()

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              {/* Skeleton rows for each service */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
            {/* Skeleton for version */}
            <div className="mt-6 rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="w-full max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t('card.titleError')}
          </CardTitle>
          <CardDescription>{t('card.errorMessage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : t('card.unknownError')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  // Transform data into service status array
  const services: Array<ServiceStatus> = [
    { name: 'api', status: data.api, label: t('services.api') },
    {
      name: 'cascade',
      status: data.cascade,
      label: t('services.cascade'),
    },
    { name: 'ecmwf', status: data.ecmwf, label: t('services.ecmwf') },
    {
      name: 'scheduler',
      status: data.scheduler,
      label: t('services.scheduler'),
    },
  ]

  // Format last updated time
  const lastUpdated = new Date(dataUpdatedAt).toLocaleTimeString()

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t('card.title')}</CardTitle>
        <CardDescription>
          {t('card.description')}
          {dataUpdatedAt && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({t('card.lastUpdated')}: {lastUpdated})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Services Status */}
          <div className="grid gap-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{service.label}</span>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>

          {/* Version Information */}
          <div className="mt-6 rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t('version')}
              </span>
              <span className="font-mono text-sm">{data.version}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
