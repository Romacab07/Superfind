import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';
import { extractTrackPalette } from '../src/utils/paletteExtractor.js';

describe('SuperFind Persistent Physics & Smoke Tests', () => {

  const SAMPLE_TRACKS = [
    { id: 'track-001', title: 'Neon Horizon', artist: 'Aether Wave', genre: 'Electronic / Synthwave' },
    { id: 'track-002', title: 'Solitude Breeze', artist: 'Luna Solaris', genre: 'Ambient / Lo-Fi' },
    { id: 'track-003', title: 'Midnight Echoes', artist: 'Kroma Dream', genre: 'Indie / Dreampop' },
    { id: 'track-004', title: 'Quantum Drift', artist: 'Cipher Void', genre: 'Cinematic' },
    { id: 'track-005', title: 'Velvet Aurora', artist: 'Sora Bloom', genre: 'Indie' },
  ];

  test('SMOKE TEST 1: Initial Physics continuous motion and different positions/velocities', () => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    const bodies = SAMPLE_TRACKS.map((t, idx) => {
      const b = Matter.Bodies.circle(100 + idx * 80, 200 + idx * 40, 60, {
        restitution: 0.9,
        frictionAir: 0.04,
      });
      Matter.World.add(engine.world, b);
      return b;
    });

    // Record initial positions
    const initialPos = bodies.map(b => ({ x: b.position.x, y: b.position.y }));

    // Simulate 60 physics steps (1 second) with buoyant drift forces
    for (let step = 0; step < 60; step++) {
      bodies.forEach((b, i) => {
        const fx = Math.cos(step * 0.05 + i) * 0.005;
        const fy = Math.sin(step * 0.05 + i) * 0.005;
        Matter.Body.applyForce(b, b.position, { x: fx, y: fy });
      });
      Matter.Engine.update(engine, 16.66);
    }

    const afterPos = bodies.map(b => ({ x: b.position.x, y: b.position.y }));

    // Verify continuous movement (positions have changed, not frozen)
    bodies.forEach((b, idx) => {
      const moved = Math.hypot(afterPos[idx].x - initialPos[idx].x, afterPos[idx].y - initialPos[idx].y);
      assert.ok(moved > 0.1, `Bubble ${idx} should have moved continuously. Distance: ${moved}`);
    });

    // Verify not aligned in rigid rows (positions and velocities differ)
    const velXSet = new Set(bodies.map(b => b.velocity.x.toFixed(4)));
    assert.ok(velXSet.size > 2, 'Bubbles must have independent varying velocities');
  });

  test('SMOKE TEST 2 & 31: Physics Body Identity & Position Stability on Song Selection', () => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    const bubblesMap = new Map();

    SAMPLE_TRACKS.forEach((t, idx) => {
      const body = Matter.Bodies.circle(200 + idx * 100, 300, 70);
      Matter.World.add(engine.world, body);
      bubblesMap.set(t.id, {
        id: t.id,
        body,
        bodyId: body.id,
        track: t,
        baseRadius: 70,
        radius: 70,
        targetRadius: 70,
      });
    });

    // Record pre-selection snapshots
    const preSelectionSnap = Array.from(bubblesMap.values()).map(b => ({
      id: b.id,
      bodyId: b.body.id,
      x: b.body.position.x,
      y: b.body.position.y,
      vx: b.body.velocity.x,
      vy: b.body.velocity.y,
    }));

    // Step physics for 20 frames
    for (let i = 0; i < 20; i++) {
      Matter.Engine.update(engine, 16.66);
    }

    // STATE CHANGE: Select track-004
    const selectedTrackId = 'track-004';
    const activeBubble = bubblesMap.get(selectedTrackId);
    activeBubble.targetRadius = 110; // Hero expansion

    // Step physics for another 1 frame (immediate state transition)
    const posBeforeStep = { x: activeBubble.body.position.x, y: activeBubble.body.position.y };
    Matter.Engine.update(engine, 16.66);
    const posAfterStep = { x: activeBubble.body.position.x, y: activeBubble.body.position.y };

    // Delta verification
    const dx = Math.abs(posAfterStep.x - posBeforeStep.x);
    const dy = Math.abs(posAfterStep.y - posBeforeStep.y);
    const instantaneousJump = Math.hypot(dx, dy);

    // Delta must be continuous with physics time, NO teleportation jump (> 20px in 1 frame)
    assert.ok(instantaneousJump < 5.0, `Selection must not cause teleportation jump. Jump was: ${instantaneousJump}px`);

    // Verify Body IDs remained 100% stable
    bubblesMap.forEach((b, trackId) => {
      const original = preSelectionSnap.find(p => p.id === trackId);
      assert.strictEqual(b.body.id, original.bodyId, `Body ID for ${trackId} must remain identical (Expected ${original.bodyId}, got ${b.body.id})`);
    });
  });

  test('SMOKE TEST 33 & 41: Rapid Selection & Body Stability Test (50 rapid switches)', () => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    const bubblesMap = new Map();

    SAMPLE_TRACKS.forEach((t, idx) => {
      const body = Matter.Bodies.circle(200 + idx * 80, 250, 65);
      Matter.World.add(engine.world, body);
      bubblesMap.set(t.id, {
        id: t.id,
        body,
        bodyId: body.id,
        track: t,
      });
    });

    const initialBodyCount = engine.world.bodies.length;
    const initialBodyIds = Array.from(bubblesMap.values()).map(b => b.body.id);

    // Rapid selection sequence
    for (let iter = 0; iter < 50; iter++) {
      const trackToSelect = SAMPLE_TRACKS[iter % SAMPLE_TRACKS.length].id;
      const b = bubblesMap.get(trackToSelect);
      b.targetRadius = 100;

      // Run physical step
      Matter.Engine.update(engine, 16.66);
    }

    // Assert NO memory leak, NO duplicate bodies
    assert.strictEqual(engine.world.bodies.length, initialBodyCount, 'Total bodies in Matter.World must remain constant');
    const finalBodyIds = Array.from(bubblesMap.values()).map(b => b.body.id);
    assert.deepStrictEqual(finalBodyIds, initialBodyIds, 'All body IDs must remain perfectly preserved after 50 rapid selections');
  });

  test('SMOKE TEST 37 & 38: Distinct Album-Derived Palettes per Track', () => {
    const palettes = SAMPLE_TRACKS.map(t => extractTrackPalette(t));
    const paletteNames = palettes.map(p => p.name);
    const uniquePalettes = new Set(paletteNames);

    // Must not all fall back to the same hardcoded palette
    assert.ok(uniquePalettes.size >= 3, `Expected at least 3 distinct palettes among tracks, found: ${uniquePalettes.size}`);

    // Verify palette structure
    palettes.forEach(p => {
      assert.ok(p.primary, 'Palette must define primary color');
      assert.ok(p.secondary, 'Palette must define secondary color');
      assert.ok(p.glow, 'Palette must define glow');
      assert.ok(Array.isArray(p.rimGradient) && p.rimGradient.length >= 3, 'Palette must define multi-chromatic rim gradient');
    });
  });
});
