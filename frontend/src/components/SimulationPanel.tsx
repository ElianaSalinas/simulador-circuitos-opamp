import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { resetSimulation } from '../store/simulationSlice';

const formatValue = (v: number, isCurrent: boolean): { val: string, unit: string } => {
  const abs = Math.abs(v);
  const baseUnit = isCurrent ? 'A' : 'V';
  
  if (abs < 1e-12) return { val: '0.000', unit: baseUnit };
  
  if (abs >= 1) return { val: v.toFixed(3), unit: baseUnit };
  if (abs >= 1e-3) return { val: (v * 1e3).toFixed(3), unit: `m${baseUnit}` };
  if (abs >= 1e-6) return { val: (v * 1e6).toFixed(3), unit: `µ${baseUnit}` };
  return { val: (v * 1e9).toFixed(3), unit: `n${baseUnit}` };
};

const SimulationPanel: React.FC = () => {
  const dispatch = useDispatch();
  const simState = useSelector((state: RootState) => state.simulation);
  const components = useSelector((state: RootState) => state.circuit.components);
  const [viewMode, setViewMode] = useState<'multimeter' | 'table'>('multimeter');
  
  // Multimeter selection state
  const [selectedNode, setSelectedNode] = useState<string>('1');

  if (simState.status === 'idle') return null;

  const getComponentLabel = (id: string) =>
    components.find(c => c.id === id)?.label ?? id.slice(0, 8);

  const nodeIds = simState.result ? Object.keys(simState.result.nodeVoltages).filter(id => id !== '0') : [];
  
  // Multimeter logic
  const currentVoltage = simState.result?.nodeVoltages[Number(selectedNode)] ?? 0;
  const display = formatValue(currentVoltage, false);

  return (
    <div className="absolute bottom-10 right-4 w-80 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            simState.status === 'running' ? 'bg-yellow-400 animate-pulse' :
            simState.status === 'success' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-sm font-semibold tracking-wider">
            {simState.status === 'running' ? 'SIMULANDO...' :
             simState.status === 'success' ? 'ANÁLISIS DC' : 'ERROR MNA'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {simState.status === 'success' && (
            <select 
              value={viewMode} 
              onChange={e => setViewMode(e.target.value as any)}
              className="bg-gray-700 text-xs border-none rounded px-2 py-1 outline-none cursor-pointer"
            >
              <option value="multimeter">Multímetro</option>
              <option value="table">Tabla</option>
            </select>
          )}
          <button
            onClick={() => dispatch(resetSimulation())}
            className="text-gray-400 hover:text-white text-lg leading-none transition-colors"
          >×</button>
        </div>
      </div>

      {/* Error View */}
      {simState.status === 'error' && (
        <div className="p-4 text-red-400 text-sm bg-red-900/20">
          <p className="font-bold mb-1 uppercase tracking-wider text-xs">⚠ Fallo de Convergencia</p>
          <p className="font-mono">{simState.error}</p>
        </div>
      )}

      {/* Results View */}
      {simState.status === 'success' && simState.result && (
        <div className="flex-1 overflow-hidden flex flex-col">
          
          {viewMode === 'multimeter' ? (
            /* MULTIMETER VIEW */
            <div className="p-5 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-4">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Medición (DC)</span>
                <select 
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm outline-none"
                  value={selectedNode}
                  onChange={e => setSelectedNode(e.target.value)}
                >
                  {nodeIds.map(id => (
                    <option key={id} value={id}>
                      {simState.result!.nodeLabels[Number(id)] ?? `Nodo ${id}`}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* LCD Display */}
              <div className="w-full bg-[#1a2b25] border-2 border-gray-600 rounded-lg p-4 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 to-transparent pointer-events-none"></div>
                <div className="flex items-baseline justify-end gap-2 relative z-10">
                  <span 
                    className="text-5xl font-mono tracking-tighter" 
                    style={{ 
                      color: '#4ade80', 
                      textShadow: '0 0 10px rgba(74, 222, 128, 0.4), 0 0 20px rgba(74, 222, 128, 0.2)',
                      fontFamily: '"Digital-7", "Courier New", monospace'
                    }}
                  >
                    {display.val}
                  </span>
                  <span className="text-2xl font-bold text-green-400/80">{display.unit}</span>
                </div>
                
                <div className="absolute bottom-2 left-3 flex gap-2">
                  <div className="text-[9px] text-green-500/60 uppercase tracking-widest font-bold border border-green-500/30 px-1 rounded">AUTO</div>
                  <div className="text-[9px] text-green-500/60 uppercase tracking-widest font-bold border border-green-500/30 px-1 rounded">DC</div>
                </div>
              </div>
              
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {/* Node Voltages */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-700 pb-1">
                  Voltajes Nodales (DC)
                </h3>
                <div className="space-y-1">
                  {Object.entries(simState.result.nodeVoltages)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([nodeId, voltage]) => {
                      const label = simState.result!.nodeLabels[Number(nodeId)] ?? `N${nodeId}`;
                      const formatted = formatValue(voltage, false);
                      return (
                        <div key={nodeId} className="flex justify-between items-center py-1.5 px-2 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors">
                          <span className="text-xs text-gray-300 font-mono">{label}</span>
                          <span className={`text-sm font-bold font-mono ${
                            Math.abs(voltage) < 1e-9 ? 'text-gray-500' :
                            voltage > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatted.val} {formatted.unit}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Branch Currents */}
              {Object.keys(simState.result.branchCurrents).length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-700 pb-1 mt-4">
                    Corrientes de Rama (DC)
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(simState.result.branchCurrents).map(([id, current]) => {
                      const formatted = formatValue(current, true);
                      return (
                        <div key={id} className="flex justify-between items-center py-1.5 px-2 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors">
                          <span className="text-xs text-gray-300 truncate max-w-[120px]">{getComponentLabel(id)}</span>
                          <span className="text-sm font-bold font-mono text-blue-400">
                            {formatted.val} {formatted.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationPanel;
