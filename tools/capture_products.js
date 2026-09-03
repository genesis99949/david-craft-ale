const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('file:///' + path.resolve('products.html').replace(/\\/g, '/'), {
      waitUntil: 'domcontentloaded', timeout: 10000,
    });
    await page.waitForTimeout(1200);
    await page.locator('#full-lineup').scrollIntoViewIfNeeded();
    await page.locator('.full-lineup-section').screenshot({ path: `.tmp/full-lineup-${name}.png` });
    console.log(name, JSON.stringify({
      cards: await page.locator('.full-lineup-grid .prod-card').count(),
      buttons: await page.locator('.full-lineup-grid .add-to-cart').count(),
      scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
      clientWidth: await page.evaluate(() => document.documentElement.clientWidth),
      errors,
    }));
  }
  await browser.close();
})();
