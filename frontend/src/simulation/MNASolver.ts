/**
 * MNASolver.ts
 * Modified Nodal Analysis (MNA) for DC circuit simulation.
 *
 * Theory:
 *   [G  B] [v]   [i]
 *   [C  D] [j] = [e]
 *
 *   G: conductance matrix (from resistors)
 *   B,C,D: voltage source stamps
 *   v: unknown node voltages
 *   j: unknown branch currents through voltage sources
 *   i: independent current sources at each node
 *   e: independent voltage sources
 *
 * Reference: Pillage, Rohrer & Visweswariah, "Electronic Circuit & System Simulation Methods"
 */

import type { NetlistElement, SimulationResult } from './types';

// ── Gaussian Elimination with Partial Pivoting ─────────────────────────────
function gaussianElimination(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-12) return null; // Singular matrix

    // Eliminate column
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let k = col; k <= n; k++) {
        aug[row][k] -= factor * aug[col][k];
      }
    }
  }

  // Back substitution
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n] / aug[i][i];
    for (let k = i - 1; k >= 0; k--) {
      aug[k][n] -= aug[k][i] * x[i];
    }
  }
  return x;
}

// ── MNA Solver ───────────────────────────────────────────────────────────────
export function solveMNA(
  elements: NetlistElement[],
  nodeCount: number,
  nodeLabels: Record<number, string>
): SimulationResult {

  // Separate voltage sources and Op-Amps (need extra rows/cols)
  const voltageSources = elements.filter(e => e.type === 'VS');
  const opAmps = elements.filter(e => e.type === 'OpAmp');

  // Total unknowns: (nodeCount - 1) node voltages + nVS branch currents + nOpAmp output currents
  const nNodes = nodeCount - 1; // excluding ground (node 0)
  const nExtra = voltageSources.length + opAmps.length;
  const size = nNodes + nExtra;

  if (size === 0) {
    return { success: false, error: 'No hay nodos para simular.', nodeVoltages: {}, branchCurrents: {}, nodeLabels };
  }

  // Initialize MNA matrix and RHS vector
  const G: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
  const I: number[] = new Array(size).fill(0);

  // Map node id (1-based) to matrix index (0-based), node 0 (gnd) is reference
  const nodeIdx = (n: number) => n - 1;

  // ── Stamp resistors ──────────────────────────────────────────────────────
  for (const el of elements) {
    if (el.type !== 'R') continue;
    const [ni, nj] = el.nodes;
    const g = 1 / el.value;
    if (ni !== 0) { G[nodeIdx(ni)][nodeIdx(ni)] += g; }
    if (nj !== 0) { G[nodeIdx(nj)][nodeIdx(nj)] += g; }
    if (ni !== 0 && nj !== 0) {
      G[nodeIdx(ni)][nodeIdx(nj)] -= g;
      G[nodeIdx(nj)][nodeIdx(ni)] -= g;
    }
  }

  // ── Stamp voltage sources ────────────────────────────────────────────────
  voltageSources.forEach((el, k) => {
    const vsRow = nNodes + k;
    const [np, nm] = el.nodes;
    // B matrix stamps
    if (np !== 0) { G[nodeIdx(np)][vsRow] += 1; G[vsRow][nodeIdx(np)] += 1; }
    if (nm !== 0) { G[nodeIdx(nm)][vsRow] -= 1; G[vsRow][nodeIdx(nm)] -= 1; }
    // RHS: voltage value
    I[vsRow] = el.value;
  });

  // ── Stamp ideal Op-Amps ──────────────────────────────────────────────────
  // Ideal op-amp model: Vout = A*(Vin+ - Vin-), A → ∞
  // Equivalent stamp: extra row enforces V+ - V- = 0 (virtual short)
  // and output node current is the branch variable.
  opAmps.forEach((el, k) => {
    const opRow = nNodes + voltageSources.length + k;
    const [nInP, nInN, nOut] = el.nodes;

    // Output current source stamp (column side)
    if (nOut !== 0) { G[nodeIdx(nOut)][opRow] += 1; G[opRow][nodeIdx(nOut)] += 1; }

    // Virtual short constraint: V_in+ - V_in- = 0  (ideal op-amp)
    // Stamp: 1 at in+, -1 at in-
    if (nInP !== 0) G[opRow][nodeIdx(nInP)] += 1;
    if (nInN !== 0) G[opRow][nodeIdx(nInN)] -= 1;

    I[opRow] = 0;
  });

  // ── Solve ────────────────────────────────────────────────────────────────
  const solution = gaussianElimination(G, I);

  if (!solution) {
    return {
      success: false,
      error: 'No se pudo resolver el sistema. Verifica que el circuito esté completamente conectado y tenga una referencia a tierra.',
      nodeVoltages: {},
      branchCurrents: {},
      nodeLabels,
    };
  }

  // ── Extract results ───────────────────────────────────────────────────────
  const nodeVoltages: Record<number, number> = { 0: 0 }; // Ground = 0V
  for (let i = 0; i < nNodes; i++) {
    nodeVoltages[i + 1] = Math.round(solution[i] * 1e9) / 1e9; // round to 9 decimals
  }

  const branchCurrents: Record<string, number> = {};
  voltageSources.forEach((el, k) => {
    branchCurrents[el.id] = Math.round(solution[nNodes + k] * 1e12) / 1e12;
  });
  opAmps.forEach((el, k) => {
    branchCurrents[el.id] = Math.round(solution[nNodes + voltageSources.length + k] * 1e12) / 1e12;
  });

  return { success: true, nodeVoltages, branchCurrents, nodeLabels };
}
