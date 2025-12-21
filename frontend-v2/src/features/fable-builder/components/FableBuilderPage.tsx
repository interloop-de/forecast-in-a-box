/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import React, { useEffect, useRef } from 'react'
import { FableBuilderHeader } from './FableBuilderHeader'
import {
  BlockPalette,
  ConfigPanel,
  MobileLayout,
  ThreeColumnLayout,
} from './layout'
import { FableGraphCanvas } from './graph-mode'
import { FableFormCanvas } from './form-mode'
import { ReviewStep as ReviewStepComponent } from './review'
import type { PresetId } from '@/features/fable-builder/presets'
import type { BlockFactoryCatalogue } from '@/api/types/fable.types'
import { useURLStateSync } from '@/features/fable-builder/hooks/useURLStateSync'
import { getPreset } from '@/features/fable-builder/presets'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'
import { useMedia } from '@/hooks/useMedia'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { toValidationState } from '@/api/types/fable.types'
import {
  useBlockCatalogue,
  useFable,
  useFableValidation,
} from '@/api/hooks/useFable'

interface FableBuilderPageProps {
  fableId?: string
  preset?: PresetId
  encodedState?: string
}

export function FableBuilderPage({
  fableId,
  preset,
  encodedState,
}: FableBuilderPageProps) {
  const fable = useFableBuilderStore((state) => state.fable)
  const setFable = useFableBuilderStore((state) => state.setFable)
  const newFable = useFableBuilderStore((state) => state.newFable)
  const setFableName = useFableBuilderStore((state) => state.setFableName)
  const mode = useFableBuilderStore((state) => state.mode)
  const step = useFableBuilderStore((state) => state.step)
  const setValidationState = useFableBuilderStore(
    (state) => state.setValidationState,
  )
  const setIsValidating = useFableBuilderStore((state) => state.setIsValidating)

  const initializedRef = useRef(false)

  useURLStateSync({
    encodedState: fableId ? undefined : encodedState,
    enabled: !fableId,
  })

  const isDesktop = useMedia('(min-width: 768px)')

  const { data: catalogue, isLoading: catalogueLoading } = useBlockCatalogue()
  const {
    data: existingFable,
    isLoading: fableLoading,
    error: fableError,
  } = useFable(fableId ?? null)

  const {
    data: validationResult,
    isLoading: isValidating,
    isFetching: isRevalidating,
  } = useFableValidation(fable)

  // Initialize fable state - only runs once per mount
  useEffect(() => {
    if (initializedRef.current) return

    if (fableId && existingFable) {
      setFable(existingFable, fableId)
      initializedRef.current = true
    } else if (!fableId && !encodedState) {
      if (preset) {
        const presetConfig = getPreset(preset)
        if (presetConfig) {
          setFable(presetConfig.fable, null)
          setFableName(presetConfig.name)
        } else {
          newFable()
        }
      } else {
        newFable()
      }
      initializedRef.current = true
    } else if (!fableId && encodedState) {
      // URL state sync will handle this case
      initializedRef.current = true
    }
  }, [fableId, existingFable, preset, encodedState])

  useEffect(() => {
    setIsValidating(isValidating || isRevalidating)
  }, [isValidating, isRevalidating, setIsValidating])

  useEffect(() => {
    if (validationResult) {
      const state = toValidationState(validationResult)
      setValidationState(state)
    }
  }, [validationResult, setValidationState])

  if (catalogueLoading || (fableId && fableLoading)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (fableId && fableError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          Failed to load configuration: {fableError.message}
        </p>
      </div>
    )
  }

  if (!catalogue) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load block catalogue</p>
      </div>
    )
  }

  return (
    <div
      className="flex min-w-0 flex-col"
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <FableBuilderHeader fableId={fableId} />

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {step === 'edit' ? (
          <EditStep catalogue={catalogue} isDesktop={isDesktop} mode={mode} />
        ) : (
          <ReviewStepComponent catalogue={catalogue} />
        )}
      </div>
    </div>
  )
}

interface EditStepProps {
  catalogue: BlockFactoryCatalogue
  isDesktop: boolean
  mode: 'graph' | 'form'
}

function EditStep({
  catalogue,
  isDesktop,
  mode,
}: EditStepProps): React.ReactNode {
  // Form mode: Render full-width without sidebars
  // Form mode has its own built-in UI for adding, configuring, and deleting blocks
  if (mode === 'form') {
    return <FableFormCanvas catalogue={catalogue} />
  }

  // Graph mode: Use three-column layout with sidebars
  const canvas = <FableGraphCanvas catalogue={catalogue} />

  if (!isDesktop) {
    return <MobileLayout catalogue={catalogue} canvas={canvas} />
  }

  return (
    <ThreeColumnLayout
      leftSidebar={<BlockPalette catalogue={catalogue} />}
      canvas={canvas}
      rightSidebar={<ConfigPanel catalogue={catalogue} />}
    />
  )
}
