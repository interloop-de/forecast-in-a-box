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
 * PluginIcon Component
 *
 * Displays an icon for a plugin based on iconName or type
 */

import {
  CloudRain,
  Database,
  Droplets,
  FileOutput,
  FileText,
  Globe,
  ImageOff,
  Moon,
  Puzzle,
  Satellite,
  Snowflake,
  Thermometer,
  Tornado,
  Waves,
  Wind,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { PluginInfo } from '@/api/types/plugins.types'
import { cn } from '@/lib/utils'

interface PluginIconProps {
  plugin: PluginInfo
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Droplets,
  Wind,
  Thermometer,
  Satellite,
  FileOutput,
  Database,
  Waves,
  CloudRain,
  ImageOff,
  Tornado,
  Snowflake,
  Moon,
  FileText,
  Puzzle,
}

const capabilityColors: Record<string, string> = {
  source: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  transform:
    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  product:
    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  sink: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
}

const defaultColor =
  'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
}

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function PluginIcon({
  plugin,
  size = 'md',
  className,
}: PluginIconProps) {
  const IconComponent: ComponentType<{ className?: string }> = plugin.iconName
    ? (iconMap[plugin.iconName] ?? Puzzle)
    : Puzzle

  // Use primary capability (first in array) for color, fallback to default
  const colorClass =
    plugin.capabilities.length > 0
      ? capabilityColors[plugin.capabilities[0]]
      : defaultColor

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        sizeClasses[size],
        colorClass,
        className,
      )}
    >
      <IconComponent className={iconSizeClasses[size]} />
    </div>
  )
}
