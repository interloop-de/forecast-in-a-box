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
 * History Page Route
 */

import { createFileRoute } from '@tanstack/react-router'
import { EmptyState, PageHeader } from '@/components/common'

function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecast History"
        description="View past forecast jobs and results"
      />

      <EmptyState
        title="No forecast history"
        description="You haven't run any forecasts yet. Start by creating a new forecast configuration."
        action={{
          label: 'Create Forecast',
          onClick: () => {
            // TODO: Navigate to create forecast page
          },
        }}
      />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/history')({
  component: HistoryPage,
})
