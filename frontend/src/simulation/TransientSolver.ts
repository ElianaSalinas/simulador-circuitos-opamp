/**
 * TransientSolver.ts
 * Análisis transitorio usando MNA + Backward Euler para capacitores.
 *
 * Modelo de capacitor (Companion Model - Backward Euler):
 *   I_C(t+Δt) = C/Δt * V_C(t+Δt) - C/Δt * V_C(t)
 *
 * Se modela como:
 *   - Resistencia equivalente: R_eq = Δt / C
 *   - Fuente de corriente:     I_eq = C/Δt * V_C(t)  (inyectada al nodo +)
 *
 * En cada paso de tiempo se resuelve la matriz MNA modificada.
 */

import { gaussianElimination } from './MNASolver';
import type { NetlistElement } from './types';

export interface WaveformData {
  timePoints: number[];           // [t0, t1, ..., tN]
  nodeWaveforms: Record<number, number[]>; // nodeId → voltage array
  nodeLabels: Record<number, string>;
}

export interface TransientParams {
  tStart: number;     // segundos
  tEnd: number;       // segundos
  tStep: number;      // segundos (paso de integración)
}

/**
 * Resuelve el circuito en el dominio del tiempo.
 * Devuelve waveforms para cada nodo.
 */
export function solveTransient(
  elements: NetlistElement[],
  nodeCount: number,
  nodeLabels: Record<number, string>,
  params: TransientParams
): { success: boolean; data?: WaveformData; error?: string } {

  const { tStart, tEnd, tStep } = params;
  if (tEnd <= tStart || tStep <= 0) {
    return { success: false, error: 'Parámetros de tiempo inválidos.' };
  }

  const steps = Math.min(Math.floor((tEnd - tStart) / tStep), 2000); // max 2000 puntos
  const dt = (tEnd - tStart) / steps;

  const nNodes = nodeCount - 1; // excluir GND
  const voltageSources = elements.filter(e => e.type === 'VS');
  const opAmps = elements.filter(e => e.type === 'OpAmp');
  const capacitors = elements.filter(e => e.type === 'C');

  // Estado inicial de capacitores (voltaje = 0)
  const capVoltages: Record<string, number> = {};
  capacitors.forEach(c => { capVoltages[c.id] = 0; });

  // Resultados
  const timePoints: number[] = [];
  const nodeWaveforms: Record<number, number[]> = {};
  for (let n = 0; n < nodeCount; n++) nodeWaveforms[n] = [];

  const nodeIdx = (n: number) => n - 1;

  // ── Función interna: armar y resolver matriz MNA para un instante ───────
  const solveStep = (capState: Record<string, number>): number[] | null => {
    const nExtra = voltageSources.length + opAmps.length;
    const size = nNodes + nExtra;
    if (size === 0) return null;

    const G: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
    const I: number[] = new Array(size).fill(0);

    // Resistores
    for (const el of elements) {
      if (el.type !== 'R') continue;
      const [a, b] = el.nodes;
      const g = 1 / el.value;
      if (a !== 0) G[nodeIdx(a)][nodeIdx(a)] += g;
      if (b !== 0) G[nodeIdx(b)][nodeIdx(b)] += g;
      if (a !== 0 && b !== 0) {
        G[nodeIdx(a)][nodeIdx(b)] -= g;
        G[nodeIdx(b)][nodeIdx(a)] -= g;
      }
    }

    // Capacitores → Companion model (Backward Euler)
    for (const el of capacitors) {
      const [a, b] = el.nodes;
      const geq = el.value / dt;     // C/Δt
      const ieq = geq * capState[el.id]; // corriente equivalente
      // Resistencia equivalente
      if (a !== 0) G[nodeIdx(a)][nodeIdx(a)] += geq;
      if (b !== 0) G[nodeIdx(b)][nodeIdx(b)] += geq;
      if (a !== 0 && b !== 0) {
        G[nodeIdx(a)][nodeIdx(b)] -= geq;
        G[nodeIdx(b)][nodeIdx(a)] -= geq;
      }
      // Fuente de corriente equivalente
      if (a !== 0) I[nodeIdx(a)] += ieq;
      if (b !== 0) I[nodeIdx(b)] -= ieq;
    }

    // Fuentes de voltaje
    voltageSources.forEach((el, k) => {
      const vsRow = nNodes + k;
      const [np, nm] = el.nodes;
      if (np !== 0) { G[nodeIdx(np)][vsRow] += 1; G[vsRow][nodeIdx(np)] += 1; }
      if (nm !== 0) { G[nodeIdx(nm)][vsRow] -= 1; G[vsRow][nodeIdx(nm)] -= 1; }
      I[vsRow] = el.value;
    });

    // Op-Amps (ideal - virtual short)
    opAmps.forEach((el, k) => {
      const opRow = nNodes + voltageSources.length + k;
      const [nInP, nInN, nOut] = el.nodes;
      if (nOut !== 0) G[nodeIdx(nOut)][opRow] += 1;
      if (nInP !== 0) G[opRow][nodeIdx(nInP)] = 1;
      if (nInN !== 0) G[opRow][nodeIdx(nInN)] = -1;
      I[opRow] = 0;
    });

    return gaussianElimination(G, I);
  };

  // ── Loop temporal ────────────────────────────────────────────────────────
  for (let step = 0; step <= steps; step++) {
    const t = tStart + step * dt;
    timePoints.push(parseFloat(t.toFixed(9)));

    const sol = solveStep(capVoltages);
    if (!sol) {
      return { success: false, error: `No se pudo resolver en t=${t.toExponential(2)}s. Verifica el circuito.` };
    }

    // Registrar voltajes nodales
    nodeWaveforms[0].push(0); // GND siempre = 0
    for (let n = 1; n < nodeCount; n++) {
      nodeWaveforms[n].push(sol[n - 1] ?? 0);
    }

    // Actualizar voltajes de capacitores para el siguiente paso
    for (const cap of capacitors) {
      const [a, b] = cap.nodes;
      const va = a !== 0 ? (sol[nodeIdx(a)] ?? 0) : 0;
      const vb = b !== 0 ? (sol[nodeIdx(b)] ?? 0) : 0;
      capVoltages[cap.id] = va - vb;
    }
  }

  return {
    success: true,
    data: { timePoints, nodeWaveforms, nodeLabels },
  };
}
