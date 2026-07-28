/**
 * Smoke test usando directamente solveMNA (lógica inline idéntica)
 * Tests circuitos canónicos contra valores teóricos.
 *
 * Run: node test/mna.test.mjs
 */

// ── Inline del solver (idéntico a MNASolver.ts) ───────────────────────────

function gaussianElimination(A, b) {
  const n = b.length;
  const aug = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) return null;
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let k = col; k <= n; k++) aug[row][k] -= factor * aug[col][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n] / aug[i][i];
    for (let k = i - 1; k >= 0; k--) aug[k][n] -= aug[k][i] * x[i];
  }
  return x;
}

function solveMNA(elements, nodeCount) {
  const voltageSources = elements.filter(e => e.type === 'VS');
  const opAmps = elements.filter(e => e.type === 'OpAmp');
  const nNodes = nodeCount - 1;
  const nExtra = voltageSources.length + opAmps.length;
  const size = nNodes + nExtra;
  if (size === 0) return null;

  const G = Array.from({ length: size }, () => new Array(size).fill(0));
  const I = new Array(size).fill(0);
  const ni = (n) => n - 1; // node index (excl. GND=0)

  // Resistors
  for (const el of elements) {
    if (el.type !== 'R') continue;
    const [a, b] = el.nodes;
    const g = 1 / el.value;
    if (a !== 0) G[ni(a)][ni(a)] += g;
    if (b !== 0) G[ni(b)][ni(b)] += g;
    if (a !== 0 && b !== 0) { G[ni(a)][ni(b)] -= g; G[ni(b)][ni(a)] -= g; }
  }

  // Voltage sources
  voltageSources.forEach((el, k) => {
    const vsRow = nNodes + k;
    const [np, nm] = el.nodes;
    if (np !== 0) { G[ni(np)][vsRow] += 1; G[vsRow][ni(np)] += 1; }
    if (nm !== 0) { G[ni(nm)][vsRow] -= 1; G[vsRow][ni(nm)] -= 1; }
    I[vsRow] = el.value;
  });

  // Op-Amps (fixed stamp)
  opAmps.forEach((el, k) => {
    const opRow = nNodes + voltageSources.length + k;
    const [nInP, nInN, nOut] = el.nodes;
    if (nOut !== 0) G[ni(nOut)][opRow] += 1;          // B column
    if (nInP !== 0) G[opRow][ni(nInP)] = 1;            // constraint: +V_in+
    if (nInN !== 0) G[opRow][ni(nInN)] = -1;           // constraint: -V_in-
    I[opRow] = 0;
  });

  return gaussianElimination(G, I);
}

// ── Test harness ──────────────────────────────────────────────────────────

let passed = 0, failed = 0;
const approx = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;

function assert(desc, condition, detail = '') {
  if (condition) { console.log(`  ✅ ${desc}`); passed++; }
  else           { console.log(`  ❌ ${desc}  (${detail})`); failed++; }
}

// ─── Test 1: Divisor de voltaje ─────────────────────────────────────────────
// Nodes: 0=GND, 1=VS+, 2=midpoint
// VS(10V): N1→GND  |  R1(1kΩ): N1→N2  |  R2(1kΩ): N2→GND
// Teoría: V1=10V, V2=5V, I=5mA
console.log('\n🧪 Test 1: Divisor de voltaje — VS(10V) + R1(1kΩ) + R2(1kΩ) + GND');
{
  const elements = [
    { type: 'VS', nodes: [1, 0], value: 10 },
    { type: 'R',  nodes: [1, 2], value: 1000 },
    { type: 'R',  nodes: [2, 0], value: 1000 },
  ];
  const sol = solveMNA(elements, 3); // nodeCount=3 (0,1,2)
  // sol: [V1, V2, I_VS]
  assert('V1 = 10 V', sol && approx(sol[0], 10), `V1=${sol?.[0]}`);
  assert('V2 = 5 V',  sol && approx(sol[1], 5),  `V2=${sol?.[1]}`);
  assert('|I_VS| = 5 mA', sol && approx(Math.abs(sol[2]), 0.005, 0.0005), `I=${sol?.[2]*1000} mA`);
}

// ─── Test 2: Seguidor de voltaje (buffer) ──────────────────────────────────
// Nodes: 0=GND, 1=Vin, 2=Vout (=Vin-)
// VS(3.3V): N1→GND  |  OpAmp: in+(N1), in-(N2), out(N2)
// Teoría: Vout = 3.3V, Av = 1
console.log('\n🧪 Test 2: Seguidor de voltaje — VS(3.3V) + Op-Amp buffer');
{
  const elements = [
    { type: 'VS',    nodes: [1, 0],    value: 3.3 },
    { type: 'OpAmp', nodes: [1, 2, 2], value: 1e6 }, // in+:N1, in-:N2, out:N2
  ];
  const sol = solveMNA(elements, 3);
  // sol: [V1, V2, I_VS, I_OpAmp]
  assert('Vin (V1) = 3.3 V',  sol && approx(sol[0], 3.3), `V1=${sol?.[0]}`);
  assert('Vout (V2) = 3.3 V', sol && approx(sol[1], 3.3), `V2=${sol?.[1]}`);
}

// ─── Test 3: Amplificador inversor ─────────────────────────────────────────
// Nodes: 0=GND, 1=Vin, 2=V-(virtual gnd), 3=Vout
// VS(1V): N1→GND  |  Rin(1kΩ): N1→N2  |  Rf(10kΩ): N2→N3
// OpAmp: in+(GND=0), in-(N2), out(N3)
// Teoría: V2≈0V (virtual short), Vout = -Rf/Rin * Vin = -10V
console.log('\n🧪 Test 3: Amplificador Inversor — Vin=1V, Rin=1kΩ, Rf=10kΩ');
{
  const elements = [
    { type: 'VS',    nodes: [1, 0],    value: 1 },
    { type: 'R',     nodes: [1, 2],    value: 1000 },
    { type: 'R',     nodes: [2, 3],    value: 10000 },
    { type: 'OpAmp', nodes: [0, 2, 3], value: 1e6 }, // in+:GND, in-:N2, out:N3
  ];
  const sol = solveMNA(elements, 4);
  // sol: [V1, V2, V3, I_VS, I_OpAmp]
  assert('Vin (V1) = 1 V',           sol && approx(sol[0], 1, 0.01),  `V1=${sol?.[0]}`);
  assert('V- (V2) ≈ 0 V (virtual)',  sol && approx(sol[1], 0, 0.01),  `V2=${sol?.[1]}`);
  assert('Vout (V3) = -10 V',        sol && approx(sol[2], -10, 0.1), `V3=${sol?.[2]}`);
}

// ─── Test 4: Amplificador no inversor ──────────────────────────────────────
// Nodes: 0=GND, 1=Vin, 2=V-(junction), 3=Vout
// VS(2V): N1→GND  |  R1(1kΩ): N2→GND  |  Rf(9kΩ): N2→N3
// OpAmp: in+(N1), in-(N2), out(N3)
// Teoría: Vout = (1 + Rf/R1) * Vin = 10 * 2 = 20V
console.log('\n🧪 Test 4: Amplificador No Inversor — Vin=2V, R1=1kΩ, Rf=9kΩ → Av=10');
{
  const elements = [
    { type: 'VS',    nodes: [1, 0],    value: 2 },
    { type: 'R',     nodes: [2, 0],    value: 1000 },
    { type: 'R',     nodes: [2, 3],    value: 9000 },
    { type: 'OpAmp', nodes: [1, 2, 3], value: 1e6 }, // in+:N1, in-:N2, out:N3
  ];
  const sol = solveMNA(elements, 4);
  // sol: [V1, V2, V3, I_VS, I_OpAmp]
  assert('Vin (V1) = 2 V',    sol && approx(sol[0], 2, 0.01),  `V1=${sol?.[0]}`);
  assert('V- (V2) = 2 V',     sol && approx(sol[1], 2, 0.1),   `V2=${sol?.[1]}`);
  assert('Vout (V3) = 20 V',  sol && approx(sol[2], 20, 0.2),  `V3=${sol?.[2]}`);
}

// ─── Summary ────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(55)}`);
console.log(`Resultados: ${passed} ✅ pasaron, ${failed} ❌ fallaron de ${passed+failed} total`);
if (failed > 0) process.exit(1);
else console.log('🎉 Todos los tests pasaron');
