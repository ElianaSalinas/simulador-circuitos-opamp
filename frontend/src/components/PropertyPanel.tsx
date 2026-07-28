import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateComponentProps, removeComponent, selectComponent } from '../store/circuitSlice';

const UNIT_STEPS: Record<string, string[]> = {
  Ω: ['Ω', 'kΩ', 'MΩ'],
  F: ['pF', 'nF', 'µF'],
  V: ['mV', 'V'],
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
    state.circuit.components.find(c => c.id === selectedId)
  );
  const errors = useSelector((state: RootState) =>
    state.circuit.validationErrors.filter(e => e.componentId === selectedId)
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
      // Pick best display unit
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
      <div className="w-[220px] bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Propiedades</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <p className="text-xs text-gray-400">Selecciona un componente en el lienzo</p>
        </div>
      </div>
    );
  }

  const baseUnit = component.unit;
  const unitOptions = baseUnit ? (UNIT_STEPS[baseUnit] ?? [baseUnit]) : [];
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
      if (waveform !== 'dc') updates.value = updates.offset; // Para compatibilidad DC solver
    }
    
    dispatch(updateComponentProps({ id: component.id, updates }));
  };

  const handleDelete = () => {
    dispatch(removeComponent(component.id));
    dispatch(selectComponent(null));
  };

  return (
    <div className="w-[240px] bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Propiedades</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type badge */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
          <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-md text-sm font-medium text-gray-700">
            {component.type}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Designador</label>
          <input
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={labelEdit}
            onChange={e => setLabelEdit(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        {/* Base Value (Resistance, Capacitance, or DC Voltage) */}
        {hasValue && component.type !== 'Voltage' && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</label>
            <div className="mt-1 flex gap-1">
              <input
                type="number"
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={displayValue}
                onChange={e => setDisplayValue(e.target.value)}
                onBlur={handleSave}
              />
              <select
                className="px-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                value={displayUnit}
                onChange={e => { setDisplayUnit(e.target.value); }}
                onBlur={handleSave}
              >
                {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Voltage Source AC Config */}
        {component.type === 'Voltage' && (
          <div className="space-y-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Modo de Fuente</label>
              <select
                className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white"
                value={waveform}
                onChange={e => { setWaveform(e.target.value as any); }}
                onBlur={handleSave}
              >
                <option value="dc">Voltaje Directo (DC)</option>
                <option value="sine">Onda Senoidal</option>
                <option value="square">Onda Cuadrada</option>
                <option value="triangle">Onda Triangular</option>
              </select>
            </div>

            {waveform === 'dc' ? (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Voltaje (V)</label>
                <input
                  type="number"
                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                  value={offset}
                  onChange={e => setOffset(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Frecuencia (Hz)</label>
                  <input
                    type="number"
                    className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    onBlur={handleSave}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Amplitud (Vp)</label>
                    <input
                      type="number"
                      className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      value={amplitude}
                      onChange={e => setAmplitude(e.target.value)}
                      onBlur={handleSave}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Offset (V)</label>
                    <input
                      type="number"
                      className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      value={offset}
                      onChange={e => setOffset(e.target.value)}
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
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-semibold text-red-600 mb-1">⚠ Errores</p>
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-500 leading-tight">{e.message}</p>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
        >
          Aplicar Cambios
        </button>
        <button
          onClick={handleDelete}
          className="w-full py-2 bg-white text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors border border-red-200"
        >
          Eliminar Componente
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;

