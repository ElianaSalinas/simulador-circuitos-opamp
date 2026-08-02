import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateComponentProps, removeComponent, selectComponent } from '../store/circuitSlice';

const UNIT_STEPS: Record<string, string[]> = {
  'Ω': ['Ω', 'kΩ', 'MΩ'],
  'F': ['pF', 'nF', 'µF'],
  'V': ['mV', 'V'],
};

const toBaseValue = (val: number, unit: string): number => {
  if (unit === 'kΩ') return val * 1e3;
  if (unit === 'MΩ') return val * 1e6;
  if (unit === 'pF') return val * 1e-12;
  if (unit === 'nF') return val * 1e-9;
  if (unit === 'µF') return val * 1e-6;
  if (unit === 'mV') return val * 1e-3;
  return val;
};

const fromBaseValue = (base: number, unit: string): number => {
  if (unit === 'kΩ') return base / 1e3;
  if (unit === 'MΩ') return base / 1e6;
  if (unit === 'pF') return base / 1e-12;
  if (unit === 'nF') return base / 1e-9;
  if (unit === 'µF') return base / 1e-6;
  if (unit === 'mV') return base / 1e-3;
  return base;
};

const PropertyPanel: React.FC = () => {
  const dispatch = useDispatch();
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId);
  const component = useSelector((state: RootState) =>
    state.circuit.components.find((c) => c.id === selectedId)
  );
  const errors = useSelector((state: RootState) =>
    state.circuit.validationErrors.filter((e) => e.componentId === selectedId)
  );

  const [displayUnit, setDisplayUnit] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [labelEdit, setLabelEdit] = useState('');
  const [waveform, setWaveform] = useState<'dc' | 'sine' | 'square' | 'triangle'>('dc');
  const [frequency, setFrequency] = useState('1000');
  const [amplitude, setAmplitude] = useState('5');
  const [offset, setOffset] = useState('0');

  useEffect(() => {
    if (!component) return;
    const baseUnit = component.unit ?? '';
    const unitSteps = UNIT_STEPS[baseUnit];

    if (component.value !== undefined && unitSteps) {
      const base = component.value;
      let best = unitSteps[0];
      for (const u of unitSteps) {
        if (fromBaseValue(base, u) >= 0.1) best = u;
      }
      setDisplayUnit(best);
      setDisplayValue(fromBaseValue(base, best).toPrecision(4).replace(/\.?0+$/, ''));
    } else {
      setDisplayUnit(baseUnit);
      setDisplayValue('');
    }

    setLabelEdit(component.label);

    if (component.type === 'Voltage') {
      setWaveform(component.waveform || 'dc');
      setFrequency(component.frequency?.toString() || '1000');
      setAmplitude(component.amplitude?.toString() || '5');
      setOffset(component.offset?.toString() || '0');
    }
  }, [component]);

  if (!component) {
    return (
      <div className="w-[230px] bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col h-full select-none shadow-2xl">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Inspector
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-500">
          <span className="text-2xl mb-2">⚡</span>
          <p className="text-xs font-mono">Selecciona un componente para editar sus propiedades</p>
        </div>
      </div>
    );
  }

  const baseUnit = component.unit;
  const unitOptions = baseUnit ? UNIT_STEPS[baseUnit] ?? [baseUnit] : [];
  const hasValue = component.value !== undefined && baseUnit;

  const handleSave = () => {
    const updates: any = { label: labelEdit };

    if (hasValue && displayValue) {
      updates.value = toBaseValue(parseFloat(displayValue), displayUnit);
    }

    if (component.type === 'Voltage') {
      updates.waveform = waveform;
      updates.frequency = parseFloat(frequency) || 1000;
      updates.amplitude = parseFloat(amplitude) || 5;
      updates.offset = parseFloat(offset) || 0;
      if (waveform !== 'dc') updates.value = updates.offset;
    }

    dispatch(updateComponentProps({ id: component.id, updates }));
  };

  const handleDelete = () => {
    dispatch(removeComponent(component.id));
    dispatch(selectComponent(null));
  };

  return (
    <div className="w-[240px] bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col h-full select-none shadow-2xl">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Propiedades
        </h2>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
          {component.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* Type */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Tipo</label>
          <div className="mt-1 px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono font-semibold text-slate-300">
            {component.type === 'OpAmp' ? 'Amplificador Operacional' : component.type}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Designador</label>
          <input
            className="mt-1 w-full px-3 py-1.5 text-xs font-mono bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            value={labelEdit}
            onChange={(e) => setLabelEdit(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        {/* Base Value */}
        {hasValue && component.type !== 'Voltage' && (
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Valor Nominal</label>
            <div className="mt-1 flex gap-1.5">
              <input
                type="number"
                step="any"
                className="flex-1 min-w-0 px-3 py-1.5 text-xs font-mono bg-slate-950/80 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                value={displayValue}
                onChange={(e) => setDisplayValue(e.target.value)}
                onBlur={handleSave}
              />
              <select
                className="px-2 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                value={displayUnit}
                onChange={(e) => setDisplayUnit(e.target.value)}
                onBlur={handleSave}
              >
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Voltage Source AC Config */}
        {component.type === 'Voltage' && (
          <div className="space-y-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-mono text-slate-400 uppercase">Forma de Onda</label>
              <select
                className="mt-1 w-full px-2 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                value={waveform}
                onChange={(e) => setWaveform(e.target.value as any)}
                onBlur={handleSave}
              >
                <option value="dc">Voltaje Directo (DC)</option>
                <option value="sine">Onda Senoidal (~)</option>
                <option value="square">Onda Cuadrada (⎍)</option>
                <option value="triangle">Onda Triangular (∧)</option>
              </select>
            </div>

            {waveform === 'dc' ? (
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase">Voltaje DC (V)</label>
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                  value={offset}
                  onChange={(e) => setOffset(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase">Frecuencia (Hz)</label>
                  <input
                    type="number"
                    step="any"
                    className="mt-1 w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    onBlur={handleSave}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Amplitud (Vp)</label>
                    <input
                      type="number"
                      step="any"
                      className="mt-1 w-full px-2 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                      value={amplitude}
                      onChange={(e) => setAmplitude(e.target.value)}
                      onBlur={handleSave}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Offset (V)</label>
                    <input
                      type="number"
                      step="any"
                      className="mt-1 w-full px-2 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
                      value={offset}
                      onChange={(e) => setOffset(e.target.value)}
                      onBlur={handleSave}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-3">
            <p className="text-xs font-mono font-semibold text-rose-400 mb-1">⚠ Advertencias</p>
            {errors.map((e, i) => (
              <p key={i} className="text-[11px] font-mono text-rose-300 leading-tight">
                {e.message}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-3.5 border-t border-slate-800 space-y-2">
        <button
          onClick={handleSave}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold rounded-xl transition-colors shadow-lg shadow-cyan-900/30"
        >
          Aplicar Cambios
        </button>
        <button
          onClick={handleDelete}
          className="w-full py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-semibold rounded-xl transition-colors border border-rose-800/50"
        >
          Eliminar Componente
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;
