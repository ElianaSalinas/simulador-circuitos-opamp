import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from './store'
import { removeComponent } from './store/circuitSlice'
import ComponentPalette from './components/ComponentPalette'
import CircuitCanvas from './components/CircuitCanvas'

const App: React.FC = () => {
  const dispatch = useDispatch()
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
      dispatch(removeComponent(selectedId))
    }
  }, [selectedId, dispatch])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">⚡</div>
          <span className="text-lg font-bold tracking-wide">CircuitSim Op-Amp</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <span>Sprint 1 - Lienzo Interactivo</span>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        <ComponentPalette />
        <CircuitCanvas />
      </div>

      {/* Footer / Toolbar */}
      <div className="flex items-center gap-3 px-6 py-2 bg-white border-t border-gray-200 text-sm text-gray-500">
        <span>💡 Haz clic en un componente para agregarlo al lienzo · Selecciona y presiona</span>
        <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Delete</kbd>
        <span>para eliminar</span>
      </div>
    </div>
  )
}

export default App
