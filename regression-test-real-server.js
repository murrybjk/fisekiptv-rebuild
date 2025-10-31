/**
 * Real Server Regression Test
 * Tests with actual IPTV server connection
 */

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    if (type === 'pass') results.passed.push(message);
    if (type === 'fail') results.failed.push(message);
    if (type === 'warn') results.warnings.push(message);
  }

  try {
    // =============================================================================
    // TEST 1: Page Load
    // =============================================================================
    log('Test 1: Loading page...', 'info');

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    log('✓ Page loaded successfully', 'pass');

    // =============================================================================
    // TEST 2: Connection Dialog
    // =============================================================================
    log('Test 2: Testing connection dialog...', 'info');

    const dialog = await page.locator('[role="dialog"]').first();
    if (await dialog.isVisible()) {
      log('✓ Connection dialog is visible', 'pass');
    } else {
      log('✗ Connection dialog not visible', 'fail');
    }

    // =============================================================================
    // TEST 3: Fill Connection Form with REAL credentials
    // =============================================================================
    log('Test 3: Filling connection form...', 'info');

    await page.fill('input[placeholder="http://example.com"]', 'http://baskup.xp1.tv');
    await page.fill('input[placeholder="00:1A:79:XX:XX:XX"]', '00:1A:79:44:96:F6');
    log('✓ Connection form filled with real server credentials', 'pass');

    // =============================================================================
    // TEST 4: Connect to Server
    // =============================================================================
    log('Test 4: Connecting to server...', 'info');

    await page.click('button:has-text("Connect to Server")', { force: true });

    // Wait for connection to complete
    await page.waitForTimeout(3000);
    log('✓ Connect button clicked', 'pass');

    // Check if dialog closed (connection succeeded)
    const dialogStillVisible = await dialog.isVisible();
    if (!dialogStillVisible) {
      log('✓ Dialog closed (connection likely successful)', 'pass');
    } else {
      log('⚠ Dialog still visible (check for errors)', 'warn');
    }

    // =============================================================================
    // TEST 5: Verify Channels Loaded
    // =============================================================================
    log('Test 5: Verifying channels loaded...', 'info');

    // Wait for channels to load
    await page.waitForTimeout(2000);

    // Check for success toast
    const successToast = page.locator('text=Successfully connected');
    if (await successToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      log('✓ Success toast displayed', 'pass');
    }

    // Check for channels loaded toast
    const channelsToast = page.locator('text=Loaded');
    if (await channelsToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      const toastText = await channelsToast.textContent();
      log(`✓ Channels loaded: ${toastText}`, 'pass');
    }

    // =============================================================================
    // TEST 6: Verify Channels Display (CRITICAL TEST)
    // =============================================================================
    log('Test 6: Verifying channels are VISIBLE...', 'info');

    // Wait a bit for rendering
    await page.waitForTimeout(2000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-screenshots/after-connection.png', fullPage: true });
    log('✓ Screenshot saved: test-screenshots/after-connection.png', 'info');

    // Method 1: Check for channel cards
    const channelCards = await page.locator('[data-testid="channel-card"]').count();
    if (channelCards > 0) {
      log(`✓ Found ${channelCards} channel cards rendered`, 'pass');
    } else {
      // Try alternative selectors
      const cardElements = await page.locator('.grid > *').count();
      if (cardElements > 0) {
        log(`✓ Found ${cardElements} grid items (channels)`, 'pass');
      } else {
        log('✗ No channel cards found in DOM', 'fail');
      }
    }

    // Method 2: Check if channels grid is visible
    const channelsGrid = page.locator('.overflow-y-auto').first();
    const isGridVisible = await channelsGrid.isVisible();
    if (isGridVisible) {
      log('✓ Channels grid container is visible', 'pass');

      const gridBox = await channelsGrid.boundingBox();
      if (gridBox) {
        log(`✓ Channels grid dimensions: ${gridBox.width}x${gridBox.height}px`, 'pass');

        if (gridBox.height < 200) {
          log(`⚠ Grid height (${gridBox.height}px) seems too small`, 'warn');
        }
      }
    } else {
      log('✗ Channels grid container not visible', 'fail');
    }

    // Method 3: Check for "No channels" message
    const noChannelsMsg = page.locator('text=No channels found');
    if (await noChannelsMsg.isVisible({ timeout: 1000 }).catch(() => false)) {
      log('✗ "No channels found" message displayed', 'fail');
    } else {
      log('✓ No "No channels found" message (good sign)', 'pass');
    }

    // =============================================================================
    // TEST 7: Check Sidebar Categories
    // =============================================================================
    log('Test 7: Checking sidebar categories...', 'info');

    const sidebarItems = await page.locator('[data-sidebar="menu-button"]').count();
    if (sidebarItems > 0) {
      log(`✓ Found ${sidebarItems} sidebar category items`, 'pass');
    } else {
      log('✗ No sidebar categories found', 'fail');
    }

    // =============================================================================
    // TEST 8: Check Search and View Toggle
    // =============================================================================
    log('Test 8: Checking search and view controls...', 'info');

    const searchBar = page.locator('input[placeholder*="Search"]').first();
    if (await searchBar.isVisible()) {
      log('✓ Search bar is visible', 'pass');
    } else {
      log('✗ Search bar not visible', 'fail');
    }

    const viewToggle = page.locator('[role="radiogroup"]').first();
    if (await viewToggle.isVisible()) {
      log('✓ View toggle is visible', 'pass');
    } else {
      log('✗ View toggle not visible', 'fail');
    }

    // =============================================================================
    // TEST 9: Check Player Section
    // =============================================================================
    log('Test 9: Checking player section...', 'info');

    const playerSection = page.locator('.transition-all').first();
    const playerBox = await playerSection.boundingBox();

    if (playerBox) {
      log(`✓ Player section dimensions: ${playerBox.width}x${playerBox.height}px`, 'pass');

      if (playerBox.height > 200) {
        log(`⚠ Player height (${playerBox.height}px) seems large, may block channels`, 'warn');
      } else {
        log(`✓ Player height (${playerBox.height}px) is reasonable`, 'pass');
      }
    } else {
      log('✗ Player section not found', 'fail');
    }

    // =============================================================================
    // TEST 10: Overall Layout Check
    // =============================================================================
    log('Test 10: Overall layout validation...', 'info');

    // Get viewport height
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    log(`📏 Viewport height: ${viewportHeight}px`, 'info');

    // Calculate space usage
    const headerHeight = 64; // Approximate
    const playerHeight = playerBox ? playerBox.height : 0;
    const searchBarHeight = 60; // Approximate
    const usedSpace = headerHeight + playerHeight + searchBarHeight;
    const remainingSpace = viewportHeight - usedSpace;

    log(`📊 Space calculation:`, 'info');
    log(`   - Header: ~${headerHeight}px`, 'info');
    log(`   - Player: ${playerHeight}px`, 'info');
    log(`   - Search bar: ~${searchBarHeight}px`, 'info');
    log(`   - Remaining for channels: ${remainingSpace}px`, 'info');

    if (remainingSpace < 300) {
      log(`⚠ Only ${remainingSpace}px remaining for channels - may not be enough`, 'warn');
    } else {
      log(`✓ ${remainingSpace}px available for channels - should be sufficient`, 'pass');
    }

    // =============================================================================
    // FINAL REPORT
    // =============================================================================
    log('\n' + '='.repeat(80), 'info');
    log('REGRESSION TEST RESULTS (REAL SERVER)', 'info');
    log('='.repeat(80), 'info');
    log(`Total Passed: ${results.passed.length}`, 'info');
    log(`Total Failed: ${results.failed.length}`, 'info');
    log(`Total Warnings: ${results.warnings.length}`, 'info');
    log('='.repeat(80) + '\n', 'info');

    if (results.failed.length > 0) {
      log('Failed Tests:', 'info');
      results.failed.forEach(msg => log(`  - ${msg}`, 'fail'));
    }

    if (results.warnings.length > 0) {
      log('\nWarnings:', 'info');
      results.warnings.forEach(msg => log(`  - ${msg}`, 'warn'));
    }

    log('\nPassed Tests:', 'info');
    results.passed.forEach(msg => log(`  - ${msg}`, 'pass'));

    // Wait before closing
    log('\n⏳ Keeping browser open for 10 seconds for manual inspection...', 'info');
    await page.waitForTimeout(10000);

  } catch (error) {
    log(`Fatal error: ${error.message}`, 'fail');
    console.error(error);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();

    // Exit with appropriate code
    process.exit(results.failed.length > 0 ? 1 : 0);
  }
})();
