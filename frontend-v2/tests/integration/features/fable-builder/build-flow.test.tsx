/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@tests/utils/render'
import { FableBuilderPage } from '@/features/fable-builder/components/FableBuilderPage'
import { useFableBuilderStore } from '@/features/fable-builder/stores/fableBuilderStore'

// Mock useMedia to simulate desktop layout (three-column with sidebars)
vi.mock('@/hooks/useMedia', () => ({
  useMedia: () => true,
}))

// Mock useURLStateSync to prevent navigation to /configure
// (Our test router only defines '/', so navigation would show "Not Found")
vi.mock('@/features/fable-builder/hooks/useURLStateSync', () => ({
  useURLStateSync: () => ({ loadedFromURL: false }),
}))

describe('Fable Builder Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFableBuilderStore.getState().reset()
    vi.clearAllMocks()
  })

  it('renders the builder and loads the block catalogue', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for catalogue to load - "Block Palette" appears in the sidebar header
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Verify the palette shows source blocks section
    await expect
      .element(screen.getByText('Source', { exact: true }))
      .toBeVisible()

    // With empty fable, the hint text should say "Click a source to get started"
    // Note: For empty fables, validationState stays null (validation only runs when blocks exist)
    // When validationState is null, all factories are available by default
    await expect
      .element(screen.getByText('Click a source to get started'))
      .toBeVisible()

    // Verify source block buttons are visible and enabled (available by default when no validationState)
    const sourceButton = screen.getByRole('button', {
      name: /Compute Model Forecast/i,
    })
    await expect.element(sourceButton).toBeVisible()
  })

  it('allows adding a source block from the palette', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for palette to load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Find the "Compute Model Forecast" button in the palette
    // For empty fables, validationState is null so all factories are available by default
    const addSourceButton = screen.getByRole('button', {
      name: /Compute Model Forecast/i,
    })
    await expect.element(addSourceButton).toBeVisible()

    // Click to add the block
    await addSourceButton.click()

    // Verify block was added to store
    const state = useFableBuilderStore.getState()
    expect(Object.keys(state.fable.blocks)).toHaveLength(1)

    // Block should be auto-selected after adding
    expect(state.selectedBlockId).toBeTruthy()

    // Fable should be marked as dirty
    expect(state.isDirty).toBe(true)

    // The "Unsaved" badge should appear in the header
    await expect.element(screen.getByText('Unsaved')).toBeVisible()

    // Block count should update to "1 block"
    await expect.element(screen.getByText('1 block')).toBeVisible()
  })

  it('shows configuration panel when a block is selected', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for palette to load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Add a source block
    const addSourceButton = screen.getByRole('button', {
      name: /Compute Model Forecast/i,
    })
    await addSourceButton.click()

    // The ConfigPanel should now show the block's configuration
    // Factory title appears as header in config panel (use heading role to be specific)
    await expect
      .element(
        screen.getByRole('heading', { name: 'Compute Model Forecast' }).first(),
      )
      .toBeVisible()

    // Configuration fields should be visible with their titles as labels
    // These come from mockCatalogue configuration_options
    await expect.element(screen.getByLabelText('Model Name')).toBeVisible()
    await expect.element(screen.getByLabelText('Lead Time')).toBeVisible()
    await expect
      .element(screen.getByLabelText('Ensemble Members'))
      .toBeVisible()
  })

  it('allows configuring a block via input fields', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for palette to load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Add a source block
    await screen
      .getByRole('button', { name: /Compute Model Forecast/i })
      .click()

    // Fill configuration fields
    const modelInput = screen.getByLabelText('Model Name')
    await modelInput.fill('aifs/test-model')

    const leadTimeInput = screen.getByLabelText('Lead Time')
    await leadTimeInput.fill('24')

    const membersInput = screen.getByLabelText('Ensemble Members')
    await membersInput.fill('10')

    // Verify store state was updated
    const state = useFableBuilderStore.getState()
    const blockId = Object.keys(state.fable.blocks)[0]
    const block = state.fable.blocks[blockId]

    expect(block.configuration_values.model).toBe('aifs/test-model')
    expect(block.configuration_values.lead_time).toBe('24')
    expect(block.configuration_values.ensemble_members).toBe('10')
  })

  it('allows saving a fable draft', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for palette to load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Add and configure a source block
    await screen
      .getByRole('button', { name: /Compute Model Forecast/i })
      .click()

    await screen.getByLabelText('Model Name').fill('aifs/test-model')
    await screen.getByLabelText('Lead Time').fill('24')
    await screen.getByLabelText('Ensemble Members').fill('10')

    // Verify fable is dirty
    expect(useFableBuilderStore.getState().isDirty).toBe(true)

    // Click "Save Config" button
    const saveButton = screen.getByRole('button', { name: /Save Config/i })
    await saveButton.click()

    // Wait for save to complete (MSW handler has 500ms delay)
    // isDirty should become false after successful save
    await expect
      .poll(() => useFableBuilderStore.getState().isDirty, { timeout: 2000 })
      .toBe(false)

    // "Unsaved" badge should no longer be visible
    await expect.element(screen.getByText('Unsaved')).not.toBeInTheDocument()

    // Store should have fableId set after save
    expect(useFableBuilderStore.getState().fableId).toBeTruthy()
  })

  it('allows navigating to review step', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for palette to load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Add a source block
    await screen
      .getByRole('button', { name: /Compute Model Forecast/i })
      .click()

    // Click "Review & Submit" button
    const reviewButton = screen.getByRole('button', {
      name: /Review & Submit/i,
    })
    await reviewButton.click()

    // Should transition to review step
    expect(useFableBuilderStore.getState().step).toBe('review')

    // Review mode shows "Back to Edit" button (there are two: one in header, one in ReviewStep)
    // Use .first() to avoid strict mode violation
    await expect
      .element(screen.getByRole('button', { name: /Back to Edit/i }).first())
      .toBeVisible()

    // And "Submit Job" button (may be disabled if validation fails)
    // Use .first() since there's a hidden span in the header and the button in ReviewStep
    await expect.element(screen.getByText('Submit Job').first()).toBeVisible()
  })

  it('allows returning from review step to edit step', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // Wait for palette to load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // Add a source block
    await screen
      .getByRole('button', { name: /Compute Model Forecast/i })
      .click()

    // Go to review
    await screen.getByRole('button', { name: /Review & Submit/i }).click()
    expect(useFableBuilderStore.getState().step).toBe('review')

    // Click "Back to Edit" (use .first() since there are two: header and ReviewStep)
    await screen
      .getByRole('button', { name: /Back to Edit/i })
      .first()
      .click()

    // Should be back in edit mode
    expect(useFableBuilderStore.getState().step).toBe('edit')

    // Palette should be visible again
    await expect.element(screen.getByText('Block Palette')).toBeVisible()
  })

  it('completes a full build flow: add block → configure → save → review', async () => {
    const screen = await renderWithRouter(<FableBuilderPage />)

    // 1. Wait for initial load
    await expect.element(screen.getByText('Block Palette')).toBeVisible()

    // 2. Add a source block
    await screen
      .getByRole('button', { name: /Compute Model Forecast/i })
      .click()

    // Verify block added
    expect(
      Object.keys(useFableBuilderStore.getState().fable.blocks),
    ).toHaveLength(1)

    // 3. Configure the block
    await screen.getByLabelText('Model Name').fill('aifs/single-mse-v0.2.1')
    await screen.getByLabelText('Lead Time').fill('48')
    await screen.getByLabelText('Ensemble Members').fill('4')

    // 4. Save draft
    await screen.getByRole('button', { name: /Save Config/i }).click()

    // Wait for save to complete
    await expect
      .poll(() => useFableBuilderStore.getState().isDirty, { timeout: 2000 })
      .toBe(false)

    // 5. Go to review
    await screen.getByRole('button', { name: /Review & Submit/i }).click()
    expect(useFableBuilderStore.getState().step).toBe('review')

    // Verify we're in review mode (use .first() since there are two "Back to Edit" buttons)
    await expect
      .element(screen.getByRole('button', { name: /Back to Edit/i }).first())
      .toBeVisible()

    // The Submit Job button should be present (use .first() for multiple matches)
    await expect.element(screen.getByText('Submit Job').first()).toBeVisible()
  })
})
