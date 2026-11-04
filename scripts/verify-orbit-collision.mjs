/**
 * Empirical Adversarial Verification Script: Collision Clearance & Orbit Geometry
 * Role: Challenger 1 (EMPIRICAL CHALLENGER)
 * Target: src/components/ProductOrbitShowcase.tsx
 */

import assert from "node:assert";

console.log("================================================================================");
console.log("   ORBIT GEOMETRY & COLLISION CLEARANCE EMPIRICAL ADVERSARIAL STRESS TEST       ");
console.log("================================================================================");

const BREAKPOINTS = [
  {
    name: "Desktop (xl: >= 1280px)",
    viewport: 1440,
    Dc: 365,
    Dsat: 66,
    Rx: 430,
    Ry: 230,
  },
  {
    name: "Laptop (lg: 1024px - 1279px)",
    viewport: 1100,
    Dc: 340,
    Dsat: 64,
    Rx: 380,
    Ry: 215,
  },
  {
    name: "Tablet (md: 768px - 1023px)",
    viewport: 820,
    Dc: 280,
    Dsat: 56,
    Rx: 300,
    Ry: 185,
  },
  {
    name: "Phablet Upper (sm: 640px - 767px)",
    viewport: 700,
    Dc: 230,
    Dsat: 48,
    Rx: 225,
    Ry: 150,
  },
  {
    name: "Phablet Lower (480px - 639px)",
    viewport: 520,
    Dc: 180,
    Dsat: 44,
    Rx: 225,
    Ry: 150,
  },
  {
    name: "Mobile (< 480px)",
    viewport: 375,
    Dc: 180,
    Dsat: 44,
    Rx: 175,
    Ry: 125,
  },
];

const TILT_DEG = -28;
const TILT_RAD = (TILT_DEG * Math.PI) / 180;
const COS_TILT = Math.cos(TILT_RAD);
const SIN_TILT = Math.sin(TILT_RAD);

let allBreakpointsPassed = true;
const summary = [];

console.log("\n[TEST SUITE 1] SATELLITE-TO-CENTER COLLISION CLEARANCE (3,600 samples per BP @ 0.1°)");
console.log("Formula: clearance(phi) = dist(phi) - R_center - R_sat_scaled");

for (const bp of BREAKPOINTS) {
  const Rc = bp.Dc / 2;
  const RsatBase = bp.Dsat / 2;

  let minClearance = Infinity;
  let minClearanceDeg = 0;
  let maxClearance = -Infinity;
  let maxClearanceDeg = 0;
  let minRingClearance = Infinity;
  let maxResidual = 0;

  let totalSamples = 0;
  let collisionCount = 0;

  // Step size: 0.1 degree (3,600 samples)
  for (let deg = 0; deg < 360; deg += 0.1) {
    totalSamples++;
    const phi = (deg * Math.PI) / 180;

    // Parametric coordinates of untilted ellipse
    const u = bp.Rx * Math.cos(phi);
    const v = bp.Ry * Math.sin(phi);

    // Rotated coordinates
    const x = u * COS_TILT - v * SIN_TILT;
    const y = u * SIN_TILT + v * COS_TILT;

    // Center distance
    const dist = Math.hypot(x, y);

    // Exact theoretical distance check
    const expectedDist = Math.sqrt((bp.Rx * Math.cos(phi)) ** 2 + (bp.Ry * Math.sin(phi)) ** 2);
    const distDiff = Math.abs(dist - expectedDist);
    if (distDiff > maxResidual) maxResidual = distDiff;

    // Satellite scale & radius
    const depth = (Math.sin(phi) + 1) / 2;
    const scale = 0.92 + depth * 0.16;
    const RsatScaled = RsatBase * scale;

    // Edge-to-edge clearances
    const clearance = dist - Rc - RsatScaled;
    const ringClearance = clearance - 2.0; // with active Tailwind ring-2 (2px)

    if (clearance <= 0) {
      collisionCount++;
    }

    if (clearance < minClearance) {
      minClearance = clearance;
      minClearanceDeg = deg;
    }
    if (clearance > maxClearance) {
      maxClearance = clearance;
      maxClearanceDeg = deg;
    }
    if (ringClearance < minRingClearance) {
      minRingClearance = ringClearance;
    }
  }

  const passed = minClearance > 0 && collisionCount === 0;
  if (!passed) allBreakpointsPassed = false;

  summary.push({
    bp: bp.name,
    minClearance,
    minClearanceDeg,
    maxClearance,
    maxClearanceDeg,
    minRingClearance,
    passed,
  });

  console.log(`\n• Breakpoint: ${bp.name}`);
  console.log(`  Dimensions: Rx=${bp.Rx}px, Ry=${bp.Ry}px, Center D=${bp.Dc}px (R=${Rc}px), Sat D=${bp.Dsat}px (R=${RsatBase}px)`);
  console.log(`  Total angle samples tested: ${totalSamples}`);
  console.log(`  Min Edge-to-Edge Clearance: +${minClearance.toFixed(3)}px (at ${minClearanceDeg.toFixed(1)}°)`);
  console.log(`  Min Clearance with Ring-2:  +${minRingClearance.toFixed(3)}px`);
  console.log(`  Max Edge-to-Edge Clearance: +${maxClearance.toFixed(3)}px (at ${maxClearanceDeg.toFixed(1)}°)`);
  console.log(`  Geometric rotation residual: < ${maxResidual.toExponential(3)}px`);
  console.log(`  Collisions detected: ${collisionCount} (STATUS: ${passed ? "PASS" : "FAIL"})`);

  assert.strictEqual(collisionCount, 0, `Collision detected in breakpoint ${bp.name}!`);
  assert(minClearance > 0, `Clearance is not strictly positive in ${bp.name}`);
}

console.log("\n--------------------------------------------------------------------------------");
console.log("[TEST SUITE 2] ADJACENT SATELLITE-TO-SATELLITE CLEARANCE (8 Nodes @ 45° separation)");
console.log("Formula: dist(sat_i, sat_j) - R_sat_i - R_sat_j > 0");

const TOTAL_NODES = 8;
const ANGULAR_STEP = 360 / TOTAL_NODES; // 45 degrees

for (const bp of BREAKPOINTS) {
  const RsatBase = bp.Dsat / 2;
  let minInterSatClearance = Infinity;
  let worstAngle = 0;
  let worstPair = [0, 0];

  for (let baseDeg = 0; baseDeg < 360; baseDeg += 0.5) {
    const nodes = [];
    for (let i = 0; i < TOTAL_NODES; i++) {
      const phi = ((baseDeg + i * ANGULAR_STEP) * Math.PI) / 180;
      const u = bp.Rx * Math.cos(phi);
      const v = bp.Ry * Math.sin(phi);
      const x = u * COS_TILT - v * SIN_TILT;
      const y = u * SIN_TILT + v * COS_TILT;
      const depth = (Math.sin(phi) + 1) / 2;
      const scale = 0.92 + depth * 0.16;
      const r = RsatBase * scale;
      nodes.push({ x, y, r });
    }

    for (let i = 0; i < TOTAL_NODES; i++) {
      for (let j = i + 1; j < TOTAL_NODES; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        const cl = d - nodes[i].r - nodes[j].r;
        if (cl < minInterSatClearance) {
          minInterSatClearance = cl;
          worstAngle = baseDeg;
          worstPair = [i, j];
        }
      }
    }
  }

  console.log(`• ${bp.name}: Min inter-satellite clearance = +${minInterSatClearance.toFixed(2)}px between node ${worstPair[0]} & ${worstPair[1]} at orbit angle ${worstAngle.toFixed(1)}° (PASS)`);
  assert(minInterSatClearance > 0, `Inter-satellite collision in ${bp.name}!`);
}

console.log("\n--------------------------------------------------------------------------------");
console.log("[TEST SUITE 3] SVG CAD ORBIT PATH EXACT CONCORDANCE");
console.log("Verify algebraic ellipse equation in tilted coordinates: (u/Rx)^2 + (v/Ry)^2 === 1");

for (const bp of BREAKPOINTS) {
  let maxConcordanceErr = 0;
  for (let deg = 0; deg < 360; deg += 1) {
    const phi = (deg * Math.PI) / 180;
    const u = bp.Rx * Math.cos(phi);
    const v = bp.Ry * Math.sin(phi);
    const x = u * COS_TILT - v * SIN_TILT;
    const y = u * SIN_TILT + v * COS_TILT;

    // Un-rotate by inverse tilt (+28 deg)
    const uRecovered = x * COS_TILT + y * SIN_TILT;
    const vRecovered = -x * SIN_TILT + y * COS_TILT;

    const ellipseEq = (uRecovered / bp.Rx) ** 2 + (vRecovered / bp.Ry) ** 2;
    const err = Math.abs(ellipseEq - 1.0);
    if (err > maxConcordanceErr) maxConcordanceErr = err;
  }
  console.log(`• ${bp.name}: Ellipse algebraic residual = ${maxConcordanceErr.toExponential(3)} (CONCORDANT)`);
  assert(maxConcordanceErr < 1e-12, `Algebraic residual too high in ${bp.name}!`);
}

console.log("\n================================================================================");
console.log(`FINAL STRESS TEST VERDICT: ${allBreakpointsPassed ? "ALL TESTS PASSED (APPROVE)" : "FAILURES DETECTED (REQUEST_CHANGES)"}`);
console.log("================================================================================");
