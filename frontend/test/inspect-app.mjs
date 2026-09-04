import { BrowserController } from './browser-controller.mjs';
import path from 'node:path';

async function run() {
  const browser = new BrowserController();
  try {
    console.log('🚀 Launching browser automation...');
    await browser.start();
    console.log('🌐 Navigating to http://127.0.0.1:5173/ ...');
    await browser.navigate('http://127.0.0.1:5173/');

    // Wait for physics to settle & tracks to load
    await browser.wait(3000);

    // 1. Capture Desktop Dark Mode
    console.log('📸 Capturing Desktop Dark Mode screenshot...');
    await browser.setViewport(1920, 1080);
    await browser.evaluate(`document.documentElement.classList.add('dark');`);
    await browser.wait(500);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\current_desktop_dark.png');

    // 2. Capture Desktop Light Mode
    console.log('📸 Capturing Desktop Light Mode screenshot...');
    await browser.evaluate(`document.documentElement.classList.remove('dark');`);
    await browser.wait(500);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\current_desktop_light.png');

    // Restore Dark mode
    await browser.evaluate(`document.documentElement.classList.add('dark');`);
    await browser.wait(500);

    // 3. Test Physics Continuity & Track Selection
    console.log('🔬 Testing Physics Continuity & Track Selection...');
    const snapshotA = await browser.evaluate(`window.__superfind_debug__?.captureBubbleSnapshot()`);
    console.log(`Snapshot A captured with ${snapshotA?.bubbles?.length || 0} bubbles.`);

    // Click on a bubble
    if (snapshotA && snapshotA.bubbles && snapshotA.bubbles.length > 1) {
      const targetBubble = snapshotA.bubbles[1];
      console.log(`Clicking bubble: ${targetBubble.id} at (${targetBubble.x}, ${targetBubble.y})`);
      // Note: canvas is inside main
      await browser.click(targetBubble.x + 288, targetBubble.y + 120); // rough offset
      await browser.wait(1500);

      const snapshotB = await browser.evaluate(`window.__superfind_debug__?.captureBubbleSnapshot()`);
      console.log(`Snapshot B captured. Active track: ${snapshotB?.selectedTrackId}`);
      
      const comparison = await browser.evaluate(`window.__superfind_debug__?.compareSnapshots(${JSON.stringify(snapshotA)}, ${JSON.stringify(snapshotB)})`);
      console.log('Physics continuity report:');
      console.table(comparison);
    }

    // 4. Capture Tablet & Mobile
    console.log('📸 Capturing Tablet (1024x768)...');
    await browser.setViewport(1024, 768);
    await browser.wait(600);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\current_tablet.png');

    console.log('📸 Capturing Mobile (390x844)...');
    await browser.setViewport(390, 844);
    await browser.wait(600);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\current_mobile.png');

    console.log('✅ All inspections completed successfully!');
  } catch (err) {
    console.error('❌ Inspection error:', err);
  } finally {
    await browser.close();
  }
}

run();
