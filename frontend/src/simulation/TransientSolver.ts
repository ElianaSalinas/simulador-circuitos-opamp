/**
 * TransientSolver.ts
 * Análisis transitorio usando MNA + Integración Trapezoidal para capacitores.
 *
 * Modelo de capacitor (Companion Model - Trapezoidal Integration):
 *   i_C(n) = (2C/Δt) * v_C(n) - [ (2C/Δt) * v_C(n-1) + i_C(n-1) ]
 *
 * Se modela como:
 *   - Conductancia equivalente: G_eq = 2C / Δt
 *   - Fuente de corriente:      I_eq = G_eq * v_C(n-1) + i_C(n-1)
 *
 * La regla trapezoidal conserva la energía armónica (|A_num| = 1.0) sin disipación
 * artificial, garantizando oscilaciones senoidales y cuadradas puras y estables.
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

  // Estado de capacitores (voltajes y corrientes históricas)
  const capVoltages: Record<string, number> = {};
  const capCurrents: Record<string, number> = {};

  // Para circuitos autónomos (osciladores sin fuentes independientes), inyectar perturbación inicial
  const isAutonomous = voltageSources.length === 0 && capacitors.length > 0;
  capacitors.forEach((c, idx) => {
    capVoltages[c.id] = isAutonomous && idx === 0 ? 0.5 : 0;
    capCurrents[c.id] = 0;
  });

  // Resultados
  const timePoints: number[] = [];
  const nodeWaveforms: Record<number, number[]> = {};
  for (let n = 0; n < nodeCount; n++) nodeWaveforms[n] = [];

  const nodeIdx = (n: number) => n - 1;

  // ── Función interna: armar y resolver matriz MNA para un instante ───────
  const currentOpAmpStates: Record<string, 'LINEAR'|'SAT_HIGH'|'SAT_LOW'> = {};
  opAmps.forEach(el => { currentOpAmpStates[el.id] = 'LINEAR'; });

  const solveStep = (
    cVolt: Record<string, number>,
    cCurr: Record<string, number>,
    t: number
  ): number[] | null => {
    const nExtra = voltageSources.length + opAmps.length;
    const size = nNodes + nExtra;
    if (size === 0) return null;

    let solution: number[] | null = null;
    const GMIN = 1e-12;
    const VSAT = 14.5;

    for (let iter = 0; iter < 12; iter++) {
      const G: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
      const I: number[] = new Array(size).fill(0);

      // Inyectar GMIN a tierra para todos los nodos para evitar singularidad en nodos flotantes
      for (let r = 0; r < nNodes; r++) {
        G[r][r] = GMIN;
      }

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

      // Capacitores → Companion model (Integración Trapezoidal)
      for (const el of capacitors) {
        const [a, b] = el.nodes;
        const geq = (2 * el.value) / dt; // 2C/Δt
        const ieq = geq * (cVolt[el.id] ?? 0) + (cCurr[el.id] ?? 0); // corriente equivalente

        if (a !== 0) G[nodeIdx(a)][nodeIdx(a)] += geq;
        if (b !== 0) G[nodeIdx(b)][nodeIdx(b)] += geq;
        if (a !== 0 && b !== 0) {
          G[nodeIdx(a)][nodeIdx(b)] -= geq;
          G[nodeIdx(b)][nodeIdx(a)] -= geq;
        }
        // Inyección de corriente equivalente
        if (a !== 0) I[nodeIdx(a)] += ieq;
        if (b !== 0) I[nodeIdx(b)] -= ieq;
      }

      // Fuentes de voltaje
      voltageSources.forEach((el, k) => {
        const vsRow = nNodes + k;
        const [np, nm] = el.nodes;
        if (np !== 0) { G[nodeIdx(np)][vsRow] += 1; G[vsRow][nodeIdx(np)] += 1; }
        if (nm !== 0) { G[nodeIdx(nm)][vsRow] -= 1; G[vsRow][nodeIdx(nm)] -= 1; }
        
        // Calcular valor de la fuente en el tiempo t
        let v = el.value;
        if (el.waveform === 'sine') {
          v = (el.offset || 0) + (el.amplitude || 5) * Math.sin(2 * Math.PI * (el.frequency || 1000) * t);
        } else if (el.waveform === 'square') {
          v = (el.offset || 0) + (el.amplitude || 5) * Math.sign(Math.sin(2 * Math.PI * (el.frequency || 1000) * t));
        } else if (el.waveform === 'triangle') {
          const f = el.frequency || 1000;
          const p = 1 / f;
          const phase = t % p;
          const norm = phase / p;
          let tri = 0;
          if (norm < 0.25) tri = norm * 4;
          else if (norm < 0.75) tri = 1 - (norm - 0.25) * 4;
          else tri = -1 + (norm - 0.75) * 4;
          v = (el.offset || 0) + (el.amplitude || 5) * tri;
        }
        
        I[vsRow] = v;
      });

      // Op-Amps (PWL model con saturación simétrica)
      opAmps.forEach((el, k) => {
        const opRow = nNodes + voltageSources.length + k;
        const [nInP, nInN, nOut] = el.nodes;
        const state = currentOpAmpStates[el.id];

        if (nOut !== 0) G[nodeIdx(nOut)][opRow] += 1;

        if (state === 'LINEAR') {
          // Vout = A*(Vp - Vn)
          if (nOut !== 0) G[opRow][nodeIdx(nOut)] = 1; else G[opRow][opRow] = 1;
          if (nInP !== 0) G[opRow][nodeIdx(nInP)] = -1e5;
          if (nInN !== 0) G[opRow][nodeIdx(nInN)] = 1e5;
          I[opRow] = 0;
        } else if (state === 'SAT_HIGH') {
          if (nOut !== 0) G[opRow][nodeIdx(nOut)] = 1; else G[opRow][opRow] = 1;
          I[opRow] = VSAT; // +Vsat
        } else if (state === 'SAT_LOW') {
          if (nOut !== 0) G[opRow][nodeIdx(nOut)] = 1; else G[opRow][opRow] = 1;
          I[opRow] = -VSAT; // -Vsat
        }
      });

      solution = gaussianElimination(G, I);
      if (!solution) break; // Singular

      // Transición de estados por voltaje diferencial
      let changed = false;
      for (let k = 0; k < opAmps.length; k++) {
        const el = opAmps[k];
        const state = currentOpAmpStates[el.id];
        const [nInP, nInN] = el.nodes;
        
        const vP = nInP === 0 ? 0 : solution[nodeIdx(nInP)];
        const vN = nInN === 0 ? 0 : solution[nodeIdx(nInN)];
        const linearOut = 1e5 * (vP - vN);

        let nextState: 'LINEAR' | 'SAT_HIGH' | 'SAT_LOW';
        if (linearOut >= VSAT) {
          nextState = 'SAT_HIGH';
        } else if (linearOut <= -VSAT) {
          nextState = 'SAT_LOW';
        } else {
          nextState = 'LINEAR';
        }

        if (nextState !== state) {
          currentOpAmpStates[el.id] = nextState;
          changed = true;
        }
      }

      if (!changed) break; // Converged
    }

    return solution;
  };

  // ── Loop temporal ────────────────────────────────────────────────────────
  for (let step = 0; step <= steps; step++) {
    const t = tStart + step * dt;
    timePoints.push(parseFloat(t.toFixed(9)));

    const sol = solveStep(capVoltages, capCurrents, t);
    if (!sol) {
      return { success: false, error: `No se pudo resolver en t=${t.toExponential(2)}s. Verifica el circuito.` };
    }

    // Registrar voltajes nodales
    nodeWaveforms[0].push(0); // GND siempre = 0
    for (let n = 1; n < nodeCount; n++) {
      nodeWaveforms[n].push(sol[n - 1] ?? 0);
    }

    // Actualizar estados y corrientes de capacitores (Trapezoidal companion update)
    for (const cap of capacitors) {
      const [a, b] = cap.nodes;
      const va = a !== 0 ? (sol[nodeIdx(a)] ?? 0) : 0;
      const vb = b !== 0 ? (sol[nodeIdx(b)] ?? 0) : 0;
      const vNew = va - vb;
      const vOld = capVoltages[cap.id] ?? 0;
      const iOld = capCurrents[cap.id] ?? 0;

      const geq = (2 * cap.value) / dt;
      const iNew = geq * (vNew - vOld) - iOld;

      capVoltages[cap.id] = vNew;
      capCurrents[cap.id] = iNew;
    }
  }

  return {
    success: true,
    data: { timePoints, nodeWaveforms, nodeLabels },
  };
}
