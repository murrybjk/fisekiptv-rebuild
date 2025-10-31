/**
 * Deep DOM Inspection for Channels Issue
 */

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('\n🔍 Starting Deep DOM Inspection...\n');

  try {
    // Load page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✓ Page loaded\n');

    // Fill and submit connection form
    await page.fill('input[placeholder="http://example.com"]', 'http://baskup.xp1.tv');
    await page.fill('input[placeholder="00:1A:79:XX:XX:XX"]', '00:1A:79:44:96:F6');
    await page.click('button:has-text("Connect to Server")', { force: true });

    console.log('✓ Connection form submitted');
    console.log('⏳ Waiting for channels to load...\n');

    await page.waitForTimeout(5000);

    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/debug-after-connection.png', fullPage: true });
    console.log('📸 Screenshot saved: test-screenshots/debug-after-connection.png\n');

    // ============================================================================
    // INSPECTION 1: Check if channels are in the DOM
    // ============================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('INSPECTION 1: Checking DOM for channel elements');
    console.log('═══════════════════════════════════════════════════════\n');

    const channelCardCount = await page.locator('[class*="card"]').count();
    console.log(`Found ${channelCardCount} elements with "card" class`);

    // Check for grid container
    const gridExists = await page.locator('.grid').count();
    console.log(`Found ${gridExists} elements with ".grid" class`);

    // Check for any channel-related text
    const channelTextCount = await page.locator('text=/TR - /i').count();
    console.log(`Found ${channelTextCount} elements with "TR - " text (channel indicators)\n`);

    // ============================================================================
    // INSPECTION 2: Check LiveTVLayout structure
    // ============================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('INSPECTION 2: LiveTVLayout structure');
    console.log('═══════════════════════════════════════════════════════\n');

    const layoutInfo = await page.evaluate(() => {
      // Find the main flex container
      const flexContainers = Array.from(document.querySelectorAll('[class*="flex"]'));

      // Find player section
      const playerSection = document.querySelector('[class*="transition-all"]');
      const playerBox = playerSection?.getBoundingClientRect();

      // Find channels section
      const channelsSection = document.querySelector('.overflow-y-auto');
      const channelsBox = channelsSection?.getBoundingClientRect();

      // Find grid
      const grid = document.querySelector('.grid');
      const gridBox = grid?.getBoundingClientRect();

      return {
        playerSection: playerBox ? {
          x: Math.round(playerBox.x),
          y: Math.round(playerBox.y),
          width: Math.round(playerBox.width),
          height: Math.round(playerBox.height),
          visible: playerBox.height > 0 && playerBox.width > 0
        } : null,
        channelsSection: channelsBox ? {
          x: Math.round(channelsBox.x),
          y: Math.round(channelsBox.y),
          width: Math.round(channelsBox.width),
          height: Math.round(channelsBox.height),
          visible: channelsBox.height > 0 && channelsBox.width > 0
        } : null,
        grid: gridBox ? {
          x: Math.round(gridBox.x),
          y: Math.round(gridBox.y),
          width: Math.round(gridBox.width),
          height: Math.round(gridBox.height),
          visible: gridBox.height > 0 && gridBox.width > 0
        } : null,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    console.log('Player Section:', layoutInfo.playerSection);
    console.log('Channels Section:', layoutInfo.channelsSection);
    console.log('Grid Container:', layoutInfo.grid);
    console.log('Viewport:', layoutInfo.viewport);
    console.log('');

    // ============================================================================
    // INSPECTION 3: Check computed styles
    // ============================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('INSPECTION 3: Computed styles on key elements');
    console.log('═══════════════════════════════════════════════════════\n');

    const styles = await page.evaluate(() => {
      const channelsSection = document.querySelector('.overflow-y-auto');
      const grid = document.querySelector('.grid');

      const getImportantStyles = (el) => {
        if (!el) return null;
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          height: computed.height,
          minHeight: computed.minHeight,
          maxHeight: computed.maxHeight,
          overflow: computed.overflow,
          overflowY: computed.overflowY,
          position: computed.position,
          zIndex: computed.zIndex
        };
      };

      return {
        channelsSection: getImportantStyles(channelsSection),
        grid: getImportantStyles(grid)
      };
    });

    console.log('Channels Section Styles:');
    console.log(JSON.stringify(styles.channelsSection, null, 2));
    console.log('\nGrid Styles:');
    console.log(JSON.stringify(styles.grid, null, 2));
    console.log('');

    // ============================================================================
    // INSPECTION 4: Check if ChannelCard components rendered
    // ============================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('INSPECTION 4: ChannelCard component rendering');
    console.log('═══════════════════════════════════════════════════════\n');

    const cardInfo = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return { exists: false };

      const children = grid.children;
      const childCount = children.length;

      if (childCount === 0) return { exists: true, childCount: 0, children: [] };

      // Get info about first few children
      const childrenInfo = Array.from(children).slice(0, 5).map(child => ({
        tagName: child.tagName,
        className: child.className,
        textContent: child.textContent?.substring(0, 50),
        box: child.getBoundingClientRect()
      }));

      return {
        exists: true,
        childCount,
        children: childrenInfo
      };
    });

    console.log('Grid exists:', cardInfo.exists);
    console.log('Children count:', cardInfo.childCount);
    if (cardInfo.children?.length > 0) {
      console.log('\nFirst few children:');
      cardInfo.children.forEach((child, i) => {
        console.log(`  [${i}]`, {
          tag: child.tagName,
          visible: child.box.height > 0 && child.box.width > 0,
          dimensions: `${Math.round(child.box.width)}x${Math.round(child.box.height)}`,
          text: child.textContent
        });
      });
    }
    console.log('');

    // ============================================================================
    // INSPECTION 5: Check React state
    // ============================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('INSPECTION 5: Checking if channels data exists');
    console.log('═══════════════════════════════════════════════════════\n');

    const dataCheck = await page.evaluate(() => {
      // Try to find channels data in component props/state
      const gridElement = document.querySelector('.grid');
      if (!gridElement) return { gridFound: false };

      // Check if there are any elements being mapped
      const hasChildren = gridElement.children.length > 0;

      // Check loading state
      const loadingIndicator = document.querySelector('text=/Loading channels/i');
      const isLoading = !!loadingIndicator;

      // Check "No channels" message
      const noChannelsMsg = document.querySelector('text=/No channels found/i');
      const showsNoChannels = !!noChannelsMsg;

      return {
        gridFound: true,
        hasChildren,
        isLoading,
        showsNoChannels
      };
    });

    console.log('Data State:');
    console.log(`  Grid found: ${dataCheck.gridFound}`);
    console.log(`  Has children: ${dataCheck.hasChildren}`);
    console.log(`  Is loading: ${dataCheck.isLoading}`);
    console.log(`  Shows "No channels": ${dataCheck.showsNoChannels}`);
    console.log('');

    // ============================================================================
    // DIAGNOSIS
    // ============================================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!layoutInfo.grid) {
      console.log('❌ ISSUE: Grid container not found in DOM');
      console.log('   Likely cause: LiveTVLayout not rendering properly');
    } else if (layoutInfo.grid.height === 0) {
      console.log('❌ ISSUE: Grid container has 0 height');
      console.log('   Likely cause: Flex layout collapse');
      console.log(`   Grid position: x=${layoutInfo.grid.x}, y=${layoutInfo.grid.y}`);
    } else if (!layoutInfo.grid.visible) {
      console.log('❌ ISSUE: Grid container is not visible');
      console.log('   Check: opacity, visibility, z-index');
    } else if (cardInfo.childCount === 0) {
      console.log('❌ ISSUE: Grid exists but has no children');
      console.log('   Likely cause: Channels array is empty or not being mapped');
    } else {
      console.log('✓ Grid and children exist!');
      console.log('   Checking if children are visible...');

      if (cardInfo.children[0]?.box.height === 0) {
        console.log('❌ ISSUE: Children have 0 height');
        console.log('   Likely cause: CSS issue on ChannelCard');
      } else {
        console.log('✓ Children appear to have dimensions');
        console.log('⚠️  Manual inspection needed - channels may be off-screen');
      }
    }

    console.log('\n✋ Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error during inspection:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
