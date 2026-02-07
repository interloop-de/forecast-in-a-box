/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { Bookmark, MoreVertical, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import type { FableMetadataStore } from '@/features/fable-builder/components/SaveConfigPopover'
import { BlockSummaryBadges } from '@/features/fable-builder/components/SaveConfigPopover'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function ConfigPresetsPopover() {
  const { t } = useTranslation('dashboard')
  const [metadataStore, setMetadataStore] = useLocalStorage<FableMetadataStore>(
    STORAGE_KEYS.fable.metadata,
    {},
  )

  const presets = Object.entries(metadataStore)
    .map(([fableId, meta]) => ({ fableId, ...meta }))
    .sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    )

  function handleDelete(fableId: string) {
    const { [fableId]: _, ...rest } = metadataStore
    setMetadataStore(rest)
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2.5',
              'border border-border',
              'transition-colors hover:bg-muted',
              'text-sm font-medium',
            )}
          />
        }
      >
        <Bookmark className="h-4 w-4" />
        {t('welcome.actions.myPresets')}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>{t('welcome.actions.myPresets')}</PopoverTitle>
        </PopoverHeader>

        {presets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center text-muted-foreground">
            <Bookmark className="h-8 w-8" />
            <p className="text-sm font-medium">No saved configurations yet</p>
            <p className="text-xs">
              Save a configuration from the Fable Builder to see it here.
            </p>
          </div>
        ) : (
          <div className="dark-scrollbar flex max-h-72 flex-col gap-3 overflow-y-auto">
            {presets.map(({ fableId, title, comments, summary, savedAt }) => (
              <div
                key={fableId}
                className="flex flex-col gap-1.5 rounded-md border border-border bg-muted/30 p-3 dark:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{title}</p>
                    {comments && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {comments}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      render={<Link to="/configure" search={{ fableId }} />}
                      nativeButton={false}
                    >
                      Load
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-xs" />}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(fableId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <BlockSummaryBadges
                  summary={summary}
                  className="flex flex-wrap gap-1"
                />

                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(savedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
