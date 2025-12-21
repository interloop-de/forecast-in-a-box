/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { createContext, useCallback, useContext, useState } from 'react'
import { NodeToolbar } from '@xyflow/react'
import type { ComponentProps } from 'react'
import type { NodeToolbarProps } from '@xyflow/react'

import { cn } from '@/lib/utils'

type TooltipContextType = {
  isVisible: boolean
  showTooltip: () => void
  hideTooltip: () => void
}

const TooltipContext = createContext<TooltipContextType | null>(null)

export function NodeTooltip({ children }: ComponentProps<'div'>) {
  const [isVisible, setIsVisible] = useState(false)

  const showTooltip = useCallback(() => setIsVisible(true), [])
  const hideTooltip = useCallback(() => setIsVisible(false), [])

  return (
    <TooltipContext.Provider value={{ isVisible, showTooltip, hideTooltip }}>
      <div>{children}</div>
    </TooltipContext.Provider>
  )
}

export function NodeTooltipTrigger({
  onMouseEnter,
  onMouseLeave,
  ...props
}: ComponentProps<'div'>) {
  const context = useContext(TooltipContext)
  if (!context) {
    throw new Error('NodeTooltipTrigger must be used within NodeTooltip')
  }

  return (
    <div
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        context.showTooltip()
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e)
        context.hideTooltip()
      }}
      {...props}
    />
  )
}

export function NodeTooltipContent({ className, ...props }: NodeToolbarProps) {
  const context = useContext(TooltipContext)
  if (!context) {
    throw new Error('NodeTooltipContent must be used within NodeTooltip')
  }

  return (
    <NodeToolbar
      isVisible={context.isVisible}
      className={cn(
        'rounded-sm bg-primary p-2 text-primary-foreground',
        className,
      )}
      tabIndex={1}
      {...props}
    />
  )
}
