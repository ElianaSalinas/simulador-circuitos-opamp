import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { resetSimulation } from '../store/simulationSlice';

const formatVoltage = (v: number): string => {
  if (Math.abs(v) < 1e-9) return '0.000 V';
  if (Math.abs(v) >= 1) return `${v.toFixed(3)} V`;
  if (Math.abs(v) >= 1e-3) return `${(v * 1e3).toFixed(3)} mV`;
  return `${(v * 1e6).toFixed(3)} µV`;
};

const formatCurrent = (i: number): string => {
  if (Math.abs(i) < 1e-12) return '0.000 A';
  if (Math.abs(i) >= 1) return `${i.toFixed(4)} A`;
  if (Math.abs(i) >= 1e-3) return `${(i * 1e3).toFixed(4)} mA`;
  if (Math.abs(i) >= 1e-6) return `${(i * 1e6).toFixed(4)} µA`;
  return `${(i * 1e9).toFixed(4)} nA`;
};

const SimulationPanel: React.FC = () => {
  const dispatch = useDispatch();
  const simState = useSelector((state: RootState) => state.simulation);
  const components = useSelector((state: RootState) => state.circuit.components);

  if (simState.status === 'idle') return null;

  const getComponentLabel = (id: string) =>
    components.find(c => c.id === id)?.label ?? id.slice(0, 8);

  return (
    <div className="absolute bottom-10 right-4 w-80 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            simState.status === 'running' ? 'bg-yellow-400 animate-pulse' :
            simState.status === 'success' ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span className="text-sm font-semibold">
            {simState.status === 'running' ? 'Simulando...' :
             simState.status === 'success' ? 'Resultados DC' : 'Error de Simulación'}
          </span>
        </div>
        <button
          onClick={() => dispatch(resetSimulation())}
          className="text-gray-400 hover:text-white text-lg leading-none"
        >×</button>
      </div>

      {/* Error */}
      {simState.status === 'error' && (
        <div className="p-4 text-red-400 text-sm">
          <p className="font-medium mb-1">⚠ No se pudo simular:</p>
          <p>{simState.error}</p>
        </div>
      )}

      {/* Results */}
      {simState.status === 'success' && simState.result && (
        <div className="p-4 space-y-4 max-h-80 overflow-y-auto">

          {/* Node Voltages */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Voltajes Nodales
            </h3>
            <div className="space-y-1">
              {Object.entries(simState.result.nodeVoltages)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([nodeId, voltage]) => {
                  const label = simState.result!.nodeLabels[Number(nodeId)] ?? `N${nodeId}`;
                  return (
                    <div key={nodeId} className="flex justify-between items-center py-1 px-2 rounded bg-gray-800">
                      <span className="text-xs text-gray-300 font-mono">{label}</span>
                      <span className={`text-sm font-bold font-mono ${
                        Math.abs(voltage) < 1e-9 ? 'text-gray-500' :
                        voltage > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatVoltage(voltage)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Branch Currents */}
          {Object.keys(simState.result.branchCurrents).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Corrientes de Rama
              </h3>
              <div className="space-y-1">
                {Object.entries(simState.result.branchCurrents).map(([id, current]) => (
                  <div key={id} className="flex justify-between items-center py-1 px-2 rounded bg-gray-800">
                    <span className="text-xs text-gray-300">{getComponentLabel(id)}</span>
                    <span className="text-sm font-bold font-mono text-blue-400">
                      {formatCurrent(current)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gains (if OpAmp present) */}
          {simState.result && Object.keys(simState.result.branchCurrents).length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                ✓ Simulación DC completada con Análisis Nodal Modificado (MNA)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationPanel;
