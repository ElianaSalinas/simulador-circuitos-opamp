import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addComponent } from '../store/circuitSlice';
import type { ComponentType } from '../store/circuitSlice';

interface ComponentDef {
  type: ComponentType;
  label: string;
  symbolGlyph: string;
  description: string;
  color: string;
}

const COMPONENTS: ComponentDef[] = [
  { type: 'OpAmp', label: 'Op-Amp', symbolGlyph: '▷', description: 'TL082 / LM741', color: '#0d9488' },
  { type: 'Resistor', label: 'Resistor', symbolGlyph: '∿', description: '1 kΩ por defecto', color: '#38bdf8' },
  { type: 'Capacitor', label: 'Capacitor', symbolGlyph: '⫡', description: '100 nF por defecto', color: '#a855f7' },
  { type: 'Voltage', label: 'Fuente AC/DC', symbolGlyph: '○', description: '5 V por defecto', color: '#f59e0b' },
  { type: 'Ground', label: 'Tierra', symbolGlyph: '⏚', description: 'Referencia 0 V', color: '#94a3b8' },
];

const ComponentPalette: React.FC = () => {
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);

  const handleAddClick = (type: ComponentType) => {
    dispatch(addComponent({ type, x: 200 + Math.random() * 150, y: 150 + Math.random() * 100 }));
  };

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
    setDraggingType(type);
  };

  const handleDragEnd = () => setDraggingType(null);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 z-10 select-none shadow-lg">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expandir paleta"
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center font-bold text-sm transition-colors border border-slate-700"
        >
          »
        </button>
        <div className="w-6 h-[1px] bg-slate-800 my-1"></div>
        {COMPONENTS.map((comp) => (
          <button
            key={comp.type}
            onClick={() => handleAddClick(comp.type)}
            title={`Agregar ${comp.label}`}
            className="w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-base transition-transform hover:scale-105 border border-slate-700/60"
            style={{ color: comp.color }}
          >
            {comp.symbolGlyph}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-[230px] bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col h-full z-10 select-none shadow-2xl">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Componentes
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Arrastra o haz clic</p>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Colapsar paleta"
          className="w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold text-xs transition-colors"
        >
          «
        </button>
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
              flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer
              transition-all duration-200 group
              ${draggingType === comp.type ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}
              border-slate-800/90 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700
            `}
          >
            {/* Symbol Glyph Avatar */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold shadow-inner border border-slate-700/50 flex-shrink-0"
              style={{ backgroundColor: `${comp.color}15`, color: comp.color }}
            >
              {comp.symbolGlyph}
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 font-mono transition-colors block truncate">
                {comp.label}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {comp.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips Footer */}
      <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 text-[10px] text-slate-400 flex flex-col gap-1">
        <div>💡 <span className="text-slate-300">Rueda</span> = Zoom</div>
        <div>💡 <span className="text-slate-300">Espacio + Arrastre</span> = Mover</div>
        <div>💡 <span className="text-slate-300">Clic en pin</span> = Cablear</div>
      </div>
    </div>
  );
};

export default ComponentPalette;
