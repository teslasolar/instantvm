#!/usr/bin/env node
const { chromium } = require('playwright');

const URL = 'https://teslasolar.github.io/instantvm/pages/';
let pass = 0, fail = 0;

function test(name, ok, detail) {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  console.log('⚡ InstantVM · Playwright Chrome Test\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Loading page...');
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  // Page loads
  const title = await page.title();
  test('Page title', title.includes('InstantVM'), title);

  // Splash visible
  const splash = await page.$('#splash');
  test('Splash visible', splash && await splash.isVisible());

  // Launch button exists
  const launchBtn = await page.$('text=Launch Windows');
  test('Launch Windows button exists', !!launchBtn);

  // Status shows READY
  const state = await page.$('#state');
  const stateText = await state?.textContent();
  test('Status shows READY', stateText?.includes('READY'), stateText);

  // v86 lib loaded
  const v86loaded = await page.evaluate(() => typeof V86 === 'function');
  test('v86 library loaded', v86loaded);

  // Click Launch Windows
  console.log('\nBooting Windows VM...');
  await launchBtn.click();

  // Wait for emulator to start
  await page.waitForTimeout(3000);

  // Splash hidden
  const splashHidden = await page.$eval('#splash', el => el.style.display === 'none');
  test('Splash hidden after launch', splashHidden);

  // Screen wrap visible
  const screenWrap = await page.$('#screen-wrap');
  const screenVisible = await screenWrap?.isVisible();
  test('Screen container visible', screenVisible);

  // Canvas created by v86
  const canvas = await page.$('#screen-wrap canvas');
  test('v86 canvas rendered', !!canvas);

  // Status changed from READY
  const newState = await page.$eval('#state', el => el.textContent);
  test('Status updated', !newState.includes('READY'), newState);

  // Stop button visible
  const stopBtn = await page.$('#stop-btn');
  const stopVisible = stopBtn && await stopBtn.isVisible();
  test('Stop button visible', stopVisible);

  // Wait for emulator-ready (up to 30s)
  console.log('\nWaiting for Windows to boot (up to 30s)...');
  try {
    await page.waitForFunction(() => {
      const el = document.getElementById('state');
      return el && el.textContent.includes('RUNNING');
    }, { timeout: 30000 });
    test('Emulator reached RUNNING state', true);
  } catch {
    const curState = await page.$eval('#state', el => el.textContent);
    test('Emulator reached RUNNING state', false, 'still: ' + curState);
  }

  // Screenshot
  await page.screenshot({ path: 'instantvm-test.png', fullPage: true });
  console.log('\nScreenshot saved: instantvm-test.png');

  // Stop VM
  console.log('\nStopping VM...');
  if (stopVisible) await stopBtn.click();
  await page.waitForTimeout(1000);

  const afterStop = await page.$eval('#state', el => el.textContent);
  test('Status back to READY after stop', afterStop.includes('READY'), afterStop);

  const splashBack = await page.$eval('#splash', el => el.style.display !== 'none');
  test('Splash restored after stop', splashBack);

  console.log('\n═══════════════════════════');
  console.log('  ' + pass + '/' + (pass + fail) + ' passed' + (fail ? '  (' + fail + ' failed)' : '  ✓ ALL PASS'));
  console.log('═══════════════════════════\n');

  await browser.close();
  process.exit(fail ? 1 : 0);
})();
