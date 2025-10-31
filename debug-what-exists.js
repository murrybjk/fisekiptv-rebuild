/**
 * Find out what's ACTUALLY in the DOM
 */

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('\n🔍 Finding what EXISTS in DOM...\n');

    // Dump the entire body structure
    const domStructure = await page.evaluate(() => {
      const getStructure = (el, depth = 0, maxDepth = 8) => {
        if (!el || depth > maxDepth) return null;

        const box = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        const result = {
          tag: el.tagName,
          id: el.id || '',
          classes: el.className?.toString().substring(0, 100) || '',
          box: {
            width: Math.round(box.width),
            height: Math.round(box.height),
            x: Math.round(box.x),
            y: Math.round(box.y)
          },
          display: style.display,
          childCount: el.children.length
        };

        // If has interesting children, recurse
        if (el.children.length > 0 && el.children.length < 20 && depth < maxDepth) {
          result.children = Array.from(el.children).map(child =>
            getStructure(child, depth + 1, maxDepth)
          ).filter(Boolean);
        }

        return result;
      };

      const body = document.body;
      return getStructure(body);
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('DOM STRUCTURE');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(JSON.stringify(domStructure, null, 2));

    // Also check for specific selectors
    const checks = await page.evaluate(() => {
      const selectors = [
        'body',
        '#__next',
        '[data-sidebar]',
        '[data-sidebar="provider"]',
        '[data-sidebar="sidebar"]',
        '[data-sidebar="inset"]',
        '.flex-1',
        '.grid',
        '[class*="overflow"]'
      ];

      return selectors.map(sel => ({
        selector: sel,
        count: document.querySelectorAll(sel).length,
        exists: document.querySelector(sel) !== null
      }));
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SELECTOR CHECKS');
    console.log('═══════════════════════════════════════════════════════\n');
    checks.forEach(check => {
      console.log(`${check.exists ? '✓' : '✗'} ${check.selector} (count: ${check.count})`);
    });

    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
