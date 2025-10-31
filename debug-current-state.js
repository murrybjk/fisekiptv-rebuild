/**
 * Inspect current state (user already connected)
 */

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('\n🔍 Inspecting CURRENT state (user already connected)...\n');

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✓ Page loaded\n');

    // Take screenshot first
    await page.screenshot({ path: 'test-screenshots/current-state.png', fullPage: true });
    console.log('📸 Screenshot: test-screenshots/current-state.png\n');

    // ========================================================================
    // INSPECTION: Full DOM analysis
    // ========================================================================
    const analysis = await page.evaluate(() => {
      // Helper to get important info about an element
      const getElementInfo = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return { exists: false };

        const box = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);

        return {
          exists: true,
          box: {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
            visible: box.height > 0 && box.width > 0
          },
          styles: {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            overflow: computed.overflow,
            overflowY: computed.overflowY,
            height: computed.height,
            minHeight: computed.minHeight,
            maxHeight: computed.maxHeight,
            flexGrow: computed.flexGrow,
            flexShrink: computed.flexShrink
          },
          childCount: el.children.length,
          className: el.className
        };
      };

      // Get info about key containers
      const sidebarInset = getElementInfo('[data-sidebar="inset"]') || getElementInfo('.sidebar-inset');
      const liveTVLayout = getElementInfo('[class*="flex-1"][class*="flex-col"]');
      const playerSection = getElementInfo('[class*="transition-all"]');
      const channelsSection = getElementInfo('.overflow-y-auto');
      const grid = getElementInfo('.grid');

      // Check if LiveTVLayout exists by checking for its structure
      const flexContainers = Array.from(document.querySelectorAll('[class*="flex"]'));
      const liveTVLayoutCount = flexContainers.length;

      // Check specifically for the channels grid's parent chain
      const gridEl = document.querySelector('.grid');
      let gridParentChain = [];
      if (gridEl) {
        let current = gridEl;
        for (let i = 0; i < 10 && current; i++) {
          const box = current.getBoundingClientRect();
          gridParentChain.push({
            tag: current.tagName,
            className: current.className.substring(0, 100),
            height: Math.round(box.height),
            overflow: window.getComputedStyle(current).overflowY
          });
          current = current.parentElement;
        }
      }

      return {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        sidebarInset,
        liveTVLayout,
        playerSection,
        channelsSection,
        grid,
        gridParentChain,
        liveTVLayoutCount
      };
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('ANALYSIS RESULTS');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`Viewport: ${analysis.viewport.width}x${analysis.viewport.height}px\n`);

    console.log('--- SidebarInset ---');
    console.log(JSON.stringify(analysis.sidebarInset, null, 2));

    console.log('\n--- Player Section ---');
    console.log(JSON.stringify(analysis.playerSection, null, 2));

    console.log('\n--- Channels Section (.overflow-y-auto) ---');
    console.log(JSON.stringify(analysis.channelsSection, null, 2));

    console.log('\n--- Grid Container ---');
    console.log(JSON.stringify(analysis.grid, null, 2));

    console.log('\n--- Grid Parent Chain (bottom to top) ---');
    analysis.gridParentChain.forEach((parent, i) => {
      console.log(`[${i}] ${parent.tag} (h=${parent.height}px, overflow=${parent.overflow})`);
      console.log(`    ${parent.className.substring(0, 80)}`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('DIAGNOSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    if (!analysis.grid.exists) {
      console.log('❌ CRITICAL: Grid container does NOT exist');
      console.log('   The .grid element is not in the DOM at all');
      console.log('   Check: LiveTVLayout component is rendering');
    } else if (analysis.grid.box.height === 0) {
      console.log('❌ CRITICAL: Grid container has 0 height');
      console.log(`   Grid position: x=${analysis.grid.box.x}, y=${analysis.grid.box.y}`);
      console.log(`   Grid is at viewport position but collapsed`);
      console.log('\n   Checking parent chain for cause:');

      let collapseLevel = -1;
      analysis.gridParentChain.forEach((parent, i) => {
        if (parent.height === 0 && collapseLevel === -1) {
          collapseLevel = i;
          console.log(`   ⚠️  [${i}] ${parent.tag} also has 0 height - THIS IS THE COLLAPSE POINT`);
        } else if (parent.height === 0) {
          console.log(`   ⚠️  [${i}] ${parent.tag} has 0 height`);
        } else {
          console.log(`   ✓ [${i}] ${parent.tag} has ${parent.height}px height`);
        }
      });
    } else if (analysis.grid.childCount === 0) {
      console.log('❌ ISSUE: Grid exists but has NO children');
      console.log(`   Grid dimensions: ${analysis.grid.box.width}x${analysis.grid.box.height}px`);
      console.log('   Channels data is not being rendered');
      console.log('   Check: filteredChannels array in LiveTVLayout');
    } else {
      console.log('✓ Grid exists and has children!');
      console.log(`   Grid dimensions: ${analysis.grid.box.width}x${analysis.grid.box.height}px`);
      console.log(`   Grid children: ${analysis.grid.childCount}`);
      console.log('\n   If you still see black screen, check:');
      console.log('   - Are children visible? (check opacity, color)');
      console.log('   - Are children positioned off-screen?');
      console.log('   - Is there a z-index issue?');
    }

    console.log('\n✋ Browser staying open for 60 seconds for manual inspection...\n');
    await page.waitForTimeout(60000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
