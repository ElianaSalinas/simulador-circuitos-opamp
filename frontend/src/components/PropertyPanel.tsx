import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateComponentValue, removeComponent, selectComponent } from '../store/circuitSlice';

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
  }, [component]);

  if (!component) {
    return (
      <div className="w-[200px] bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
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
    if (hasValue && displayValue) {
      const newBase = toBaseValue(parseFloat(displayValue), displayUnit);
      dispatch(updateComponentValue({ id: component.id, value: newBase, label: labelEdit }));
    } else {
      dispatch(updateComponentValue({ id: component.id, value: component.value ?? 0, label: labelEdit }));
    }
  };

  const handleDelete = () => {
    dispatch(removeComponent(component.id));
    dispatch(selectComponent(null));
  };

  return (
    <div className="w-[200px] bg-white border-l border-gray-200 flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Propiedades</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type badge */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
          <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-700">
            {component.type}
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Designador
          </label>
          <input
            className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
            value={labelEdit}
            onChange={e => setLabelEdit(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        {/* Value */}
        {hasValue && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</label>
            <div className="mt-1 flex gap-1">
              <input
                type="number"
                className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
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

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-semibold text-red-600 mb-1">⚠ Errores</p>
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-red-500">{e.message}</p>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Guardar
        </button>
        <button
          onClick={handleDelete}
          className="w-full py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition-colors border border-red-200"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;
