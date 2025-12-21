/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  FileText,
  LayoutGrid,
  Loader2,
  MoreVertical,
  Save,
  Share2,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { ValidationStatusBadge } from './shared/ValidationStatus'
import { GraphOptionsDropdown } from './graph-mode/GraphOptionsDropdown'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUpsertFable } from '@/api/hooks/useFable'
import { cn } from '@/lib/utils'

interface FableBuilderHeaderProps {
  fableId?: string
}

export function FableBuilderHeader({ fableId }: FableBuilderHeaderProps) {
  const [shareButtonText, setShareButtonText] = useState('Share')

  const mode = useFableBuilderStore((s) => s.mode)
  const step = useFableBuilderStore((s) => s.step)
  const fableName = useFableBuilderStore((s) => s.fableName)
  const fable = useFableBuilderStore((s) => s.fable)
  const isDirty = useFableBuilderStore((s) => s.isDirty)
  const validationState = useFableBuilderStore((s) => s.validationState)

  const setMode = useFableBuilderStore((s) => s.setMode)
  const setStep = useFableBuilderStore((s) => s.setStep)
  const markSaved = useFableBuilderStore((s) => s.markSaved)

  const upsertFable = useUpsertFable()

  const blockCount = Object.keys(fable.blocks).length
  const isValid = validationState?.isValid ?? false
  const hasBlocks = blockCount > 0

  async function handleSave(): Promise<void> {
    const newId = await upsertFable.mutateAsync({ fable, fableId })
    markSaved(newId)
  }

  function handleShare(): void {
    navigator.clipboard.writeText(window.location.href)
    setShareButtonText('Copied!')
    setTimeout(() => setShareButtonText('Share'), 2000)
  }

  function handleReview(): void {
    setStep('review')
  }

  function handleBackToEdit(): void {
    setStep('edit')
  }

  return (
    <header className="w-full overflow-hidden border-b border-border bg-card px-4 py-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        {/* Left: Back button + title */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="min-w-0 overflow-hidden">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden">
              <h1 className="min-w-0 truncate text-lg font-semibold">
                {fableName}
              </h1>
              {isDirty && (
                <Badge
                  variant="outline"
                  className="hidden shrink-0 text-sm sm:inline-flex"
                >
                  Unsaved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
              </span>
              {hasBlocks && <ValidationStatusBadge />}
            </div>
          </div>
        </div>

        {/* Center: Mode toggle (Graph/Form) */}
        <div className="flex justify-center">
          {step === 'edit' && (
            <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted p-1">
              {mode === 'graph' ? (
                <ButtonGroup>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 shadow-sm sm:gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="hidden sm:inline">Graph</span>
                  </Button>
                  <GraphOptionsDropdown />
                </ButtonGroup>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('graph')}
                  className="gap-1.5 sm:gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Graph</span>
                </Button>
              )}
              <Button
                variant={mode === 'form' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('form')}
                className={cn(
                  'gap-1.5 sm:gap-2',
                  mode === 'form' && 'shadow-sm',
                )}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Form</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex shrink-0 items-center justify-end gap-2">
          {step === 'edit' ? (
            <>
              {/* Desktop: Show all buttons */}
              <div className="hidden items-center gap-2 sm:flex">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={!hasBlocks}
                        className="gap-2"
                      />
                    }
                  >
                    <Share2 className="h-4 w-4" />
                    {shareButtonText}
                  </TooltipTrigger>
                  <TooltipContent>
                    Copy shareable link to clipboard
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasBlocks || upsertFable.isPending}
                  className="gap-2"
                >
                  {upsertFable.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Draft
                </Button>

                <Button
                  size="sm"
                  onClick={handleReview}
                  disabled={!hasBlocks}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Review & Submit
                </Button>
              </div>

              {/* Mobile: Dropdown menu for actions */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:hidden"
                    />
                  }
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShare} disabled={!hasBlocks}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {shareButtonText}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSave}
                    disabled={!hasBlocks || upsertFable.isPending}
                  >
                    {upsertFable.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleReview}
                    disabled={!hasBlocks}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Review & Submit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToEdit}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Edit</span>
              </Button>

              <Button size="sm" disabled={!isValid} className="gap-2">
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">Submit Job</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
