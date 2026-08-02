import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { resetSimulation } from '../store/simulationSlice';

const formatValue = (v: number, isCurrent: boolean): { val: string; unit: string } => {
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
    components.find((c) => c.id === id)?.label ?? id.slice(0, 8);

  const nodeIds = simState.result
    ? Object.keys(simState.result.nodeVoltages).filter((id) => id !== '0')
    : [];

  // Multimeter logic
  const currentVoltage = simState.result?.nodeVoltages[Number(selectedNode)] ?? 0;
  const display = formatValue(currentVoltage, false);

  return (
    <div className="absolute bottom-6 right-6 w-84 bg-slate-950/95 backdrop-blur-xl text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-slate-700/80 overflow-hidden z-20 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              simState.status === 'running'
                ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]'
                : simState.status === 'success'
                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                : 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
            }`}
          />
          <span className="text-xs font-bold tracking-widest uppercase font-mono text-slate-200">
            {simState.status === 'running'
              ? 'SIMULANDO...'
              : simState.status === 'success'
              ? 'ANÁLISIS DC'
              : 'ERROR MNA'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {simState.status === 'success' && (
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('multimeter')}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                  viewMode === 'multimeter' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DMM
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                  viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tabla
              </button>
            </div>
          )}
          <button
            onClick={() => dispatch(resetSimulation())}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Error View */}
      {simState.status === 'error' && (
        <div className="p-4 text-rose-300 text-xs bg-rose-950/40 font-mono">
          <p className="font-bold mb-1 uppercase tracking-wider text-[11px] text-rose-400">⚠ Fallo de Convergencia</p>
          <p>{simState.error}</p>
        </div>
      )}

      {/* Results View */}
      {simState.status === 'success' && simState.result && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === 'multimeter' ? (
            /* MULTIMETER VIEW */
            <div className="p-4 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                  Sonda / Terminal
                </span>
                <select
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs font-mono outline-none focus:border-cyan-500"
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                >
                  {nodeIds.map((id) => (
                    <option key={id} value={id}>
                      {simState.result!.nodeLabels[Number(id)] ?? `Nodo ${id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Digital LCD Display */}
              <div className="w-full bg-[#051a14] border border-emerald-500/30 rounded-xl p-4 shadow-[inset_0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden">
                <div className="flex items-baseline justify-end gap-2 relative z-10">
                  <span
                    className="text-4xl font-mono tracking-tighter text-emerald-400 font-bold"
                    style={{
                      textShadow: '0 0 12px rgba(52, 211, 153, 0.6), 0 0 24px rgba(52, 211, 153, 0.3)',
                    }}
                  >
                    {display.val}
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-500/90">{display.unit}</span>
                </div>

                <div className="mt-2 flex gap-2">
                  <div className="text-[9px] text-emerald-400/80 font-mono font-bold border border-emerald-500/30 bg-emerald-950/50 px-1.5 py-0.5 rounded">
                    DC
                  </div>
                  <div className="text-[9px] text-emerald-400/80 font-mono font-bold border border-emerald-500/30 bg-emerald-950/50 px-1.5 py-0.5 rounded">
                    AUTO
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="p-4 space-y-4 max-h-72 overflow-y-auto font-mono">
              {/* Node Voltages */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
                  Voltajes Nodales (DC)
                </h3>
                <div className="space-y-1">
                  {Object.entries(simState.result.nodeVoltages)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([nodeId, voltage]) => {
                      const label = simState.result!.nodeLabels[Number(nodeId)] ?? `N${nodeId}`;
                      const formatted = formatValue(voltage, false);
                      return (
                        <div
                          key={nodeId}
                          className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors border border-slate-800/60"
                        >
                          <span className="text-xs text-slate-300">{label}</span>
                          <span
                            className={`text-xs font-bold ${
                              Math.abs(voltage) < 1e-9
                                ? 'text-slate-500'
                                : voltage > 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
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
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1 mt-4">
                    Corrientes de Rama (DC)
                  </h3>
                  <div className="space-y-1">
                    {Object.entries(simState.result.branchCurrents).map(([id, current]) => {
                      const formatted = formatValue(current, true);
                      return (
                        <div
                          key={id}
                          className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 transition-colors border border-slate-800/60"
                        >
                          <span className="text-xs text-slate-300 truncate max-w-[120px]">
                            {getComponentLabel(id)}
                          </span>
                          <span className="text-xs font-bold text-cyan-400">
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
