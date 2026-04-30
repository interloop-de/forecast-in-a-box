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
 * QubeTree (Dimensional Matrix view)
 *
 * Renders the model's `output_qube` as a 2-D selection matrix:
 * one section per top-level branch (e.g. Pressure Levels, Surface),
 * with parameters on the Y-axis and levels on the X-axis. A pivot
 * toggle swaps the axes so pressure levels can be read from top
 * (high altitude / low pressure) to bottom (surface / high pressure),
 * matching a vertical sounding diagram.
 *
 * Surface branches have no level dimension and are rendered as a
 * compact parameter chip list.
 */

import { ChevronDown } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { QubeNode } from '@/api/types/artifacts.types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import { P } from '@/components/base/typography'
import { cn } from '@/lib/utils'

export interface QubeTreeProps {
  node: QubeNode
  className?: string
}

interface MatrixSection {
  /** Stable key for React lists. */
  id: string
  /** Original levtype value (e.g. "pl", "sfc"). */
  levtype: string
  /** Display title (e.g. "Pressure Levels (PL)"). */
  title: string
  /** Parameters in the order they appear in the qube. */
  params: Array<string>
  /**
   * Levels in altitude-ascending order (high pressure first → low pressure
   * last). null if the branch has no level dimension (e.g. surface).
   */
  levels: Array<number> | null
  /** Set of "param|level" strings for fast presence lookup. */
  presence: Set<string>
}

export function QubeTree({ node, className }: QubeTreeProps) {
  const { t } = useTranslation('artifacts')
  const [pivoted, setPivoted] = useState(false)
  const switchId = useId()

  const sections = useMemo(() => processQube(node), [node])

  if (sections.length === 0) {
    return (
      <P className="text-sm text-muted-foreground">
        {t('detail.noOutputStructure')}
      </P>
    )
  }

  const hasMatrixSection = sections.some((s) => s.levels !== null)

  return (
    <Card shadow="none" className={cn('space-y-2 p-5', className)}>
      <header className="flex items-center justify-between gap-4">
        <P className="font-mono text-xs font-semibold tracking-wider text-foreground uppercase">
          {t('detail.qubeMatrixTitle')}
        </P>
        {hasMatrixSection ? (
          <label
            htmlFor={switchId}
            className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
          >
            <span>{t('detail.qubePivotLabel')}</span>
            <Switch
              id={switchId}
              size="sm"
              checked={pivoted}
              onCheckedChange={setPivoted}
            />
          </label>
        ) : null}
      </header>

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionView key={section.id} section={section} pivoted={pivoted} />
        ))}
      </div>
    </Card>
  )
}

function SectionView({
  section,
  pivoted,
}: {
  section: MatrixSection
  pivoted: boolean
}) {
  const { t } = useTranslation('artifacts')

  const summary =
    section.levels !== null
      ? t('detail.qubeMatrixSize', {
          paramCount: section.params.length,
          levelCount: section.levels.length,
          fieldCount: section.presence.size,
        })
      : t('detail.qubeParamCount', {
          count: section.params.length,
        })

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/50">
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform [[data-panel-closed]_&]:-rotate-90 [[data-panel-open]_&]:rotate-0" />
        <span className="font-mono text-xs font-semibold tracking-wide text-foreground uppercase">
          {section.title}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {summary}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 pl-5">
          {section.levels !== null ? (
            <DimensionalMatrix section={section} pivoted={pivoted} />
          ) : (
            <SurfaceList section={section} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function DimensionalMatrix({
  section,
  pivoted,
}: {
  section: MatrixSection
  pivoted: boolean
}) {
  const { t } = useTranslation('artifacts')
  const [hover, setHover] = useState<{ row?: number; col?: number }>({})
  const levels = section.levels ?? []

  // Levels are always sorted descending pressure (1000 hPa → 50 hPa) so the
  // visual alignment of the data is preserved across the pivot — toggling
  // is a pure transpose, not a re-sort.
  const sortedLevels = [...levels].sort((a, b) => b - a)
  const rows = pivoted ? sortedLevels : section.params
  const cols = pivoted ? section.params : sortedLevels

  const formatRow = (value: number | string): string =>
    pivoted ? formatLevel(value as number) : String(value)
  const formatCol = (value: number | string): string =>
    pivoted ? String(value) : formatLevel(value as number)

  const isPresent = (row: number | string, col: number | string): boolean => {
    const param = pivoted ? col : row
    const level = pivoted ? row : col
    return section.presence.has(`${param}|${level}`)
  }

  // CSS Grid keeps the row-label column auto-sized while the data columns
  // share the remaining card width equally, so the matrix always fills its
  // container regardless of axis orientation. Padding lives inside each cell
  // (rather than via grid gap) so the hover crosshair band stays continuous
  // across the whole row / column.
  const gridTemplateColumns = `max-content repeat(${cols.length}, minmax(0, 1fr))`
  const headerCellClasses =
    'px-1 py-1 text-center font-mono text-xs font-medium transition-colors'
  const dataCellClasses =
    'flex items-center justify-center px-1 py-1 transition-colors'

  return (
    <div
      role="table"
      className="grid w-full items-stretch"
      style={{ gridTemplateColumns }}
      onMouseLeave={() => setHover({})}
    >
      <div role="row" className="contents">
        <div
          role="columnheader"
          className="px-1 py-1 pr-3 text-left font-mono text-[10px] font-medium tracking-wider text-muted-foreground/70 uppercase"
        >
          {pivoted ? t('detail.qubeAxisLevel') : t('detail.qubeAxisParam')}
        </div>
        {cols.map((col, colIdx) => (
          <div
            key={String(col)}
            role="columnheader"
            className={cn(
              headerCellClasses,
              hover.col === colIdx
                ? 'rounded-t bg-muted/60 text-foreground'
                : 'text-muted-foreground',
            )}
            onMouseEnter={() => setHover({ col: colIdx })}
          >
            {formatCol(col)}
          </div>
        ))}
      </div>

      {rows.map((row, rowIdx) => (
        <div key={String(row)} role="row" className="contents">
          <div
            role="rowheader"
            className={cn(
              'px-1 py-1 pr-3 text-right font-mono text-xs font-medium transition-colors',
              hover.row === rowIdx
                ? 'rounded-l bg-muted/60 text-foreground'
                : 'text-foreground/80',
            )}
            onMouseEnter={() => setHover({ row: rowIdx })}
          >
            {formatRow(row)}
          </div>
          {cols.map((col, colIdx) => {
            const present = isPresent(row, col)
            const tooltip = pivoted
              ? `${col} @ ${formatLevel(row as number)}`
              : `${row} @ ${formatLevel(col as number)}`
            const inRow = hover.row === rowIdx
            const inCol = hover.col === colIdx
            return (
              <div
                key={String(col)}
                role="cell"
                className={cn(
                  dataCellClasses,
                  (inRow || inCol) && 'bg-muted/40',
                  inRow && inCol && 'bg-muted/70',
                )}
                title={tooltip}
                onMouseEnter={() => setHover({ row: rowIdx, col: colIdx })}
              >
                <Cell present={present} />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Cell({ present }: { present: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block h-2 w-2 rounded-[2px]',
        present
          ? 'bg-primary shadow-[0_0_0_2px_var(--color-primary)]/10'
          : 'border border-muted-foreground/25 bg-transparent',
      )}
    />
  )
}

function SurfaceList({ section }: { section: MatrixSection }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {section.params.map((param) => (
        <Badge
          key={param}
          variant="secondary"
          className="font-mono"
          title={param}
        >
          {param}
        </Badge>
      ))}
    </div>
  )
}

/**
 * Walk the qube and produce one MatrixSection per top-level branch.
 * For each branch, accumulate the (param, level) tuples actually present
 * by visiting every leaf path — this correctly handles the case where
 * different params expose different level subsets.
 */
function processQube(root: QubeNode): Array<MatrixSection> {
  return root.children.map((branch, idx) => {
    const levtype = branch.values.values.map(String).join(',') || branch.key

    const params: Array<string> = []
    const seenParams = new Set<string>()
    const levelsSet = new Set<number>()
    const presence = new Set<string>()

    walkLeaves(branch, {}, (ctx) => {
      const param = 'param' in ctx ? String(ctx.param) : null
      if (param && !seenParams.has(param)) {
        seenParams.add(param)
        params.push(param)
      }
      if ('level' in ctx && param) {
        const level = Number(ctx.level)
        if (!Number.isNaN(level)) {
          levelsSet.add(level)
          presence.add(`${param}|${level}`)
        }
      }
    })

    const levels =
      levelsSet.size > 0 ? [...levelsSet].sort((a, b) => a - b) : null

    return {
      id: `${branch.key}-${branchSlug(branch)}-${idx}`,
      levtype,
      title: sectionTitle(branch),
      params,
      levels,
      presence,
    }
  })
}

/**
 * Visit every leaf below `node`, invoking `visitor` with the cumulative
 * dimension-key → value context. Each value of each dimension creates a
 * new branch in the walk.
 */
function walkLeaves(
  node: QubeNode,
  ctx: Record<string, string | number>,
  visitor: (ctx: Record<string, string | number>) => void,
): void {
  for (const value of node.values.values) {
    const nextCtx = { ...ctx, [node.key]: value }
    if (node.children.length === 0) {
      visitor(nextCtx)
    } else {
      for (const child of node.children) {
        walkLeaves(child, nextCtx, visitor)
      }
    }
  }
}

function sectionTitle(branch: QubeNode): string {
  const name = readMetadataName(branch.metadata)
  const code = branch.values.values.map(String).join(', ')
  if (name) return `${capitalize(name)} levels (${code.toUpperCase()})`
  return `${branch.key} = ${code}`
}

function branchSlug(branch: QubeNode): string {
  return branch.values.values.map(String).join('-') || 'unset'
}

function readMetadataName(metadata: Record<string, unknown>): string | null {
  const name = metadata.name
  if (!name || typeof name !== 'object') return null
  const values = (name as { values?: Array<unknown> }).values
  if (!Array.isArray(values) || values.length === 0) return null
  const first = values[0]
  return typeof first === 'string' ? first : null
}

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatLevel(level: number): string {
  if (!Number.isFinite(level)) return String(level)
  return `${level} hPa`
}
