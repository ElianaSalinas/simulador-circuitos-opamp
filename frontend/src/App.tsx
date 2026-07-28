import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './store'
import {
  removeComponent, selectComponent, cancelConnection,
  setValidationErrors, clearValidationErrors,
} from './store/circuitSlice'
import { validateCircuit } from './store/circuitUtils'
import ComponentPalette from './components/ComponentPalette'
import CircuitCanvas from './components/CircuitCanvas'
import PropertyPanel from './components/PropertyPanel'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId)
  const components = useSelector((state: RootState) => state.circuit.components)
  const connections = useSelector((state: RootState) => state.circuit.connections)
  const validationErrors = useSelector((state: RootState) => state.circuit.validationErrors)

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      // Don't delete while typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') return;
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

  // Auto-validate whenever circuit changes
  useEffect(() => {
    if (components.length === 0) {
      dispatch(clearValidationErrors())
      return
    }
    const errors = validateCircuit(components, connections)
    dispatch(setValidationErrors(errors))
  }, [components, connections, dispatch])

  const hasErrors = validationErrors.length > 0
  const canSimulate = components.length > 0 && !hasErrors

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-gray-900 text-white shadow-lg z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-base">⚡</div>
          <div>
            <span className="text-base font-bold tracking-wide">CircuitSim Op-Amp</span>
            <span className="ml-3 text-xs text-gray-400">Simulador Educativo</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Validation status */}
          {components.length > 0 && (
            <div className={`text-xs px-3 py-1 rounded-full font-medium ${hasErrors ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {hasErrors ? `⚠ ${validationErrors.length} error(es)` : '✓ Circuito válido'}
            </div>
          )}

          {/* Simulate button */}
          <button
            disabled={!canSimulate}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-all
              ${canSimulate
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
            `}
          >
            ▶ Simular
          </button>
        </div>
      </header>

      {/* ── Main workspace ── */}
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette />
        <CircuitCanvas />
        <PropertyPanel />
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center gap-4 px-5 py-1.5 bg-gray-800 text-gray-400 text-xs flex-shrink-0">
        <span>{components.length} componente(s)</span>
        <span>·</span>
        <span>{connections.length} conexión(es)</span>
        <span>·</span>
        <span>
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">Delete</kbd> eliminar ·{' '}
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono">Esc</kbd> cancelar conexión
        </span>
      </div>
    </div>
  )
}

export default App
