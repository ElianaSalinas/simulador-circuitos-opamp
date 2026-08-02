import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from './store'
import { setValidationErrors, loadCircuitData, setCircuitMetadata, clearCircuit } from './store/circuitSlice'
import {
  startSimulation,
  simulationSuccess,
  simulationError,
  resetSimulation,
  transientSuccess,
  toggleOscilloscope,
} from './store/simulationSlice'
import { logout } from './store/authSlice'
import { validateCircuit } from './store/circuitUtils'
import { buildNetlist } from './simulation/netlistBuilder'
import { solveMNA } from './simulation/MNASolver'
import { solveTransient } from './simulation/TransientSolver'
import { predefinedCircuits } from './library/circuits'
import { api } from './api'
import ComponentPalette from './components/ComponentPalette'
import CircuitCanvas from './components/CircuitCanvas'
import PropertyPanel from './components/PropertyPanel'
import SimulationPanel from './components/SimulationPanel'
import Oscilloscope from './components/Oscilloscope'
import AuthModal from './components/AuthModal'
import CircuitManagerModal from './components/CircuitManagerModal'

const TIME_PRESETS = [
  { label: '1 ms', tStop: 0.001, tStep: 1e-6 },
  { label: '5 ms', tStop: 0.005, tStep: 5e-6 },
  { label: '10 ms', tStop: 0.01, tStep: 1e-5 },
  { label: '20 ms', tStop: 0.02, tStep: 1e-5 },
  { label: '50 ms', tStop: 0.05, tStep: 2e-5 },
  { label: '100 ms', tStop: 0.1, tStep: 5e-5 },
]

function App() {
  const dispatch = useDispatch()
  const components = useSelector((state: RootState) => state.circuit.components)
  const connections = useSelector((state: RootState) => state.circuit.connections)
  const validationErrors = useSelector((state: RootState) => state.circuit.validationErrors)
  const simStatus = useSelector((state: RootState) => state.simulation.status)
  const waveformData = useSelector((state: RootState) => state.simulation.waveformData)
  const oscilloscopeVisible = useSelector((state: RootState) => state.simulation.oscilloscopeVisible)
  const circuitId = useSelector((state: RootState) => state.circuit.circuitId)
  const circuitName = useSelector((state: RootState) => state.circuit.circuitName)
  const auth = useSelector((state: RootState) => state.auth)

  const [activeTab, setActiveTab] = useState<'dc' | 'transient'>('dc')
  const [selectedPreset, setSelectedPreset] = useState(0) // Default 1ms
  const [showExamples, setShowExamples] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCircuitManager, setShowCircuitManager] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Auto-validate whenever components or connections change
  useEffect(() => {
    if (components.length === 0) {
      dispatch(setValidationErrors([]))
      return
    }
    const errors = validateCircuit(components, connections)
    dispatch(setValidationErrors(errors))
  }, [components, connections, dispatch])

  // Toast notification auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type })
  }

  const hasErrors = validationErrors.length > 0
  const canSimulate = components.length > 0 && !hasErrors

  // ── DC Simulation ──────────────────────────────────────────────────────────
  const runDC = () => {
    if (!canSimulate) return
    dispatch(startSimulation())
    setTimeout(() => {
      try {
        const { elements, nodeCount, nodeLabels } = buildNetlist(components, connections)
        const result = solveMNA(elements, nodeCount, nodeLabels)
        if (result.success) {
          dispatch(simulationSuccess(result))
        } else {
          dispatch(simulationError(result.error ?? 'Error en la simulación MNA'))
        }
      } catch (err: any) {
        dispatch(simulationError(err.message ?? 'Error desconocido en el solver MNA'))
      }
    }, 50)
  }

  // ── Transient Simulation ───────────────────────────────────────────────────
  const runTransient = () => {
    if (!canSimulate) return
    dispatch(startSimulation())
    setTimeout(() => {
      try {
        const { elements, nodeCount, nodeLabels } = buildNetlist(components, connections)
        const preset = TIME_PRESETS[selectedPreset]
        const res = solveTransient(elements, nodeCount, nodeLabels, {
          tStart: 0,
          tEnd: preset.tStop,
          tStep: preset.tStep,
        })
        if (res.success && res.data) {
          dispatch(transientSuccess(res.data))
          dispatch(
            simulationSuccess({
              success: true,
              nodeVoltages: Object.fromEntries(
                Object.entries(res.data.nodeWaveforms).map(([node, arr]) => [
                  node,
                  arr[arr.length - 1] ?? 0,
                ])
              ),
              branchCurrents: {},
              nodeLabels: res.data.nodeLabels,
            })
          )
        } else {
          dispatch(simulationError(res.error ?? 'Error en la simulación transitoria'))
        }
      } catch (err: any) {
        dispatch(simulationError(err.message ?? 'Error en la simulación transitoria'))
      }
    }, 50)
  }

  const handleLoadExample = (id: string) => {
    const ex = predefinedCircuits.find((c: any) => c.id === id)
    if (ex) {
      dispatch(loadCircuitData({ components: ex.data.components as any, connections: ex.data.connections as any }))
      dispatch(setCircuitMetadata({ id: '', name: ex.name }))
      dispatch(resetSimulation())
      
      // Auto-configuración de pestaña y escala temporal según la naturaleza del circuito
      if (id === 'wien') {
        setActiveTab('transient')
        setSelectedPreset(4) // 50 ms (muestra ~8 ciclos completos a 159 Hz)
      } else if (id === 'astable') {
        setActiveTab('transient')
        setSelectedPreset(2) // 10 ms (muestra ~4.5 ciclos a 455 Hz)
      } else if (id === 'integrator') {
        setActiveTab('transient')
        setSelectedPreset(3) // 20 ms (muestra 2 ciclos a 100 Hz)
      }

      setShowExamples(false)
      showToast(`Ejemplo cargado: ${ex.name}`, 'info')
    }
  }

  const handleSave = async () => {
    if (!auth.token) {
      setShowAuthModal(true)
      return
    }

    setIsSaving(true)
    try {
      if (circuitId) {
        await api.updateCircuit(circuitId, { name: circuitName || 'Mi Circuito', data: { components, connections } })
        showToast('¡Circuito actualizado correctamente!', 'success')
      } else {
        const name = prompt('Nombre para tu circuito:', circuitName || 'Nuevo Circuito')
        if (!name) {
          setIsSaving(false)
          return
        }
        const saved = await api.createCircuit({ name, data: { components, connections } })
        dispatch(setCircuitMetadata({ id: saved._id, name: saved.name }))
        showToast('¡Circuito guardado en la nube!', 'success')
      }
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el circuito', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ components, connections }, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${circuitName || 'circuito'}.circuit.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowFileMenu(false)
  }

  const handleImportJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev: any) => {
        try {
          const data = JSON.parse(ev.target.result)
          if (data.components && data.connections) {
            dispatch(loadCircuitData(data))
            dispatch(
              setCircuitMetadata({
                id: '',
                name: file.name.replace('.circuit.json', '').replace('.json', ''),
              })
            )
            showToast('Circuito importado correctamente', 'success')
          } else {
            showToast('El archivo JSON no tiene el formato correcto', 'error')
          }
        } catch {
          showToast('Error al leer el archivo JSON', 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
    setShowFileMenu(false)
  }

  const handleExportPNG = () => {
    window.dispatchEvent(
      new CustomEvent('export-png', { detail: { name: circuitName || 'circuito' } })
    )
    setShowFileMenu(false)
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1d] text-slate-100 overflow-hidden relative font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono font-semibold flex items-center gap-2 border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
              : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50'
          }`}
        >
          <span>{toastMessage.type === 'success' ? '✓' : toastMessage.type === 'error' ? '✗' : 'ℹ'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-slate-950/90 backdrop-blur-md text-white border-b border-slate-800 z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center font-bold text-base shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider font-mono bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                CircuitSim Op-Amp
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                PRO 2.0
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Laboratorio Interactivo de Electrónica Analógica
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* File Menu */}
          <div className="relative mr-1">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              Archivo ▾
            </button>
            {showFileMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 font-mono text-xs backdrop-blur-lg">
                <button
                  onClick={handleImportJSON}
                  className="block w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  📂 Importar JSON...
                </button>
                <button
                  onClick={handleExportJSON}
                  className="block w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  💾 Exportar JSON
                </button>
                <div className="my-1 border-t border-slate-800"></div>
                <button
                  onClick={handleExportPNG}
                  className="block w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  📷 Exportar PNG
                </button>
              </div>
            )}
          </div>

          {/* Examples Menu */}
          <div className="relative mr-2">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            >
              Prácticas / Ejemplos ▾
            </button>
            {showExamples && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 font-mono text-xs backdrop-blur-lg max-h-96 overflow-y-auto">
                {predefinedCircuits.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => handleLoadExample(c.id)}
                    className="block w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth & Persistence */}
          {auth.user ? (
            <div className="flex items-center gap-2 mr-3 border-r border-slate-800 pr-3">
              <span className="text-xs font-mono text-slate-400">
                Hola, <strong className="text-slate-200">{auth.user.name}</strong>
              </span>
              <button
                onClick={() => setShowCircuitManager(true)}
                className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Mis Circuitos
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                {isSaving ? 'Guardando...' : circuitId ? 'Guardar' : 'Guardar Nuevo'}
              </button>
              <button
                onClick={() => {
                  dispatch(logout())
                  dispatch(clearCircuit())
                }}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 underline ml-1"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center mr-3 border-r border-slate-800 pr-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white transition-colors shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                Iniciar Sesión
              </button>
            </div>
          )}

          {/* Validation badge */}
          {components.length > 0 && (
            <div
              className={`text-xs font-mono px-3 py-1 rounded-full font-medium ${
                hasErrors
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-600/50'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
              }`}
            >
              {hasErrors ? `⚠ ${validationErrors.length} error(es)` : '✓ Válido'}
            </div>
          )}

          {/* Analysis mode tabs */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setActiveTab('dc')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                activeTab === 'dc'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ DC
            </button>
            <button
              onClick={() => setActiveTab('transient')}
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                activeTab === 'transient'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              〜 Transitorio
            </button>
          </div>

          {/* Transient time selector */}
          {activeTab === 'transient' && (
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(Number(e.target.value))}
              className="text-xs font-mono bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {TIME_PRESETS.map((p, i) => (
                <option key={i} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          )}

          {/* Oscilloscope toggle */}
          {waveformData && (
            <button
              onClick={() => dispatch(toggleOscilloscope())}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg font-bold border transition-all ${
                oscilloscopeVisible
                  ? 'bg-teal-600/30 text-teal-300 border-teal-500/60 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              ⊡ Osciloscopio
            </button>
          )}

          {/* Reset */}
          {simStatus !== 'idle' && (
            <button
              onClick={() => dispatch(resetSimulation())}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              ⏹ Reset
            </button>
          )}

          {/* Run button */}
          <button
            onClick={activeTab === 'dc' ? runDC : runTransient}
            disabled={!canSimulate || simStatus === 'running'}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-lg ${
              canSimulate && simStatus !== 'running'
                ? activeTab === 'dc'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_15px_rgba(13,148,136,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {simStatus === 'running' ? (
              <>
                <span className="animate-spin inline-block">⟳</span> Simulando...
              </>
            ) : activeTab === 'dc' ? (
              '▶ Simular DC'
            ) : (
              '▶ Simular Transitorio'
            )}
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
      <div className="flex items-center justify-between px-5 py-1.5 bg-slate-950 border-t border-slate-800 text-slate-400 text-[11px] font-mono flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="text-slate-300 font-semibold">
            {circuitName || 'Circuito sin título'} {circuitId ? '(Guardado)' : '(No guardado)'}
          </span>
          <span>·</span>
          <span>{components.length} componente(s)</span>
          <span>·</span>
          <span>{connections.length} conexión(es)</span>
          <span>·</span>
          {simStatus === 'success' && !waveformData && (
            <span className="text-emerald-400 font-bold">✓ DC completado</span>
          )}
          {simStatus === 'success' && waveformData && (
            <span className="text-cyan-400 font-bold">
              ✓ Transitorio completado — {waveformData.timePoints.length} muestras
            </span>
          )}
          {simStatus === 'error' && <span className="text-rose-400 font-bold">✗ Error en simulación</span>}
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
              Delete
            </kbd>{' '}
            Eliminar
          </span>
          <span>·</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
              Espacio
            </kbd>{' '}
            Pan
          </span>
          <span>·</span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
              Esc
            </kbd>{' '}
            Cancelar
          </span>
        </div>
      </div>

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showCircuitManager && <CircuitManagerModal onClose={() => setShowCircuitManager(false)} />}
    </div>
  )
}

export default App
