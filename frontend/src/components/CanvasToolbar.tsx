import React from 'react';

interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitToScreen: () => void;
  isAnimationActive: boolean;
  onToggleAnimation: () => void;
  snapToGrid: boolean;
  onToggleGrid: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  isAnimationActive,
  onToggleAnimation,
  snapToGrid,
  onToggleGrid,
}) => {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl select-none">
      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        title="Alejar (Zoom Out)"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold text-sm"
      >
        −
      </button>

      <button
        onClick={onZoomReset}
        title="Restablecer Zoom (100%)"
        className="px-2 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-mono text-xs font-semibold"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        onClick={onZoomIn}
        title="Acercar (Zoom In)"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold text-sm"
      >
        +
      </button>

      <div className="w-[1px] h-5 bg-slate-700 mx-1"></div>

      {/* Fit to screen */}
      <button
        onClick={onFitToScreen}
        title="Ajustar circuito a pantalla (Fit)"
        className="px-2.5 h-8 flex items-center gap-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium"
      >
        <span className="text-sm">⛶</span>
        <span>Ajustar</span>
      </button>

      <div className="w-[1px] h-5 bg-slate-700 mx-1"></div>

      {/* Snap to Grid */}
      <button
        onClick={onToggleGrid}
        title={snapToGrid ? 'Rejilla magnética activada' : 'Rejilla magnética desactivada'}
        className={`px-2.5 h-8 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
          snapToGrid
            ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <span className="text-xs">🧲</span>
        <span>Rejilla</span>
      </button>

      {/* Current flow animation */}
      <button
        onClick={onToggleAnimation}
        title={isAnimationActive ? 'Pausar animación de corriente' : 'Activar animación de corriente'}
        className={`px-2.5 h-8 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-colors ${
          isAnimationActive
            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 animate-pulse'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <span className="text-xs">⚡</span>
        <span>Flujo</span>
      </button>
    </div>
  );
};
