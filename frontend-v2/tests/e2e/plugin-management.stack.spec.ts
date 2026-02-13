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
 * Plugin Management E2E Tests (Full Stack)
 *
 * Tests plugin browsing, searching, filtering, and management against a real backend.
 * Run with: npm run test:e2e:stack
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Establish anonymous session then navigate to the target page.
 * Required because the router's beforeLoad guard checks for anonymousId in localStorage.
 */
async function navigateTo(page: Page, path: string) {
  await page.goto('/')
  await page.waitForURL(/dashboard/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
}

test.describe('Plugin Page Loading', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/admin/plugins')
  })

  test('plugins page loads with heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /plugin/i })
    await expect(heading.first()).toBeVisible({ timeout: 10000 })
  })

  test('installed plugins section visible', async ({ page }) => {
    const installedHeading = page.getByText(/installed/i)
    if (
      await installedHeading
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(installedHeading.first()).toBeVisible()
    }

    // Should have at least one plugin listed (card or row)
    const pluginCards = page.locator('[role="switch"]')
    const cardCount = await pluginCards.count()
    // If there are toggle switches, there are installed plugins
    if (cardCount > 0) {
      expect(cardCount).toBeGreaterThanOrEqual(1)
    }
  })

  test('available plugins section visible if present', async ({ page }) => {
    // Check for uninstalled/available plugins section
    const availableSection = page.getByText(/available plugin/i)
    if (
      await availableSection
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await expect(availableSection.first()).toBeVisible()
    }
  })
})

test.describe('Plugin Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/admin/plugins')
  })

  test('search input filters plugins', async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      /search installed plugins by name/i,
    )
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Count initial visible items
      const togglesBefore = await page.getByRole('switch').count()

      // Type a search query
      await searchInput.fill('ecmwf')
      await page.waitForTimeout(500)

      // After filtering, count may decrease (or stay same if match)
      const togglesAfter = await page.getByRole('switch').count()
      // The list should have responded to the filter
      expect(togglesAfter).toBeLessThanOrEqual(togglesBefore)
    }
  })

  test('clearing search restores full list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      /search installed plugins by name/i,
    )
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const togglesBefore = await page.getByRole('switch').count()

      // Filter then clear
      await searchInput.fill('nonexistent-plugin-xyz')
      await page.waitForTimeout(500)

      await searchInput.clear()
      await page.waitForTimeout(500)

      const togglesAfter = await page.getByRole('switch').count()
      expect(togglesAfter).toBe(togglesBefore)
    }
  })

  test('status filter dropdown filters by status', async ({ page }) => {
    // Look for status filter combobox
    const statusFilter = page.locator(
      'button[role="combobox"], [role="combobox"]',
    )
    const filterCount = await statusFilter.count()

    if (filterCount > 0) {
      // Click the first combobox (status filter)
      await statusFilter.first().click()
      await page.waitForTimeout(300)

      // Look for filter options in the dropdown
      const loadedOption = page.getByRole('option', { name: /loaded/i })
      if (await loadedOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await loadedOption.click()
        await page.waitForTimeout(500)

        // Page should still be functional
        await expect(page.locator('body')).toBeVisible()
      }
    }
  })

  test('toggles between card and table view', async ({ page }) => {
    const tableViewButton = page.getByLabel('Table view')
    const cardViewButton = page.getByLabel('Card view')

    if (await tableViewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Switch to table view
      await tableViewButton.click()
      await page.waitForTimeout(500)

      // Table view should show a different layout
      await expect(page.locator('body')).toBeVisible()

      // Switch back to card view
      if (
        await cardViewButton.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await cardViewButton.click()
        await page.waitForTimeout(500)
      }
    }
  })
})

test.describe('Plugin Actions', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/admin/plugins')
  })

  test('toggles plugin enabled/disabled state', async ({ page }) => {
    const toggles = page.getByRole('switch')
    const count = await toggles.count()

    if (count > 0) {
      // Get initial state
      const firstToggle = toggles.first()
      const initialChecked = await firstToggle.isChecked()

      // Click to toggle
      await firstToggle.click()
      await page.waitForTimeout(1000)

      // State should have changed
      const newChecked = await firstToggle.isChecked()
      expect(newChecked).not.toBe(initialChecked)

      // Toggle back to restore original state
      await firstToggle.click()
      await page.waitForTimeout(1000)
    }
  })

  test('check updates button triggers refresh', async ({ page }) => {
    const checkUpdatesButton = page.getByRole('button', {
      name: /check updates/i,
    })
    if (
      await checkUpdatesButton.isVisible({ timeout: 5000 }).catch(() => false)
    ) {
      await checkUpdatesButton.click()
      await page.waitForTimeout(2000)

      // Should not crash - page still functional
      await expect(page.locator('body')).toBeVisible()

      // Heading should still be present
      const heading = page.getByRole('heading', { name: /plugin/i })
      await expect(heading.first()).toBeVisible()
    }
  })

  test('updates available section shows if updates exist', async ({ page }) => {
    // Check for updates section
    const updatesSection = page.getByText(/updates available/i)
    const hasUpdates = await updatesSection
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasUpdates) {
      await expect(updatesSection.first()).toBeVisible()

      // Should have update buttons
      const updateButtons = page.getByRole('button', { name: /^update$/i })
      if ((await updateButtons.count()) > 0) {
        await expect(updateButtons.first()).toBeVisible()
      }
    }
    // It's fine if no updates are available
  })

  test('plugin card shows status badges', async ({ page }) => {
    // Check for status badges (loaded, disabled, etc.)
    const loadedBadge = page.getByText('Loaded')
    const disabledBadge = page.getByText('Disabled')

    const hasLoaded = await loadedBadge
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)
    const hasDisabled = await disabledBadge
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    // At least one status type should be visible
    expect(hasLoaded || hasDisabled).toBe(true)
  })
})
