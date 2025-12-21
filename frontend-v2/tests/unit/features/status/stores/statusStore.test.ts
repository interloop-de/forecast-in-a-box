/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { act } from '@testing-library/react'
import type { StatusResponse } from '@/types/status.types'
import { useStatusStore } from '@/features/status/stores/statusStore'

const mockStatus: StatusResponse = {
  api: 'up',
  cascade: 'up',
  ecmwf: 'down',
  scheduler: 'up',
  version: '1.0.0',
}

describe('useStatusStore', () => {
  beforeEach(() => {
    act(() => useStatusStore.getState().reset())
  })

  describe('initial state', () => {
    it('has null status initially', () => {
      expect(useStatusStore.getState().status).toBeNull()
    })

    it('has null lastUpdated initially', () => {
      expect(useStatusStore.getState().lastUpdated).toBeNull()
    })
  })

  describe('setStatus', () => {
    it('sets status data', () => {
      act(() => useStatusStore.getState().setStatus(mockStatus))
      expect(useStatusStore.getState().status).toEqual(mockStatus)
    })

    it('sets lastUpdated to current date', () => {
      const before = new Date()
      act(() => useStatusStore.getState().setStatus(mockStatus))
      const after = new Date()

      const lastUpdated = useStatusStore.getState().lastUpdated
      expect(lastUpdated).toBeDefined()
      expect(lastUpdated!.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(lastUpdated!.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('overwrites previous status', () => {
      const newStatus: StatusResponse = {
        api: 'down',
        cascade: 'off',
        ecmwf: 'up',
        scheduler: 'up',
        version: '1.0.1',
      }

      act(() => useStatusStore.getState().setStatus(mockStatus))
      act(() => useStatusStore.getState().setStatus(newStatus))

      expect(useStatusStore.getState().status).toEqual(newStatus)
    })
  })

  describe('reset', () => {
    it('resets status to null', () => {
      act(() => useStatusStore.getState().setStatus(mockStatus))
      act(() => useStatusStore.getState().reset())

      expect(useStatusStore.getState().status).toBeNull()
    })

    it('resets lastUpdated to null', () => {
      act(() => useStatusStore.getState().setStatus(mockStatus))
      act(() => useStatusStore.getState().reset())

      expect(useStatusStore.getState().lastUpdated).toBeNull()
    })
  })
})
