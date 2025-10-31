const { chromium } = require('@playwright/test');

async function testFisekIPTV() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = {
    screenshots: [],
    layoutValidation: {},
    issues: []
  };

  try {
    // Listen for console messages
    page.on('console', msg => console.log('Browser console:', msg.text()));

    console.log('Step 1: Navigate to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('Step 2: Fill in connection dialog');

    // Wait for the connection dialog to be visible
    await page.waitForSelector('text="Connect to IPTV Server"', { timeout: 10000 });
    console.log('Connection dialog visible');

    // Fill server URL - clear first then type
    const serverUrlInput = page.locator('input').first();
    await serverUrlInput.click({ clickCount: 3 }); // Select all
    await serverUrlInput.fill('http://baskup.xp1.tv');
    console.log('Filled server URL');
    await page.waitForTimeout(300);

    // Fill MAC address
    const macInput = page.locator('input').nth(1);
    await macInput.click();
    await macInput.fill('00:1A:79:44:96:F6');
    console.log('Filled MAC address');
    await page.waitForTimeout(300);

    // Submit the form by pressing Enter or clicking submit button
    await macInput.press('Enter');
    console.log('Submitted form via Enter key');
    await page.waitForTimeout(1000);

    console.log('Step 3: Wait for channels to load');
    // Wait for dialog to close
    await page.waitForSelector('text="Connect to IPTV Server"', { state: 'hidden', timeout: 10000 }).catch(() => {
      console.log('Dialog did not close, connection may have failed');
    });

    // Wait longer for channels to load
    await page.waitForTimeout(5000);

    try {
      // Wait for either success toast or channels to appear
      await Promise.race([
        page.waitForSelector('text=/Loaded.*channels/i', { timeout: 20000 }),
        page.waitForSelector('button:has-text("Watch Live")', { timeout: 20000 })
      ]);
      console.log('Channels loaded successfully');
    } catch (e) {
      console.log('Warning: Could not confirm channel load, waiting additional time...');
      await page.waitForTimeout(5000);
    }

    console.log('Step 4: Take screenshot after connection');
    await page.screenshot({ path: 'test-screenshots/after-fixes-connected.png', fullPage: true });
    results.screenshots.push('test-screenshots/after-fixes-connected.png');

    console.log('Step 5: Check layout elements');

    // Check sidebar visibility
    const sidebar = await page.locator('aside, [role="navigation"], nav').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    results.layoutValidation.sidebarVisible = sidebarVisible;
    console.log(`- Sidebar visible: ${sidebarVisible}`);

    // Check channels grid
    const channelsGrid = await page.locator('[class*="grid"], [data-testid="channels-grid"]').first();
    const channelsVisible = await channelsGrid.isVisible().catch(() => false);
    results.layoutValidation.channelsGridVisible = channelsVisible;
    console.log(`- Channels grid visible: ${channelsVisible}`);

    // Check for Watch Live buttons
    const watchButtons = await page.locator('button:has-text("Watch Live")').count();
    results.layoutValidation.watchButtonsCount = watchButtons;
    console.log(`- Watch Live buttons found: ${watchButtons}`);

    // Check search bar
    const searchBar = await page.locator('input[placeholder*="Search"], input[type="search"]').first();
    const searchVisible = await searchBar.isVisible().catch(() => false);
    results.layoutValidation.searchBarVisible = searchVisible;
    console.log(`- Search bar visible: ${searchVisible}`);

    // Check for overlapping elements
    if (sidebarVisible && channelsVisible) {
      const sidebarBox = await sidebar.boundingBox();
      const channelsBox = await channelsGrid.boundingBox();

      if (sidebarBox && channelsBox) {
        const overlapping = sidebarBox.x < channelsBox.x + channelsBox.width &&
                          sidebarBox.x + sidebarBox.width > channelsBox.x;
        results.layoutValidation.noOverlap = !overlapping;
        console.log(`- No sidebar/content overlap: ${!overlapping}`);

        if (overlapping) {
          results.issues.push('Sidebar and channels grid are overlapping');
        }
      }
    }

    // Check for black/empty areas
    const bodyBox = await page.locator('body').boundingBox();
    results.layoutValidation.bodyRendered = bodyBox !== null;
    console.log(`- Body properly rendered: ${bodyBox !== null}`);

    if (watchButtons > 0) {
      console.log('Step 6: Click first Watch Live button');
      await page.locator('button:has-text("Watch Live")').first().click();
      console.log('Clicked Watch Live button');

      console.log('Step 7: Wait for video player');
      try {
        await page.waitForSelector('video, [data-testid="video-player"]', { timeout: 10000 });
        console.log('Video player appeared');
      } catch (e) {
        console.log('Warning: Video player not detected, waiting additional time...');
        await page.waitForTimeout(3000);
      }

      console.log('Step 8: Take screenshot while playing');
      await page.screenshot({ path: 'test-screenshots/after-fixes-playing.png', fullPage: true });
      results.screenshots.push('test-screenshots/after-fixes-playing.png');

      console.log('Step 9: Verify player layout');

      // Check video player visibility
      const videoPlayer = await page.locator('video').first();
      const videoVisible = await videoPlayer.isVisible().catch(() => false);
      results.layoutValidation.videoPlayerVisible = videoVisible;
      console.log(`- Video player visible: ${videoVisible}`);

      // Check if channels still visible
      const channelsStillVisible = await page.locator('button:has-text("Watch Live")').first().isVisible().catch(() => false);
      results.layoutValidation.channelsStillVisible = channelsStillVisible;
      console.log(`- Channels still visible: ${channelsStillVisible}`);

      // Check sidebar still visible
      const sidebarStillVisible = await sidebar.isVisible().catch(() => false);
      results.layoutValidation.sidebarStillVisible = sidebarStillVisible;
      console.log(`- Sidebar still visible: ${sidebarStillVisible}`);

      // Check for side-by-side layout
      if (videoVisible && channelsStillVisible) {
        const videoBox = await videoPlayer.boundingBox();
        const channelsBox = await channelsGrid.boundingBox();

        if (videoBox && channelsBox) {
          const sideBySide = Math.abs(videoBox.y - channelsBox.y) < 100;
          results.layoutValidation.sideBySideLayout = sideBySide;
          console.log(`- Side-by-side layout: ${sideBySide}`);

          if (!sideBySide) {
            results.issues.push('Player and channels are not in side-by-side layout');
          }
        }
      }
    } else {
      results.issues.push('No Watch Live buttons found, could not test video player');
    }

  } catch (error) {
    console.error('Test error:', error.message);
    results.issues.push(`Test error: ${error.message}`);

    // Take error screenshot
    try {
      await page.screenshot({ path: 'test-screenshots/error-state.png', fullPage: true });
      results.screenshots.push('test-screenshots/error-state.png');
    } catch (e) {
      console.error('Could not take error screenshot');
    }
  } finally {
    await browser.close();
  }

  return results;
}

// Run the test
testFisekIPTV().then(results => {
  console.log('\n========== TEST RESULTS ==========');
  console.log('\nScreenshots taken:');
  results.screenshots.forEach(s => console.log(`  - ${s}`));

  console.log('\nLayout validation results:');
  Object.entries(results.layoutValidation).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });

  console.log('\nIssues found:');
  if (results.issues.length === 0) {
    console.log('  - No issues found!');
  } else {
    results.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log('\n==================================');
  process.exit(results.issues.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('Failed to run test:', err);
  process.exit(1);
});
