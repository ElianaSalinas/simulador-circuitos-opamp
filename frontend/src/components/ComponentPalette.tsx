import React from 'react';
import { useDispatch } from 'react-redux';
import { addComponent } from '../store/circuitSlice';
import { v4 as uuidv4 } from 'uuid';

const availableComponents = [
  { type: 'Resistor', label: 'Resistor (R)' },
  { type: 'Capacitor', label: 'Capacitor (C)' },
  { type: 'OpAmp', label: 'Op-Amp (TL082)' },
  { type: 'Voltage', label: 'Voltage Source' },
  { type: 'Ground', label: 'Ground' }
];

const ComponentPalette: React.FC = () => {
  const dispatch = useDispatch();

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('componentType', type);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Only a fallback if dropping outside canvas, handled via global or canvas drop
  };

  const handleAddClick = (type: string) => {
    dispatch(addComponent({
      id: uuidv4(),
      type,
      x: 100, // Default drop position
      y: 100
    }));
  };

  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-text">Components</h2>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {availableComponents.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => handleDragStart(e, comp.type)}
            onDragEnd={handleDragEnd}
            onClick={() => handleAddClick(comp.type)}
            className="p-3 border border-gray-200 rounded-md cursor-grab active:cursor-grabbing hover:border-primary hover:bg-surface transition-colors flex items-center justify-between"
          >
            <span className="text-sm font-medium text-text">{comp.label}</span>
            <span className="text-xs text-gray-400">＋</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;
