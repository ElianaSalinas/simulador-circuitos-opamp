import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './store'
import {
  removeComponent, selectComponent, cancelConnection,
  setValidationErrors, clearValidationErrors,
} from './store/circuitSlice'
import { startSimulation, simulationSuccess, simulationError, resetSimulation } from './store/simulationSlice'
import { validateCircuit } from './store/circuitUtils'
import { buildNetlist } from './simulation/netlistBuilder'
import { solveMNA } from './simulation/MNASolver'
import ComponentPalette from './components/ComponentPalette'
import CircuitCanvas from './components/CircuitCanvas'
import PropertyPanel from './components/PropertyPanel'
import SimulationPanel from './components/SimulationPanel'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId)
  const components = useSelector((state: RootState) => state.circuit.components)
  const connections = useSelector((state: RootState) => state.circuit.connections)
  const validationErrors = useSelector((state: RootState) => state.circuit.validationErrors)
  const simStatus = useSelector((state: RootState) => state.simulation.status)

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

  // ── Auto-validate on circuit change ────────────────────────────────────
  useEffect(() => {
    if (components.length === 0) { dispatch(clearValidationErrors()); return }
    dispatch(setValidationErrors(validateCircuit(components, connections)))
    // Reset simulation if circuit changed
    if (simStatus === 'success') dispatch(resetSimulation())
  }, [components, connections, dispatch]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Run simulation ──────────────────────────────────────────────────────
  const runSimulation = () => {
    dispatch(startSimulation())
    try {
      const { elements, nodeCount, nodeLabels } = buildNetlist(components, connections)
      const result = solveMNA(elements, nodeCount, nodeLabels)
      if (result.success) {
        dispatch(simulationSuccess(result))
      } else {
        dispatch(simulationError(result.error ?? 'Error desconocido en simulación'))
      }
    } catch (err: unknown) {
      dispatch(simulationError(err instanceof Error ? err.message : 'Error inesperado'))
    }
  }

  const hasErrors = validationErrors.length > 0
  const canSimulate = components.length > 0 && !hasErrors

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-gray-900 text-white shadow-lg z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-base">⚡</div>
          <div>
            <span className="text-base font-bold tracking-wide">CircuitSim Op-Amp</span>
            <span className="ml-3 text-xs text-gray-400">Simulador Educativo</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Validation badge */}
          {components.length > 0 && (
            <div className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
              hasErrors
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}>
              {hasErrors ? `⚠ ${validationErrors.length} error(es)` : '✓ Circuito válido'}
            </div>
          )}

          {/* Reset button */}
          {simStatus !== 'idle' && (
            <button
              onClick={() => dispatch(resetSimulation())}
              className="px-3 py-1.5 text-xs rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            >
              ⏹ Detener
            </button>
          )}

          {/* Simulate button */}
          <button
            onClick={runSimulation}
            disabled={!canSimulate || simStatus === 'running'}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-md
              ${canSimulate && simStatus !== 'running'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            {simStatus === 'running' ? (
              <><span className="animate-spin inline-block">⟳</span> Simulando...</>
            ) : (
              <>▶ Simular DC</>
            )}
          </button>
        </div>
      </header>

      {/* ── Main workspace ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        <ComponentPalette />
        <div className="relative flex-1">
          <CircuitCanvas />
          <SimulationPanel />
        </div>
        <PropertyPanel />
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-5 py-1.5 bg-gray-800 text-gray-400 text-xs flex-shrink-0">
        <span>{components.length} componente(s)</span>
        <span>·</span>
        <span>{connections.length} conexión(es)</span>
        <span>·</span>
        {simStatus === 'success' && <span className="text-green-400">✓ Simulación DC completada</span>}
        {simStatus === 'error' && <span className="text-red-400">✗ Error en simulación</span>}
        {simStatus === 'idle' && (
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">Delete</kbd> eliminar ·{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">Esc</kbd> cancelar
          </span>
        )}
      </div>
    </div>
  )
}

export default App
