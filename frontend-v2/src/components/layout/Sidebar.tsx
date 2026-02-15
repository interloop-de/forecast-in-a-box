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
 * Sidebar Component
 *
 * Navigation sidebar for authenticated pages
 */

import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const linkClassName =
  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted'

/**
 * Sidebar navigation component
 */
export function Sidebar({ className }: SidebarProps) {
  return (
    <aside className={cn('w-64 border-r bg-background p-6', className)}>
      <nav className="space-y-2">
        <Link
          to="/"
          className={linkClassName}
          activeProps={{ className: 'bg-muted' }}
        >
          Dashboard
        </Link>
        <Link
          to="/executions"
          className={linkClassName}
          activeProps={{ className: 'bg-muted' }}
          activeOptions={{ includeSearch: false }}
        >
          Executions
        </Link>
        <Link
          to="/about"
          className={linkClassName}
          activeProps={{ className: 'bg-muted' }}
        >
          About
        </Link>
      </nav>
    </aside>
  )
}
