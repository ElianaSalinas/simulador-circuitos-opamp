export const predefinedCircuits = [
  {
    id: 'astable',
    name: 'Multivibrador Astable (Onda Cuadrada)',
    data: {
      components: [
        { id: 'op1', type: 'OpAmp', x: 400, y: 300, rotation: 0, label: 'U1' },
        { id: 'r1', type: 'Resistor', x: 400, y: 400, rotation: 0, value: 10000, label: 'R1 (10k)' },
        { id: 'r2', type: 'Resistor', x: 250, y: 400, rotation: 90, value: 10000, label: 'R2 (10k)' },
        { id: 'r3', type: 'Resistor', x: 400, y: 200, rotation: 0, value: 10000, label: 'R3 (10k)' },
        { id: 'c1', type: 'Capacitor', x: 250, y: 200, rotation: 90, value: 1e-7, label: 'C1 (100nF)' },
        { id: 'gnd', type: 'Ground', x: 250, y: 500, rotation: 0, label: 'GND' },
        { id: 'osc', type: 'Oscilloscope', x: 600, y: 300, rotation: 0, label: 'Osciloscopio' }
      ],
      connections: [
        { id: 'c_r1_out', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'r1', toTerminal: 'right' },
        { id: 'c_r1_p', fromComponent: 'r1', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inP' },
        { id: 'c_r2_p', fromComponent: 'r2', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inP' },
        { id: 'c_r2_gnd', fromComponent: 'r2', fromTerminal: 'right', toComponent: 'gnd', toTerminal: 'top' },
        
        { id: 'c_r3_out', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'r3', toTerminal: 'right' },
        { id: 'c_r3_n', fromComponent: 'r3', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        { id: 'c_c1_n', fromComponent: 'c1', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        { id: 'c_c1_gnd', fromComponent: 'c1', fromTerminal: 'right', toComponent: 'gnd', toTerminal: 'top' },

        { id: 'c_osc', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'osc', toTerminal: 'ch1' }
      ]
    }
  },
  {
    id: 'wien',
    name: 'Oscilador Puente de Wien (Onda Senoidal)',
    data: {
      components: [
        { id: 'op1', type: 'OpAmp', x: 500, y: 300, rotation: 0, label: 'U1' },
        { id: 'r1', type: 'Resistor', x: 300, y: 200, rotation: 0, value: 10000, label: 'R (10k)' },
        { id: 'c1', type: 'Capacitor', x: 400, y: 200, rotation: 0, value: 1e-7, label: 'C (100nF)' },
        { id: 'r2', type: 'Resistor', x: 200, y: 300, rotation: 90, value: 10000, label: 'R (10k)' },
        { id: 'c2', type: 'Capacitor', x: 200, y: 400, rotation: 90, value: 1e-7, label: 'C (100nF)' },
        
        { id: 'r3', type: 'Resistor', x: 500, y: 450, rotation: 0, value: 21000, label: 'Rf (21k)' },
        { id: 'r4', type: 'Resistor', x: 350, y: 450, rotation: 90, value: 10000, label: 'Ri (10k)' },
        
        { id: 'gnd', type: 'Ground', x: 200, y: 550, rotation: 0, label: 'GND' },
        { id: 'osc', type: 'Oscilloscope', x: 700, y: 300, rotation: 0, label: 'Osciloscopio' }
      ],
      connections: [
        // Positive feedback (Wien network)
        { id: 'cw1', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'c1', toTerminal: 'right' },
        { id: 'cw2', fromComponent: 'c1', fromTerminal: 'left', toComponent: 'r1', toTerminal: 'right' },
        { id: 'cw3', fromComponent: 'r1', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inP' },
        { id: 'cw4', fromComponent: 'r2', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inP' },
        { id: 'cw5', fromComponent: 'r2', fromTerminal: 'right', toComponent: 'c2', toTerminal: 'left' },
        { id: 'cw6', fromComponent: 'c2', fromTerminal: 'right', toComponent: 'gnd', toTerminal: 'top' },
        
        // Negative feedback (Gain > 3 for oscillation)
        { id: 'cn1', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'r3', toTerminal: 'right' },
        { id: 'cn2', fromComponent: 'r3', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        { id: 'cn3', fromComponent: 'r4', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        { id: 'cn4', fromComponent: 'r4', fromTerminal: 'right', toComponent: 'gnd', toTerminal: 'top' },

        { id: 'c_osc', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'osc', toTerminal: 'ch1' }
      ]
    }
  },
  {
    id: 'instamp',
    name: 'Amplificador de Instrumentación (3 Op-Amps)',
    data: {
      components: [
        { id: 'v1', type: 'VoltageSource', x: 100, y: 200, rotation: 0, value: 1, label: 'V1 (1V)', properties: { waveform: 'dc' } },
        { id: 'v2', type: 'VoltageSource', x: 100, y: 400, rotation: 0, value: 1.1, label: 'V2 (1.1V)', properties: { waveform: 'dc' } },
        { id: 'gnd1', type: 'Ground', x: 100, y: 500, rotation: 0, label: 'GND' },
        
        { id: 'op1', type: 'OpAmp', x: 300, y: 200, rotation: 0, label: 'U1' },
        { id: 'op2', type: 'OpAmp', x: 300, y: 400, rotation: 0, label: 'U2' },
        
        { id: 'rg', type: 'Resistor', x: 300, y: 300, rotation: 90, value: 2000, label: 'Rg (2k)' },
        { id: 'r1', type: 'Resistor', x: 450, y: 150, rotation: 0, value: 10000, label: 'R1 (10k)' },
        { id: 'r2', type: 'Resistor', x: 450, y: 450, rotation: 0, value: 10000, label: 'R2 (10k)' },
        
        { id: 'op3', type: 'OpAmp', x: 700, y: 300, rotation: 0, label: 'U3' },
        { id: 'r3', type: 'Resistor', x: 550, y: 200, rotation: 0, value: 10000, label: 'R3 (10k)' },
        { id: 'r4', type: 'Resistor', x: 550, y: 400, rotation: 0, value: 10000, label: 'R4 (10k)' },
        { id: 'r5', type: 'Resistor', x: 700, y: 200, rotation: 0, value: 10000, label: 'Rf (10k)' },
        { id: 'r6', type: 'Resistor', x: 700, y: 400, rotation: 90, value: 10000, label: 'Rgnd (10k)' },
        { id: 'gnd2', type: 'Ground', x: 700, y: 500, rotation: 0, label: 'GND' },
        
        { id: 'mm', type: 'Multimeter', x: 850, y: 300, rotation: 0, label: 'Vout' }
      ],
      connections: [
        // Entradas
        { id: 'c1', fromComponent: 'v1', fromTerminal: 'pos', toComponent: 'op1', toTerminal: 'inP' },
        { id: 'c2', fromComponent: 'v2', fromTerminal: 'pos', toComponent: 'op2', toTerminal: 'inP' },
        { id: 'c3', fromComponent: 'v1', fromTerminal: 'neg', toComponent: 'gnd1', toTerminal: 'top' },
        { id: 'c4', fromComponent: 'v2', fromTerminal: 'neg', toComponent: 'gnd1', toTerminal: 'top' },
        
        // Primera etapa (Buffers + Gain)
        { id: 'c5', fromComponent: 'rg', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        { id: 'c6', fromComponent: 'rg', fromTerminal: 'right', toComponent: 'op2', toTerminal: 'inN' },
        
        { id: 'c7', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'r1', toTerminal: 'right' },
        { id: 'c8', fromComponent: 'r1', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        
        { id: 'c9', fromComponent: 'op2', fromTerminal: 'out', toComponent: 'r2', toTerminal: 'right' },
        { id: 'c10', fromComponent: 'r2', fromTerminal: 'left', toComponent: 'op2', toTerminal: 'inN' },
        
        // Segunda etapa (Diferencial)
        { id: 'c11', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'r3', toTerminal: 'left' },
        { id: 'c12', fromComponent: 'r3', fromTerminal: 'right', toComponent: 'op3', toTerminal: 'inN' },
        
        { id: 'c13', fromComponent: 'op2', fromTerminal: 'out', toComponent: 'r4', toTerminal: 'left' },
        { id: 'c14', fromComponent: 'r4', fromTerminal: 'right', toComponent: 'op3', toTerminal: 'inP' },
        
        { id: 'c15', fromComponent: 'op3', fromTerminal: 'out', toComponent: 'r5', toTerminal: 'right' },
        { id: 'c16', fromComponent: 'r5', fromTerminal: 'left', toComponent: 'op3', toTerminal: 'inN' },
        
        { id: 'c17', fromComponent: 'r6', fromTerminal: 'left', toComponent: 'op3', toTerminal: 'inP' },
        { id: 'c18', fromComponent: 'r6', fromTerminal: 'right', toComponent: 'gnd2', toTerminal: 'top' },
        
        // Multímetro
        { id: 'c19', fromComponent: 'op3', fromTerminal: 'out', toComponent: 'mm', toTerminal: 'pos' },
        { id: 'c20', fromComponent: 'mm', fromTerminal: 'neg', toComponent: 'gnd2', toTerminal: 'top' }
      ]
    }
  },
  {
    id: 'integrator',
    name: 'Integrador (Respuesta a Cuadrada)',
    data: {
      components: [
        { id: 'op1', type: 'OpAmp', x: 500, y: 300, rotation: 0, label: 'U1' },
        { id: 'v1', type: 'VoltageSource', x: 200, y: 300, rotation: 0, value: 5, label: 'Vin', properties: { waveform: 'square', frequency: 100, amplitude: 5 } },
        { id: 'r1', type: 'Resistor', x: 350, y: 250, rotation: 0, value: 10000, label: 'Rin (10k)' },
        { id: 'c1', type: 'Capacitor', x: 450, y: 150, rotation: 0, value: 1e-6, label: 'Cf (1uF)' },
        { id: 'r2', type: 'Resistor', x: 450, y: 100, rotation: 0, value: 100000, label: 'Rf (100k)' },
        { id: 'gnd1', type: 'Ground', x: 200, y: 400, rotation: 0, label: 'GND' },
        { id: 'gnd2', type: 'Ground', x: 450, y: 400, rotation: 0, label: 'GND' },
        { id: 'osc', type: 'Oscilloscope', x: 700, y: 300, rotation: 0, label: 'Osciloscopio' }
      ],
      connections: [
        { id: 'c1', fromComponent: 'v1', fromTerminal: 'pos', toComponent: 'r1', toTerminal: 'left' },
        { id: 'c2', fromComponent: 'r1', fromTerminal: 'right', toComponent: 'op1', toTerminal: 'inN' },
        
        { id: 'c3', fromComponent: 'v1', fromTerminal: 'neg', toComponent: 'gnd1', toTerminal: 'top' },
        { id: 'c4', fromComponent: 'gnd2', fromTerminal: 'top', toComponent: 'op1', toTerminal: 'inP' },
        
        { id: 'c5', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'c1', toTerminal: 'right' },
        { id: 'c6', fromComponent: 'c1', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        
        { id: 'c7', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'r2', toTerminal: 'right' },
        { id: 'c8', fromComponent: 'r2', fromTerminal: 'left', toComponent: 'op1', toTerminal: 'inN' },
        
        { id: 'c9', fromComponent: 'op1', fromTerminal: 'out', toComponent: 'osc', toTerminal: 'ch1' },
        { id: 'c10', fromComponent: 'v1', fromTerminal: 'pos', toComponent: 'osc', toTerminal: 'ch2' }
      ]
    }
  }
];
