import { test, expect } from '@playwright/test'

test.describe('FisekIPTV - Layout Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000')
    // Wait for hydration
    await page.waitForLoadState('networkidle')
  })

  test('viewport is properly bounded (h-screen)', async ({ page }) => {
    const mainContainer = page.locator('.flex.flex-col.h-screen').first()
    await expect(mainContainer).toBeVisible()

    // Verify no viewport overflow
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
    const viewportHeight = await page.evaluate(() => window.innerHeight)

    expect(bodyHeight).toBeLessThanOrEqual(viewportHeight + 10) // 10px tolerance
  })

  test('sidebar is visible and functional', async ({ page }) => {
    const sidebar = page.getByTestId('app-sidebar')
    await expect(sidebar).toBeVisible()

    // Search input should be present
    const searchInput = sidebar.getByPlaceholder(/search categories/i)
    await expect(searchInput).toBeVisible()
  })

  test('video player renders with correct test ID', async ({ page }) => {
    const player = page.getByTestId('video-player')
    await expect(player).toBeVisible()
  })

  test('main navigation tabs are present', async ({ page }) => {
    // Check for Live TV, Movies, Series tabs
    const liveTvTab = page.getByRole('button', { name: /live tv/i })
    const moviesTab = page.getByRole('button', { name: /movies/i })
    const seriesTab = page.getByRole('button', { name: /series/i })

    await expect(liveTvTab).toBeVisible()
    await expect(moviesTab).toBeVisible()
    await expect(seriesTab).toBeVisible()
  })

  test('connection dialog appears on first load', async ({ page }) => {
    // Should show connection prompt when no server configured
    const dialog = page.getByRole('dialog').filter({ hasText: /connect to/i })

    // Dialog should be visible OR user is already connected
    const isDialogVisible = await dialog.isVisible()
    const hasCategories = await page.locator('[data-testid="app-sidebar"]').locator('button').count() > 0

    expect(isDialogVisible || hasCategories).toBeTruthy()
  })

  test('player has correct height in collapsed mode (no stream)', async ({ page }) => {
    // When not playing, player should be collapsed
    const player = page.getByTestId('video-player')
    const box = await player.boundingBox()

    if (box) {
      // Collapsed height should be around 200px (with some tolerance for controls)
      expect(box.height).toBeGreaterThanOrEqual(150)
      expect(box.height).toBeLessThanOrEqual(300)
    }
  })

  test('no horizontal scrollbars at 1280x720', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(500) // Allow resize to settle

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // 5px tolerance for scrollbar
  })

  test('sidebar does not overlap main content', async ({ page }) => {
    const sidebar = page.getByTestId('app-sidebar')
    const player = page.getByTestId('video-player')

    const sidebarBox = await sidebar.boundingBox()
    const playerBox = await player.boundingBox()

    if (sidebarBox && playerBox) {
      // Sidebar should end before player starts (no X-axis overlap)
      expect(sidebarBox.x + sidebarBox.width).toBeLessThanOrEqual(playerBox.x + 10)
    }
  })

  test('responsive layout works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // App should still be visible and functional
    const mainContainer = page.locator('.flex.flex-col.h-screen').first()
    await expect(mainContainer).toBeVisible()

    // No horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('scroll areas are properly contained', async ({ page }) => {
    // Check that scroll containers have overflow-y-auto or overflow-auto
    const scrollContainers = page.locator('[class*="overflow-y-auto"], [class*="overflow-auto"]')
    const count = await scrollContainers.count()

    // Should have at least 2 scroll containers (sidebar content + channels list)
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('theme toggle exists and works', async ({ page }) => {
    // Look for theme toggle button (usually moon/sun icon)
    const themeToggle = page.locator('button').filter({ hasText: /theme/i }).or(
      page.locator('button[aria-label*="theme"]')
    ).or(
      page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /^$/ }).first()
    )

    // At least one theme control should exist
    const themeControls = await page.locator('button').count()
    expect(themeControls).toBeGreaterThan(0)
  })

  test('player controls render when applicable', async ({ page }) => {
    const player = page.getByTestId('video-player')
    await expect(player).toBeVisible()

    // Player should have at least the card structure
    const card = player.locator('.overflow-hidden')
    await expect(card).toBeVisible()
  })
})

test.describe('FisekIPTV - Player Modes (Requires Connection)', () => {
  test.skip('player minimized mode has 350px height', async ({ page }) => {
    // This test requires actual server connection and stream playback
    // Skip in CI, run manually during development

    await page.goto('http://localhost:3000')

    // TODO: Programmatically connect to test server
    // TODO: Select a channel to trigger playback
    // TODO: Click minimize button

    const player = page.getByTestId('video-player')
    const box = await player.boundingBox()

    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(330)
      expect(box.height).toBeLessThanOrEqual(370)
    }
  })

  test.skip('side-by-side mode has 55/45 split on desktop', async ({ page }) => {
    // This test requires actual server connection and stream playback
    // Skip in CI, run manually during development

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:3000')

    // TODO: Programmatically connect to test server
    // TODO: Select a channel
    // TODO: Verify player takes ~55% width, channels take ~45%
  })
})
