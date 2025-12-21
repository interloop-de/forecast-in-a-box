/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import type { ComponentProps } from 'react'
import type { HandleProps } from '@xyflow/react'

import { cn } from '@/lib/utils'
import { BaseHandle } from '@/components/base-handle'

const flexDirections = {
  top: 'flex-col',
  right: 'flex-row-reverse justify-end',
  bottom: 'flex-col-reverse justify-end',
  left: 'flex-row',
}

export function LabeledHandle({
  className,
  labelClassName,
  handleClassName,
  title,
  position,
  ...props
}: HandleProps &
  ComponentProps<'div'> & {
    title: string
    handleClassName?: string
    labelClassName?: string
  }) {
  const { ref, ...handleProps } = props

  return (
    <div
      title={title}
      className={cn(
        'relative flex items-center',
        flexDirections[position],
        className,
      )}
      ref={ref}
    >
      <BaseHandle
        position={position}
        className={handleClassName}
        {...handleProps}
      />
      <label className={cn('px-3 text-foreground', labelClassName)}>
        {title}
      </label>
    </div>
  )
}
