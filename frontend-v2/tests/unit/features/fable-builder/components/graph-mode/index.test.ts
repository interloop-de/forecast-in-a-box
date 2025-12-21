/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { describe, expect, it } from 'vitest'
import {
  BlockNode,
  FableEdgeComponent,
  FableGraphCanvas,
} from '@/features/fable-builder/components/graph-mode'

describe('graph-mode index exports', () => {
  it('exports FableGraphCanvas', () => {
    expect(FableGraphCanvas).toBeDefined()
    expect(typeof FableGraphCanvas).toBe('function')
  })

  it('exports FableEdgeComponent', () => {
    expect(FableEdgeComponent).toBeDefined()
    // FableEdgeComponent is wrapped in memo(), which returns a React element type (object)
    expect(FableEdgeComponent).toHaveProperty('$$typeof')
  })

  it('exports BlockNode', () => {
    expect(BlockNode).toBeDefined()
    // BlockNode is wrapped in memo(), which returns a React element type (object)
    expect(BlockNode).toHaveProperty('$$typeof')
  })
})
