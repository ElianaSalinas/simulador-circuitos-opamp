import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './store'
import {
  removeComponent, selectComponent, cancelConnection,
  setValidationErrors, clearValidationErrors,
} from './store/circuitSlice'
import {
  startSimulation, simulationSuccess, simulationError,
  resetSimulation, transientSuccess, toggleOscilloscope,
} from './store/simulationSlice'
import { validateCircuit } from './store/circuitUtils'
import { buildNetlist } from './simulation/netlistBuilder'
import { solveMNA } from './simulation/MNASolver'
import { solveTransient } from './simulation/TransientSolver'
import ComponentPalette from './components/ComponentPalette'
import CircuitCanvas from './components/CircuitCanvas'
import PropertyPanel from './components/PropertyPanel'
import SimulationPanel from './components/SimulationPanel'
import Oscilloscope from './components/Oscilloscope'
import AuthModal from './components/AuthModal'
import CircuitManagerModal from './components/CircuitManagerModal'
import { logout } from './store/authSlice'
import { setCircuitMetadata, clearCircuit, loadCircuitData } from './store/circuitSlice'
import { api } from './api'
import Toast, { showToast } from './components/Toast'
import { predefinedCircuits } from './library/circuits'

// ── Transient time presets ──────────────────────────────────────────────────
const TIME_PRESETS = [
  { label: '1 ms', tEnd: 1e-3, tStep: 1e-6 },
  { label: '10 ms', tEnd: 10e-3, tStep: 10e-6 },
  { label: '20 ms', tEnd: 20e-3, tStep: 10e-6 },
  { label: '50 ms', tEnd: 50e-3, tStep: 25e-6 },
  { label: '100 ms', tEnd: 100e-3, tStep: 50e-6 },
  { label: '1 s', tEnd: 1, tStep: 500e-6 },
];

const App: React.FC = () => {
  const dispatch = useDispatch()
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId)
  const components = useSelector((state: RootState) => state.circuit.components)
  const connections = useSelector((state: RootState) => state.circuit.connections)
  const validationErrors = useSelector((state: RootState) => state.circuit.validationErrors)
  const simStatus = useSelector((state: RootState) => state.simulation.status)
  const oscilloscopeVisible = useSelector((state: RootState) => state.simulation.oscilloscopeVisible)
  const waveformData = useSelector((state: RootState) => state.simulation.waveformData)
  const auth = useSelector((state: RootState) => state.auth)
  const circuitId = useSelector((state: RootState) => state.circuit.circuitId)
  const circuitName = useSelector((state: RootState) => state.circuit.circuitName)

  const [selectedPreset, setSelectedPreset] = useState(2) // 20ms default
  const [activeTab, setActiveTab] = useState<'dc' | 'transient'>('dc')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCircuitManager, setShowCircuitManager] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') return
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      dispatch(removeComponent(selectedId))
    }
    if (e.key === 'Escape') {
      dispatch(cancelConnection())
      dispatch(selectComponent(null))
    }
  }, [selectedId, dispatch])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(logout());
      dispatch(clearCircuit());
      showToast('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [dispatch]);

  // ── Auto-validate ───────────────────────────────────────────────────────
  useEffect(() => {
    if (components.length === 0) { dispatch(clearValidationErrors()); return }
    dispatch(setValidationErrors(validateCircuit(components, connections)))
    if (simStatus === 'success') dispatch(resetSimulation())
  }, [components, connections, dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── DC Simulation ───────────────────────────────────────────────────────
  const runDC = () => {
    dispatch(startSimulation())
    try {
      const { elements, nodeCount, nodeLabels } = buildNetlist(components, connections)
      const result = solveMNA(elements, nodeCount, nodeLabels)
      if (result.success) dispatch(simulationSuccess(result))
      else dispatch(simulationError(result.error ?? 'Error en simulación DC'))
    } catch (err: unknown) {
      dispatch(simulationError(err instanceof Error ? err.message : 'Error inesperado'))
    }
  }

  // ── Transient Simulation ────────────────────────────────────────────────
  const runTransient = () => {
    dispatch(startSimulation())
    try {
      const { elements, nodeCount, nodeLabels } = buildNetlist(components, connections)
      const preset = TIME_PRESETS[selectedPreset]
      const result = solveTransient(elements, nodeCount, nodeLabels, {
        tStart: 0,
        tEnd: preset.tEnd,
        tStep: preset.tStep,
      })
      if (result.success && result.data) dispatch(transientSuccess(result.data))
      else dispatch(simulationError(result.error ?? 'Error en análisis transitorio'))
    } catch (err: unknown) {
      dispatch(simulationError(err instanceof Error ? err.message : 'Error inesperado'))
    }
  }

  // ── Save Circuit ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!auth.token) {
      setShowAuthModal(true)
      return
    }
    setIsSaving(true)
    try {
      const dataToSave = { components, connections }
      let savedName = circuitName;
      if (circuitName === 'Circuito sin título') {
        const inputName = prompt('Nombre del circuito:', 'Mi Circuito')
        if (!inputName) { setIsSaving(false); return; }
        savedName = inputName;
      }

      if (circuitId) {
        await api.updateCircuit(circuitId, { name: savedName, data: dataToSave })
        dispatch(setCircuitMetadata({ id: circuitId, name: savedName }))
      } else {
        const result = await api.createCircuit({ name: savedName, data: dataToSave })
        dispatch(setCircuitMetadata({ id: result.id, name: result.name }))
      }
      showToast('Circuito guardado correctamente', 'success')
    } catch (err: any) {
      showToast(err.message || 'Error al guardar', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const hasErrors = validationErrors.length > 0
  const canSimulate = components.length > 0 && !hasErrors

  const handleLoadExample = (circuitId: string) => {
    const example = predefinedCircuits.find(c => c.id === circuitId);
    if (example) {
      dispatch(loadCircuitData(example.data as any));
      dispatch(setCircuitMetadata({ id: '', name: example.name }));
      setShowExamples(false);
      showToast(`Ejemplo cargado: ${example.name}`, 'info');
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ components, connections }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuitName || 'circuito'}.circuit.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.components && data.connections) {
            dispatch(loadCircuitData(data));
            dispatch(setCircuitMetadata({ id: '', name: file.name.replace('.circuit.json', '').replace('.json', '') }));
            showToast('Circuito importado correctamente', 'success');
          } else {
            showToast('El archivo JSON no tiene el formato correcto', 'error');
          }
        } catch (err) {
          showToast('Error al leer el archivo JSON', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
    setShowFileMenu(false);
  };

  const handleExportPNG = () => {
    window.dispatchEvent(new CustomEvent('export-png', { detail: { name: circuitName || 'circuito' } }));
    setShowFileMenu(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden relative font-sans">
      <Toast />
      
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-2 bg-gray-900 text-white shadow-lg z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-base">⚡</div>
          <div>
            <span className="text-base font-bold tracking-wide">CircuitSim Op-Amp</span>
            <span className="ml-3 text-xs text-gray-400">Simulador Educativo</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Menú Archivo */}
          <div className="relative mr-2">
            <button onClick={() => setShowFileMenu(!showFileMenu)} className="px-3 py-1.5 text-xs rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 transition-colors flex items-center gap-1">
              Archivo ▾
            </button>
            {showFileMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                <button onClick={handleImportJSON} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                  📂 Importar JSON...
                </button>
                <button onClick={handleExportJSON} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                  💾 Exportar JSON
                </button>
                <div className="my-1 border-t border-gray-700"></div>
                <button onClick={handleExportPNG} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                  📷 Exportar como PNG
                </button>
              </div>
            )}
          </div>

          {/* Ejemplos */}
          <div className="relative mr-2">
            <button onClick={() => setShowExamples(!showExamples)} className="px-3 py-1.5 text-xs rounded-md bg-purple-600/80 hover:bg-purple-600 text-white font-semibold transition-colors flex items-center gap-1">
              Ejemplos ▾
            </button>
            {showExamples && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                {predefinedCircuits.map(c => (
                  <button key={c.id} onClick={() => handleLoadExample(c.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth & Persistence */}
          {auth.user ? (
            <div className="flex items-center gap-2 mr-4 border-r border-gray-700 pr-4">
              <span className="text-xs text-gray-400 font-semibold">Hola, {auth.user.name}</span>
              <button onClick={() => setShowCircuitManager(true)} className="px-3 py-1.5 text-xs rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 transition-colors">
                Mis Circuitos
              </button>
              <button onClick={handleSave} disabled={isSaving} className="px-3 py-1.5 text-xs rounded-md bg-blue-600/80 hover:bg-blue-600 text-white transition-colors">
                {isSaving ? 'Guardando...' : (circuitId ? 'Guardar Cambios' : 'Guardar Nuevo')}
              </button>
              <button onClick={() => { dispatch(logout()); dispatch(clearCircuit()); }} className="text-xs text-red-400 hover:text-red-300 underline ml-2">
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center mr-4 border-r border-gray-700 pr-4">
              <button onClick={() => setShowAuthModal(true)} className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                Iniciar Sesión para Guardar
              </button>
            </div>
          )}

          {/* Validation badge */}
          {components.length > 0 && (
            <div className={`text-xs px-3 py-1 rounded-full font-medium ${
              hasErrors
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {hasErrors ? `⚠ ${validationErrors.length} error(es)` : '✓ Válido'}
            </div>
          )}

          {/* Analysis mode tabs */}
          <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
            <button
              onClick={() => setActiveTab('dc')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'dc' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >⚡ DC</button>
            <button
              onClick={() => setActiveTab('transient')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'transient' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >〜 Transitorio</button>
          </div>

          {/* Transient time selector */}
          {activeTab === 'transient' && (
            <select
              value={selectedPreset}
              onChange={e => setSelectedPreset(Number(e.target.value))}
              className="text-xs bg-gray-800 text-gray-200 border border-gray-600 rounded-md px-2 py-1.5 focus:outline-none"
            >
              {TIME_PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          )}

          {/* Oscilloscope toggle (visible when waveform available) */}
          {waveformData && (
            <button
              onClick={() => dispatch(toggleOscilloscope())}
              className={`px-3 py-1.5 text-xs rounded-md font-semibold border transition-all ${
                oscilloscopeVisible
                  ? 'bg-teal-600/30 text-teal-300 border-teal-600/50'
                  : 'bg-gray-700 text-gray-400 border-gray-600 hover:border-gray-500'
              }`}
            >
              ⊡ Osciloscopio
            </button>
          )}

          {/* Reset */}
          {simStatus !== 'idle' && (
            <button
              onClick={() => dispatch(resetSimulation())}
              className="px-3 py-1.5 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
            >
              ⏹ Reset
            </button>
          )}

          {/* Run button */}
          <button
            onClick={activeTab === 'dc' ? runDC : runTransient}
            disabled={!canSimulate || simStatus === 'running'}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-md ${
              canSimulate && simStatus !== 'running'
                ? activeTab === 'dc'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {simStatus === 'running'
              ? <><span className="animate-spin inline-block">⟳</span> Simulando...</>
              : activeTab === 'dc' ? '▶ Simular DC' : '▶ Simular Transitorio'}
          </button>
        </div>
      </header>

      {/* ── Main workspace ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        <ComponentPalette />
        <div className="relative flex-1">
          <CircuitCanvas />
          {/* DC results panel */}
          {activeTab === 'dc' && <SimulationPanel />}
          {/* Oscilloscope */}
          <Oscilloscope />
        </div>
        <PropertyPanel />
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-1.5 bg-gray-800 text-gray-400 text-xs flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>{circuitName} {circuitId ? '(Guardado)' : '(No guardado)'}</span>
          <span>·</span>
          <span>{components.length} componente(s)</span>
          <span>·</span>
          <span>{connections.length} conexión(es)</span>
          <span>·</span>
          {simStatus === 'success' && !waveformData && <span className="text-green-400">✓ DC completado</span>}
          {simStatus === 'success' && waveformData && <span className="text-teal-400">✓ Transitorio completado — {waveformData.timePoints.length} puntos</span>}
          {simStatus === 'error' && <span className="text-red-400">✗ Error en simulación</span>}
        </div>
        
        {simStatus === 'idle' && (
          <div>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">Delete</kbd> eliminar ·{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">Esc</kbd> cancelar
          </div>
        )}
      </div>

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showCircuitManager && <CircuitManagerModal onClose={() => setShowCircuitManager(false)} />}
    </div>
  )
}

export default App
