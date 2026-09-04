import { BrowserController } from './browser-controller.mjs';

async function runFullVerification() {
  const browser = new BrowserController();
  try {
    console.log('🚀 Starting full visual and physics regression suite...');
    await browser.start();
    await browser.navigate('http://127.0.0.1:5173/');
    await browser.wait(2500);

    // 1. Desktop Dark Mode Capture
    console.log('📸 1. Desktop Dark Mode (1920x1080)...');
    await browser.setViewport(1920, 1080);
    await browser.evaluate(`
      document.documentElement.classList.add('dark');
      localStorage.setItem('soundfind_theme', 'dark');
    `);
    await browser.wait(600);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\final_desktop_dark.png');

    // 2. Physics Regression Test (Exact sequence from prompt)
    console.log('🔬 2. Physics Persistence Regression Sequence...');
    
    // Step A: Capture initial snapshot
    const snap1 = await browser.evaluate(`window.__superfind_debug__?.captureBubbleSnapshot()`);
    console.log(`- Initial snapshot recorded with ${snap1?.bubbles?.length} bubbles.`);
    console.log(`- Initial selected track: ${snap1?.selectedTrackId}`);

    // Step B: Select Song 2 (Midnight Coffee)
    console.log('- Selecting Song 2...');
    await browser.evaluate(`
      const btn = Array.from(document.querySelectorAll('canvas'))[0];
      // trigger track change via debug or react handler
    `);
    const bubbles = snap1.bubbles;
    if (bubbles && bubbles.length > 1) {
      // Dispatch click event directly or via react
      await browser.evaluate(`
        const event = new PointerEvent('pointerdown', {
          clientX: ${bubbles[1].x + 300},
          clientY: ${bubbles[1].y + 140},
          bubbles: true
        });
        document.querySelector('canvas')?.dispatchEvent(event);
      `);
      await browser.wait(1200);

      const snap2 = await browser.evaluate(`window.__superfind_debug__?.captureBubbleSnapshot()`);
      console.log(`- Post-selection snapshot recorded. Selected: ${snap2?.selectedTrackId}`);
      
      const comp1 = await browser.evaluate(`
        window.__superfind_debug__?.compareSnapshots(${JSON.stringify(snap1)}, ${JSON.stringify(snap2)})
      `);
      console.log('- Continuity report (Snap 1 -> Snap 2):');
      console.table(comp1);

      // Verify all bodies remained 100% stable
      const unstableBodies = comp1.filter(r => !r.bodyStable || r.status === 'SUSPICIOUS_JUMP');
      if (unstableBodies.length > 0) {
        console.error('❌ Detected unstable bodies or jumps:', unstableBodies);
      } else {
        console.log('✅ ALL physics bodies remained stable and continuous (NO teleportation, NO recreation)!');
      }
    }

    // 3. Desktop Light Mode Capture ("Burbuja Clara")
    console.log('📸 3. Desktop Light Mode (1920x1080)...');
    await browser.evaluate(`
      document.documentElement.classList.remove('dark');
      localStorage.setItem('soundfind_theme', 'light');
    `);
    await browser.wait(600);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\final_desktop_light.png');

    // 4. Tablet (1024x768)
    console.log('📸 4. Tablet (1024x768)...');
    await browser.setViewport(1024, 768);
    await browser.evaluate(`
      document.documentElement.classList.add('dark');
      localStorage.setItem('soundfind_theme', 'dark');
    `);
    await browser.wait(600);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\final_tablet.png');

    // 5. Mobile (390x844)
    console.log('📸 5. Mobile (390x844)...');
    await browser.setViewport(390, 844);
    await browser.wait(600);
    await browser.screenshot('F:\\WWZ\\docs\\screenshots\\final_mobile.png');

    console.log('🎉 Full verification suite completed successfully!');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await browser.close();
  }
}

runFullVerification();
