export const predefinedCircuits = [
  {
    id: 'instamp',
    name: '01 - Amplificador de Instrumentación (3 Op-Amps)',
    data: {
      components: [
        { id: 'v1', type: 'Voltage', x: 100, y: 200, rotation: 0, value: 1, label: 'V1', waveform: 'dc' },
        { id: 'v2', type: 'Voltage', x: 100, y: 400, rotation: 0, value: 1.1, label: 'V2', waveform: 'dc' },
        { id: 'gnd1', type: 'Ground', x: 100, y: 500, rotation: 0, label: 'GND1' },
        
        { id: 'op1', type: 'OpAmp', x: 300, y: 200, rotation: 0, label: 'U1' },
        { id: 'op2', type: 'OpAmp', x: 300, y: 400, rotation: 0, label: 'U2' },
        
        { id: 'rg', type: 'Resistor', x: 300, y: 300, rotation: 90, value: 2000, label: 'Rg' },
        { id: 'r1', type: 'Resistor', x: 450, y: 150, rotation: 0, value: 10000, label: 'R1' },
        { id: 'r2', type: 'Resistor', x: 450, y: 450, rotation: 0, value: 10000, label: 'R2' },
        
        { id: 'op3', type: 'OpAmp', x: 700, y: 300, rotation: 0, label: 'U3' },
        { id: 'r3', type: 'Resistor', x: 550, y: 200, rotation: 0, value: 10000, label: 'R3' },
        { id: 'r4', type: 'Resistor', x: 550, y: 400, rotation: 0, value: 10000, label: 'R4' },
        { id: 'r5', type: 'Resistor', x: 700, y: 200, rotation: 0, value: 10000, label: 'Rf' },
        { id: 'r6', type: 'Resistor', x: 700, y: 400, rotation: 90, value: 10000, label: 'Rgnd' },
        { id: 'gnd2', type: 'Ground', x: 700, y: 500, rotation: 0, label: 'GND2' }
      ],
      connections: [
        // Entradas
        { id: 'c1', fromComponentId: 'v1', fromPinId: '+', toComponentId: 'op1', toPinId: 'in+' },
        { id: 'c2', fromComponentId: 'v2', fromPinId: '+', toComponentId: 'op2', toPinId: 'in+' },
        { id: 'c3', fromComponentId: 'v1', fromPinId: '-', toComponentId: 'gnd1', toPinId: 'gnd' },
        { id: 'c4', fromComponentId: 'v2', fromPinId: '-', toComponentId: 'gnd1', toPinId: 'gnd' },
        
        // Primera etapa (Buffers + Gain)
        { id: 'c5', fromComponentId: 'rg', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'c6', fromComponentId: 'rg', fromPinId: 'right', toComponentId: 'op2', toPinId: 'in-' },
        
        { id: 'c7', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r1', toPinId: 'right' },
        { id: 'c8', fromComponentId: 'r1', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        
        { id: 'c9', fromComponentId: 'op2', fromPinId: 'out', toComponentId: 'r2', toPinId: 'right' },
        { id: 'c10', fromComponentId: 'r2', fromPinId: 'left', toComponentId: 'op2', toPinId: 'in-' },
        
        // Segunda etapa (Diferencial)
        { id: 'c11', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r3', toPinId: 'left' },
        { id: 'c12', fromComponentId: 'r3', fromPinId: 'right', toComponentId: 'op3', toPinId: 'in-' },
        
        { id: 'c13', fromComponentId: 'op2', fromPinId: 'out', toComponentId: 'r4', toPinId: 'left' },
        { id: 'c14', fromComponentId: 'r4', fromPinId: 'right', toComponentId: 'op3', toPinId: 'in+' },
        
        { id: 'c15', fromComponentId: 'op3', fromPinId: 'out', toComponentId: 'r5', toPinId: 'right' },
        { id: 'c16', fromComponentId: 'r5', fromPinId: 'left', toComponentId: 'op3', toPinId: 'in-' },
        
        { id: 'c17', fromComponentId: 'r6', fromPinId: 'left', toComponentId: 'op3', toPinId: 'in+' },
        { id: 'c18', fromComponentId: 'r6', fromPinId: 'right', toComponentId: 'gnd2', toPinId: 'gnd' }
      ]
    }
  },
  {
    id: 'wheatstone_instamp',
    name: '02 - Puente Wheatstone + Amp. Instrumentación',
    data: {
      components: [
        // Fuente de excitación 5V
        { id: 'vexc', type: 'Voltage', x: 50, y: 300, rotation: 0, value: 5, label: 'Vexc', waveform: 'dc' },
        { id: 'gnd_exc', type: 'Ground', x: 50, y: 450, rotation: 0, label: 'GND_exc' },
        
        // Puente de Wheatstone
        { id: 'rw1', type: 'Resistor', x: 150, y: 150, rotation: 90, value: 1000, label: 'R1_br' },
        { id: 'rw2', type: 'Resistor', x: 150, y: 350, rotation: 90, value: 1000, label: 'R2_br' },
        { id: 'rw3', type: 'Resistor', x: 250, y: 150, rotation: 90, value: 1000, label: 'R3_br' },
        { id: 'rsense', type: 'Resistor', x: 250, y: 350, rotation: 90, value: 1005, label: 'Rsense' },
        { id: 'gnd_bridge', type: 'Ground', x: 200, y: 480, rotation: 0, label: 'GND_br' },

        // Etapa 1: Op-Amps de entrada (U1, U2)
        { id: 'op1', type: 'OpAmp', x: 400, y: 200, rotation: 0, label: 'U1' },
        { id: 'op2', type: 'OpAmp', x: 400, y: 400, rotation: 0, label: 'U2' },
        { id: 'rg', type: 'Resistor', x: 400, y: 300, rotation: 90, value: 2000, label: 'Rg' },
        { id: 'r1', type: 'Resistor', x: 550, y: 150, rotation: 0, value: 10000, label: 'R1' },
        { id: 'r2', type: 'Resistor', x: 550, y: 450, rotation: 0, value: 10000, label: 'R2' },

        // Etapa 2: Diferencial (U3)
        { id: 'op3', type: 'OpAmp', x: 800, y: 300, rotation: 0, label: 'U3' },
        { id: 'r3', type: 'Resistor', x: 650, y: 200, rotation: 0, value: 10000, label: 'R3' },
        { id: 'r4', type: 'Resistor', x: 650, y: 400, rotation: 0, value: 10000, label: 'R4' },
        { id: 'rf', type: 'Resistor', x: 800, y: 200, rotation: 0, value: 10000, label: 'Rf' },
        { id: 'rgnd', type: 'Resistor', x: 800, y: 400, rotation: 90, value: 10000, label: 'Rgnd' },
        { id: 'gnd_diff', type: 'Ground', x: 800, y: 500, rotation: 0, label: 'GND_diff' }
      ],
      connections: [
        // Excitación a puente
        { id: 'c_exc_gnd', fromComponentId: 'vexc', fromPinId: '-', toComponentId: 'gnd_exc', toPinId: 'gnd' },
        { id: 'c_exc_top1', fromComponentId: 'vexc', fromPinId: '+', toComponentId: 'rw1', toPinId: 'left' },
        { id: 'c_top_bridge', fromComponentId: 'rw1', fromPinId: 'left', toComponentId: 'rw3', toPinId: 'left' },
        
        // Puente a tierra
        { id: 'c_br_gnd1', fromComponentId: 'rw2', fromPinId: 'right', toComponentId: 'gnd_bridge', toPinId: 'gnd' },
        { id: 'c_br_gnd2', fromComponentId: 'rsense', fromPinId: 'right', toComponentId: 'gnd_bridge', toPinId: 'gnd' },

        // Rama izquierda del puente -> U1.in+
        { id: 'c_br_mid1', fromComponentId: 'rw1', fromPinId: 'right', toComponentId: 'rw2', toPinId: 'left' },
        { id: 'c_to_u1', fromComponentId: 'rw1', fromPinId: 'right', toComponentId: 'op1', toPinId: 'in+' },

        // Rama derecha del puente -> U2.in+
        { id: 'c_br_mid2', fromComponentId: 'rw3', fromPinId: 'right', toComponentId: 'rsense', toPinId: 'left' },
        { id: 'c_to_u2', fromComponentId: 'rw3', fromPinId: 'right', toComponentId: 'op2', toPinId: 'in+' },

        // Primera etapa Amp Inst
        { id: 'c_rg1', fromComponentId: 'rg', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'c_rg2', fromComponentId: 'rg', fromPinId: 'right', toComponentId: 'op2', toPinId: 'in-' },
        { id: 'c_r1_out', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r1', toPinId: 'right' },
        { id: 'c_r1_in', fromComponentId: 'r1', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'c_r2_out', fromComponentId: 'op2', fromPinId: 'out', toComponentId: 'r2', toPinId: 'right' },
        { id: 'c_r2_in', fromComponentId: 'r2', fromPinId: 'left', toComponentId: 'op2', toPinId: 'in-' },

        // Segunda etapa Diferencial
        { id: 'c_u1_r3', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r3', toPinId: 'left' },
        { id: 'c_r3_u3', fromComponentId: 'r3', fromPinId: 'right', toComponentId: 'op3', toPinId: 'in-' },
        { id: 'c_u2_r4', fromComponentId: 'op2', fromPinId: 'out', toComponentId: 'r4', toPinId: 'left' },
        { id: 'c_r4_u3', fromComponentId: 'r4', fromPinId: 'right', toComponentId: 'op3', toPinId: 'in+' },
        { id: 'c_rf_out', fromComponentId: 'op3', fromPinId: 'out', toComponentId: 'rf', toPinId: 'right' },
        { id: 'c_rf_in', fromComponentId: 'rf', fromPinId: 'left', toComponentId: 'op3', toPinId: 'in-' },
        { id: 'c_rgnd_in', fromComponentId: 'rgnd', fromPinId: 'left', toComponentId: 'op3', toPinId: 'in+' },
        { id: 'c_rgnd_gnd', fromComponentId: 'rgnd', fromPinId: 'right', toComponentId: 'gnd_diff', toPinId: 'gnd' }
      ]
    }
  },
  {
    id: 'wien',
    name: '03 - Oscilador Puente de Wien (Onda Senoidal)',
    data: {
      components: [
        { id: 'op1', type: 'OpAmp', x: 500, y: 300, rotation: 0, label: 'U1' },
        { id: 'r1', type: 'Resistor', x: 300, y: 200, rotation: 0, value: 10000, label: 'R1' },
        { id: 'c1', type: 'Capacitor', x: 400, y: 200, rotation: 0, value: 1e-7, label: 'C1' },
        { id: 'r2', type: 'Resistor', x: 200, y: 300, rotation: 90, value: 10000, label: 'R2' },
        { id: 'c2', type: 'Capacitor', x: 200, y: 400, rotation: 90, value: 1e-7, label: 'C2' },
        
        { id: 'r3', type: 'Resistor', x: 500, y: 450, rotation: 0, value: 21000, label: 'Rf' },
        { id: 'r4', type: 'Resistor', x: 350, y: 450, rotation: 90, value: 10000, label: 'Ri' },
        
        { id: 'gnd', type: 'Ground', x: 200, y: 550, rotation: 0, label: 'GND1' }
      ],
      connections: [
        // Positive feedback (Wien network)
        { id: 'cw1', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'c1', toPinId: 'right' },
        { id: 'cw2', fromComponentId: 'c1', fromPinId: 'left', toComponentId: 'r1', toPinId: 'right' },
        { id: 'cw3', fromComponentId: 'r1', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in+' },
        { id: 'cw4', fromComponentId: 'r2', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in+' },
        { id: 'cw5', fromComponentId: 'r2', fromPinId: 'right', toComponentId: 'c2', toPinId: 'left' },
        { id: 'cw6', fromComponentId: 'c2', fromPinId: 'right', toComponentId: 'gnd', toPinId: 'gnd' },
        
        // Negative feedback (Gain > 3 for oscillation)
        { id: 'cn1', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r3', toPinId: 'right' },
        { id: 'cn2', fromComponentId: 'r3', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'cn3', fromComponentId: 'r4', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'cn4', fromComponentId: 'r4', fromPinId: 'right', toComponentId: 'gnd', toPinId: 'gnd' }
      ]
    }
  },
  {
    id: 'astable',
    name: '04 - Multivibrador Astable con Op-Amp (Onda Cuadrada)',
    data: {
      components: [
        { id: 'op1', type: 'OpAmp', x: 400, y: 300, rotation: 0, label: 'U1' },
        { id: 'r1', type: 'Resistor', x: 400, y: 400, rotation: 0, value: 10000, label: 'R1' },
        { id: 'r2', type: 'Resistor', x: 250, y: 400, rotation: 90, value: 10000, label: 'R2' },
        { id: 'r3', type: 'Resistor', x: 400, y: 200, rotation: 0, value: 10000, label: 'R3' },
        { id: 'c1', type: 'Capacitor', x: 250, y: 200, rotation: 90, value: 1e-7, label: 'C1' },
        { id: 'gnd', type: 'Ground', x: 250, y: 500, rotation: 0, label: 'GND1' }
      ],
      connections: [
        { id: 'c1', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r1', toPinId: 'right' },
        { id: 'c2', fromComponentId: 'r1', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in+' },
        { id: 'c3', fromComponentId: 'r2', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in+' },
        { id: 'c4', fromComponentId: 'r2', fromPinId: 'right', toComponentId: 'gnd', toPinId: 'gnd' },
        
        { id: 'c5', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r3', toPinId: 'right' },
        { id: 'c6', fromComponentId: 'r3', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'c7', fromComponentId: 'c1', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        { id: 'c8', fromComponentId: 'c1', fromPinId: 'right', toComponentId: 'gnd', toPinId: 'gnd' }
      ]
    }
  },
  {
    id: 'integrator',
    name: '05 - Integrador (Respuesta a Onda Cuadrada)',
    data: {
      components: [
        { id: 'op1', type: 'OpAmp', x: 500, y: 300, rotation: 0, label: 'U1' },
        { id: 'v1', type: 'Voltage', x: 200, y: 300, rotation: 0, value: 5, label: 'Vin', waveform: 'square', frequency: 100, amplitude: 5 },
        { id: 'r1', type: 'Resistor', x: 350, y: 250, rotation: 0, value: 10000, label: 'Rin' },
        { id: 'c1', type: 'Capacitor', x: 450, y: 150, rotation: 0, value: 1e-6, label: 'Cf' },
        { id: 'r2', type: 'Resistor', x: 450, y: 100, rotation: 0, value: 100000, label: 'Rf' },
        { id: 'gnd1', type: 'Ground', x: 200, y: 400, rotation: 0, label: 'GND1' },
        { id: 'gnd2', type: 'Ground', x: 450, y: 400, rotation: 0, label: 'GND2' }
      ],
      connections: [
        { id: 'c1', fromComponentId: 'v1', fromPinId: '+', toComponentId: 'r1', toPinId: 'left' },
        { id: 'c2', fromComponentId: 'r1', fromPinId: 'right', toComponentId: 'op1', toPinId: 'in-' },
        
        { id: 'c3', fromComponentId: 'v1', fromPinId: '-', toComponentId: 'gnd1', toPinId: 'gnd' },
        { id: 'c4', fromComponentId: 'gnd2', fromPinId: 'gnd', toComponentId: 'op1', toPinId: 'in+' },
        
        { id: 'c5', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'c1', toPinId: 'right' },
        { id: 'c6', fromComponentId: 'c1', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' },
        
        { id: 'c7', fromComponentId: 'op1', fromPinId: 'out', toComponentId: 'r2', toPinId: 'right' },
        { id: 'c8', fromComponentId: 'r2', fromPinId: 'left', toComponentId: 'op1', toPinId: 'in-' }
      ]
    }
  }
];
