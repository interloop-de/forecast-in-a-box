/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { useMemo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useStore,
} from '@xyflow/react'
import type { Edge, EdgeProps, Node, Position } from '@xyflow/react'

type PathType = 'bezier' | 'smoothstep' | 'step' | 'straight'

export type DataEdge<T extends Node = Node> = Edge<{
  key?: keyof T['data']
  path?: PathType
}>

export function DataEdge({
  data = { path: 'bezier' },
  id,
  markerEnd,
  source,
  sourcePosition,
  sourceX,
  sourceY,
  style,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<DataEdge>) {
  const nodeData = useStore((state) => state.nodeLookup.get(source)?.data)
  const [edgePath, labelX, labelY] = getPath({
    type: data.path ?? 'bezier',
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const label = useMemo(() => {
    if (data.key && nodeData) {
      const value = nodeData[data.key]

      switch (typeof value) {
        case 'string':
        case 'number':
          return value

        case 'object':
          return JSON.stringify(value)

        default:
          return ''
      }
    }
  }, [data, nodeData])

  const transform = `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {data.key && (
        <EdgeLabelRenderer>
          <div
            className="absolute rounded border bg-background px-1 text-foreground"
            style={{ transform }}
          >
            <pre className="text-sm">{label}</pre>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

interface PathParams {
  type: PathType
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
}

function getPath(params: PathParams): [string, number, number, number, number] {
  const {
    type,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = params
  const baseParams = {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  }

  switch (type) {
    case 'bezier':
      return getBezierPath(baseParams)
    case 'smoothstep':
      return getSmoothStepPath(baseParams)
    case 'step':
      return getSmoothStepPath({ ...baseParams, borderRadius: 0 })
    case 'straight':
      return getStraightPath({ sourceX, sourceY, targetX, targetY })
  }
}
