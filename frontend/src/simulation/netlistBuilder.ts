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

  for (const comp of components) {
    switch (comp.type) {
      case 'Resistor': {
        const n1 = getNode(comp.id, 'left');
        const n2 = getNode(comp.id, 'right');
        elements.push({ id: comp.id, type: 'R', nodes: [n1, n2], value: comp.value ?? 1000, label: comp.label });
        break;
      }
      case 'Capacitor': {
        const n1 = getNode(comp.id, 'left');
        const n2 = getNode(comp.id, 'right');
        elements.push({ id: comp.id, type: 'C', nodes: [n1, n2], value: comp.value ?? 1e-6, label: comp.label });
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
        break;
      }
      case 'OpAmp': {
        const nInP = getNode(comp.id, 'in+');
        const nInN = getNode(comp.id, 'in-');
        const nOut = getNode(comp.id, 'out');
        const nVcc = getNode(comp.id, 'vcc');
        const nVee = getNode(comp.id, 'vee');
        // Ideal Op-Amp: modeled as VCVS Vout = A*(Vin+ - Vin-)
        // Supply rails just get numbered but are not stamped in DC ideal model
        void nVcc; void nVee;
        elements.push({ id: comp.id, type: 'OpAmp', nodes: [nInP, nInN, nOut], value: 1e6, label: comp.label });
        break;
      }
      case 'Ground': {
        // Already handled by node 0 assignment
        getNode(comp.id, 'gnd');
        break;
      }
    }
  }

  return { elements, nodeCount: nodeCounter, nodeLabels };
}
