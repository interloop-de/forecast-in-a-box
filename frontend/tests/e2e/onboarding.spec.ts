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
 * First-run onboarding E2E: welcome dialog on first visit, checklist after
 * starting, skip persistence, recipe deep link with its Run Once pointer.
 * Both test environments have plugins loaded, so no install item appears.
 */

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** First visit: land on the dashboard as a fresh anonymous user. */
async function gotoDashboard(page: Page) {
  await page.goto('/')
  await page.waitForURL(/dashboard/, { timeout: 15000 })
  await page.waitForLoadState('networkidle')
}

test.describe('First-run onboarding', () => {
  test('welcome dialog appears on first visit and starts the guide', async ({
    page,
  }) => {
    await gotoDashboard(page)

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByText(/first AI forecast is about ten minutes away/i),
    ).toBeVisible({ timeout: 10000 })

    // Plugins are loaded in both test environments — no install step.
    await expect(dialog.getByText('Install the ECMWF plugin')).toHaveCount(0)
    await expect(
      dialog.getByText('Open your first forecast recipe'),
    ).toBeVisible()

    await dialog.getByRole('button', { name: "Let's go" }).click()

    // The dialog gives way to the checklist card; Getting Started yields.
    await expect(page.getByText('Getting set up')).toBeVisible()
    await expect(page.getByText('0 of 3')).toBeVisible()
    await expect(page.getByText('Start from Scratch')).toHaveCount(0)
  })

  test('skipping from the welcome dialog persists across reloads', async ({
    page,
  }) => {
    await gotoDashboard(page)

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: "Don't show this again" }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)

    // The regular dashboard is back and stays back after a reload.
    await expect(page.getByText('Start from Scratch')).toBeVisible()
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText('Start from Scratch')).toBeVisible()
  })

  test('checklist deep-links into the first-forecast recipe with a Run Once pointer', async ({
    page,
  }) => {
    await gotoDashboard(page)
    await page.getByRole('button', { name: "Let's go" }).click()

    await page.getByRole('button', { name: 'Open the recipe' }).click()
    await page.waitForURL(/configure\?preset=first-forecast/, {
      timeout: 15000,
    })

    // The recipe loads pre-configured and the pointer explains the button.
    await expect(page.getByText("Everything's configured")).toBeVisible({
      timeout: 15000,
    })
    await expect(
      page.getByRole('button', { name: /run once/i }).first(),
    ).toBeEnabled({ timeout: 15000 })

    // Progress follows along off the dashboard.
    await expect(page.getByText('Getting set up')).toBeVisible()
    await expect(page.getByText('1 of 3')).toBeVisible()
  })
})
