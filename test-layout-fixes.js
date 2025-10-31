const { chromium } = require('@playwright/test');

(async () => {
  console.log('🚀 Starting layout fix validation...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // Step 1: Navigate
    console.log('📍 Step 1: Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Step 2: Fill connection dialog
    console.log('📍 Step 2: Filling connection credentials...');
    await page.fill('input[name="serverUrl"]', 'http://baskup.xp1.tv');
    await page.fill('input[name="macAddress"]', '00:1A:79:44:96:F6');
    
    console.log('📍 Step 3: Clicking Connect button...');
    await page.click('button[type="submit"]:has-text("Connect to Server")');
    
    // Wait for connection and channels to load
    console.log('📍 Step 4: Waiting for channels to load...');
    await page.waitForTimeout(8000);
    
    // Take screenshot after connection
    console.log('📸 Taking screenshot: after-fixes-connected.png');
    await page.screenshot({ 
      path: 'test-screenshots/after-fixes-connected.png',
      fullPage: true 
    });

    // Step 5: Analyze layout
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('LAYOUT ANALYSIS - AFTER FIXES');
    console.log('═══════════════════════════════════════════════════════\n');

    const layout = await page.evaluate(() => {
      const sidebar = document.querySelector('[data-sidebar="sidebar"]');
      const sidebarInset = document.querySelector('main');
      const header = document.querySelector('header');
      const channelsGrid = document.querySelector('.grid');
      const searchBar = document.querySelector('input[placeholder*="Search"]');

      return {
        sidebar: sidebar ? {
          visible: window.getComputedStyle(sidebar).display !== 'none',
          box: sidebar.getBoundingClientRect(),
          zIndex: window.getComputedStyle(sidebar).zIndex
        } : null,
        sidebarInset: sidebarInset ? {
          box: sidebarInset.getBoundingClientRect(),
          overflow: window.getComputedStyle(sidebarInset).overflow,
          height: window.getComputedStyle(sidebarInset).height
        } : null,
        header: header ? {
          box: header.getBoundingClientRect(),
          zIndex: window.getComputedStyle(header).zIndex,
          position: window.getComputedStyle(header).position
        } : null,
        channelsGrid: channelsGrid ? {
          visible: window.getComputedStyle(channelsGrid).display !== 'none',
          box: channelsGrid.getBoundingClientRect(),
          childCount: channelsGrid.children.length
        } : null,
        searchBar: searchBar ? {
          visible: window.getComputedStyle(searchBar).display !== 'none',
          box: searchBar.getBoundingClientRect()
        } : null,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    });

    console.log('Sidebar:', JSON.stringify(layout.sidebar, null, 2));
    console.log('\nSidebarInset:', JSON.stringify(layout.sidebarInset, null, 2));
    console.log('\nHeader:', JSON.stringify(layout.header, null, 2));
    console.log('\nChannels Grid:', JSON.stringify(layout.channelsGrid, null, 2));
    console.log('\nSearch Bar:', JSON.stringify(layout.searchBar, null, 2));

    // Step 6: Try to play a channel
    console.log('\n📍 Step 6: Looking for "Watch Live" button...');
    const watchButton = await page.locator('button:has-text("Watch Live")').first();
    
    if (await watchButton.isVisible()) {
      console.log('✅ Found Watch Live button, clicking...');
      await watchButton.click();
      await page.waitForTimeout(5000);
      
      console.log('📸 Taking screenshot: after-fixes-playing.png');
      await page.screenshot({ 
        path: 'test-screenshots/after-fixes-playing.png',
        fullPage: true 
      });

      // Analyze playing layout
      const playingLayout = await page.evaluate(() => {
        const player = document.querySelector('[data-vjs-player]');
        const channelsSection = document.querySelector('.overflow-y-auto');
        
        return {
          player: player ? {
            visible: true,
            box: player.getBoundingClientRect()
          } : null,
          channelsSection: channelsSection ? {
            box: channelsSection.getBoundingClientRect()
          } : null
        };
      });

      console.log('\n--- PLAYING STATE ---');
      console.log('Player:', JSON.stringify(playingLayout.player, null, 2));
      console.log('Channels Section:', JSON.stringify(playingLayout.channelsSection, null, 2));
    } else {
      console.log('⚠️  No Watch Live button found');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETE - Browser will stay open for 120 seconds');
    console.log('═══════════════════════════════════════════════════════\n');
    
    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'test-screenshots/error-state.png' });
  } finally {
    await browser.close();
  }
})();
