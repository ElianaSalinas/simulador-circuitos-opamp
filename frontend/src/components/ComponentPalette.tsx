import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComponent } from '../store/circuitSlice';
import type { ComponentType } from '../store/circuitSlice';

interface ComponentDef {
  type: ComponentType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const COMPONENTS: ComponentDef[] = [
  { type: 'OpAmp', label: 'Op-Amp', icon: '⚡', description: 'TL082 / LM741', color: '#0F766E' },
  { type: 'Resistor', label: 'Resistor', icon: 'Ω', description: '1 kΩ por defecto', color: '#2563EB' },
  { type: 'Capacitor', label: 'Capacitor', icon: 'C', description: '100 nF por defecto', color: '#7C3AED' },
  { type: 'Voltage', label: 'Fuente AC/DC', icon: '~', description: '5 V por defecto', color: '#B45309' },
  { type: 'Ground', label: 'Tierra', icon: '⏚', description: 'Referencia 0 V', color: '#374151' },
];

const ComponentPalette: React.FC = () => {
  const dispatch = useDispatch();
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);

  const handleAddClick = (type: ComponentType) => {
    // Add to canvas at a random position so multiple don't stack
    dispatch(addComponent({ type, x: 120 + Math.random() * 200, y: 80 + Math.random() * 150 }));
  };

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    setDraggingType(type);
  };

  const handleDragEnd = () => setDraggingType(null);

  return (
    <div className="w-[220px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Componentes</h2>
        <p className="text-xs text-gray-400 mt-1">Haz clic para agregar</p>
      </div>

      {/* Component list */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {COMPONENTS.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => handleDragStart(e, comp.type)}
            onDragEnd={handleDragEnd}
            onClick={() => handleAddClick(comp.type)}
            className={`
              flex items-center gap-3 p-3 rounded-lg border cursor-pointer
              transition-all duration-150
              ${draggingType === comp.type ? 'opacity-50 scale-95' : 'hover:shadow-sm hover:border-gray-300'}
              border-gray-100 bg-gray-50 hover:bg-white
            `}
          >
            {/* Icon badge */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: comp.color }}
            >
              {comp.icon}
            </div>
            {/* Text */}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{comp.label}</div>
              <div className="text-xs text-gray-400 truncate">{comp.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Help section */}
      <div className="p-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-green-500">●</span> Pines verdes → conectar
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400">●</span> Borde amarillo → seleccionado
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400">●</span> Borde rojo → error
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;
