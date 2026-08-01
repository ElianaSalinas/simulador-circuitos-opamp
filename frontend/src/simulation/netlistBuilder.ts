/**
 * netlistBuilder.ts
 * Converts the Redux circuit state (components + connections) into
 * a flat netlist suitable for the MNA solver.
 *
 * Strategy:
 *   1. Build a Union-Find (disjoint set) over all "pin endpoints".
 *   2. Each connected set of pins becomes one electrical node.
 *   3. Pins connected to a Ground component become node 0.
 *   4. Number remaining nodes 1, 2, …
 *   5. Map each component's pins to their node numbers.
 */

import type { CircuitComponent, Connection } from '../store/circuitSlice';
import { COMPONENT_PINS } from '../store/circuitSlice';
import type { NetlistElement } from './types';

// ── Union-Find ────────────────────────────────────────────────────────────────
class UnionFind {
  private parent: Map<string, string> = new Map();
  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x);
    if (this.parent.get(x) !== x) this.parent.set(x, this.find(this.parent.get(x)!));
    return this.parent.get(x)!;
  }
  union(a: string, b: string) {
    this.parent.set(this.find(a), this.find(b));
  }
}

// Pin key: "componentId::pinId"
const pinKey = (cid: string, pid: string) => `${cid}::${pid}`;

export function buildNetlist(
  components: CircuitComponent[],
  connections: Connection[]
): { elements: NetlistElement[]; nodeCount: number; nodeLabels: Record<number, string> } {

  const uf = new UnionFind();

  // Initialize every pin as its own set
  for (const comp of components) {
    const pins = COMPONENT_PINS[comp.type] ?? [];
    for (const pin of pins) uf.find(pinKey(comp.id, pin.id));
  }

  // Union pins that are connected
  for (const conn of connections) {
    uf.union(
      pinKey(conn.fromComponentId, conn.fromPinId),
      pinKey(conn.toComponentId, conn.toPinId)
    );
  }

  // Identify ground roots (all Ground component pins → node 0)
  const groundRoots = new Set<string>();
  for (const comp of components) {
    if (comp.type === 'Ground') {
      const pins = COMPONENT_PINS['Ground'];
      for (const pin of pins) groundRoots.add(uf.find(pinKey(comp.id, pin.id)));
    }
  }

  // Assign node numbers
  const rootToNode = new Map<string, number>();
  let nodeCounter = 1;
  const nodeLabels: Record<number, string> = { 0: 'GND' };

  const getNode = (cid: string, pid: string): number => {
    const root = uf.find(pinKey(cid, pid));
    if (groundRoots.has(root)) return 0;
    if (!rootToNode.has(root)) {
      rootToNode.set(root, nodeCounter);
      nodeLabels[nodeCounter] = `N${nodeCounter}`;
      nodeCounter++;
    }
    return rootToNode.get(root)!;
  };

  // Build netlist elements
  const elements: NetlistElement[] = [];
  // Map node numbers to their connected component pins for rich labeling
  const nodePinsMap = new Map<number, string[]>();

  for (const comp of components) {
    const label = comp.label || comp.id;
    switch (comp.type) {
      case 'Resistor': {
        const n1 = getNode(comp.id, 'left');
        const n2 = getNode(comp.id, 'right');
        elements.push({ id: comp.id, type: 'R', nodes: [n1, n2], value: comp.value ?? 1000, label: comp.label });
        if (n1 !== 0) (nodePinsMap.get(n1) ?? (nodePinsMap.set(n1, []), nodePinsMap.get(n1)!)).push(label);
        if (n2 !== 0) (nodePinsMap.get(n2) ?? (nodePinsMap.set(n2, []), nodePinsMap.get(n2)!)).push(label);
        break;
      }
      case 'Capacitor': {
        const n1 = getNode(comp.id, 'left');
        const n2 = getNode(comp.id, 'right');
        elements.push({ id: comp.id, type: 'C', nodes: [n1, n2], value: comp.value ?? 1e-6, label: comp.label });
        if (n1 !== 0) (nodePinsMap.get(n1) ?? (nodePinsMap.set(n1, []), nodePinsMap.get(n1)!)).push(label);
        if (n2 !== 0) (nodePinsMap.get(n2) ?? (nodePinsMap.set(n2, []), nodePinsMap.get(n2)!)).push(label);
        break;
      }
      case 'Voltage': {
        const nPos = getNode(comp.id, '+');
        const nNeg = getNode(comp.id, '-');
        elements.push({ 
          id: comp.id, 
          type: 'VS', 
          nodes: [nPos, nNeg], 
          value: comp.value ?? 5, 
          label: comp.label,
          waveform: comp.waveform,
          offset: comp.offset,
          amplitude: comp.amplitude,
          frequency: comp.frequency
        });
        if (nPos !== 0) (nodePinsMap.get(nPos) ?? (nodePinsMap.set(nPos, []), nodePinsMap.get(nPos)!)).push(`${label}(+)`);
        if (nNeg !== 0) (nodePinsMap.get(nNeg) ?? (nodePinsMap.set(nNeg, []), nodePinsMap.get(nNeg)!)).push(`${label}(-)`);
        break;
      }
      case 'OpAmp': {
        const nInP = getNode(comp.id, 'in+');
        const nInN = getNode(comp.id, 'in-');
        const nOut = getNode(comp.id, 'out');
        elements.push({ id: comp.id, type: 'OpAmp', nodes: [nInP, nInN, nOut], value: 1e6, label: comp.label });
        if (nInP !== 0) (nodePinsMap.get(nInP) ?? (nodePinsMap.set(nInP, []), nodePinsMap.get(nInP)!)).push(`${label}.in+`);
        if (nInN !== 0) (nodePinsMap.get(nInN) ?? (nodePinsMap.set(nInN, []), nodePinsMap.get(nInN)!)).push(`${label}.in-`);
        if (nOut !== 0) (nodePinsMap.get(nOut) ?? (nodePinsMap.set(nOut, []), nodePinsMap.get(nOut)!)).push(`${label}.out`);
        break;
      }
      case 'Ground': {
        getNode(comp.id, 'gnd');
        break;
      }
    }
  }

  // Populate formatted labels: N1 (U1.out, R1, R3)
  for (let n = 1; n < nodeCounter; n++) {
    const pins = Array.from(new Set(nodePinsMap.get(n) || []));
    if (pins.length > 0) {
      nodeLabels[n] = `N${n} (${pins.join(', ')})`;
    } else {
      nodeLabels[n] = `N${n}`;
    }
  }

  return { elements, nodeCount: nodeCounter, nodeLabels };
}
