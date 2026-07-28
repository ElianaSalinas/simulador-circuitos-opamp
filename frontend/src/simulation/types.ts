// Simulation types shared across the simulation module

export interface NetlistNode {
  id: number;         // 0 = ground
  label: string;      // "N1", "N2", "GND"
  componentIds: string[]; // components touching this node
}

export interface NetlistElement {
  id: string;
  type: 'R' | 'C' | 'VS' | 'CS' | 'OpAmp' | 'GND';
  nodes: number[];    // [n+, n-] or [n+, n-, nout] for OpAmp
  value: number;      // Resistance in Ω, Voltage in V, etc.
  label: string;
  // AC / Dynamic properties
  waveform?: 'dc' | 'sine' | 'square' | 'triangle';
  offset?: number;
  amplitude?: number;
  frequency?: number;
}

export interface SimulationResult {
  success: boolean;
  error?: string;
  nodeVoltages: Record<number, number>;   // node_id → voltage
  branchCurrents: Record<string, number>; // element_id → current
  nodeLabels: Record<number, string>;     // node_id → label
}

export interface SimulationParams {
  type: 'DC' | 'AC' | 'TRANSIENT';
}
