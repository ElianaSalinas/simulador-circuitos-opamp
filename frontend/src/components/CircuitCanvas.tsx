import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Circle, Line, Arrow } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import {
  updateComponentPosition, selectComponent,
  startConnection, completeConnection, cancelConnection,
} from '../store/circuitSlice';
import { COMPONENT_PINS } from '../store/circuitSlice';
import { getPinAbsolutePosition } from '../store/circuitUtils';

// Color map for component types
const COMP_COLORS: Record<string, string> = {
  Resistor: '#2563EB',
  Capacitor: '#7C3AED',
  OpAmp: '#0F766E',
  Voltage: '#B45309',
  Ground: '#374151',
};

const PIN_RADIUS = 5;
const PIN_HIT_RADIUS = 10;

const CircuitCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const components = useSelector((state: RootState) => state.circuit.components);
  const connections = useSelector((state: RootState) => state.circuit.connections);
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId);
  const pendingConn = useSelector((state: RootState) => state.circuit.pendingConnection);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth - 460, height: window.innerHeight - 100 });

  // Handle drag-end: update position in Redux
  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    dispatch(updateComponentPosition({ id, x: e.target.x(), y: e.target.y() }));
  };

  // Clicking blank area: deselect & cancel pending connection
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      dispatch(selectComponent(null));
      dispatch(cancelConnection());
    }
  };

  // Track mouse while dragging a wire
  const handleMouseMove = () => {
    if (!pendingConn) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (pos) setMousePos(pos);
  };

  // Clicking a pin
  const handlePinClick = (componentId: string, pinId: string) => {
    if (!pendingConn) {
      // Start a new connection
      dispatch(startConnection({ componentId, pinId }));
    } else {
      // Complete the connection
      dispatch(completeConnection({ componentId, pinId }));
      setMousePos(null);
    }
  };

  // Export PNG listener
  useEffect(() => {
    const handleExport = (e: Event) => {
      const customEvent = e as CustomEvent;
      const stage = stageRef.current;
      if (!stage) return;
      const dataURL = stage.toDataURL({ pixelRatio: 2 }); // High quality export
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${customEvent.detail?.name || 'circuito'}.png`;
      a.click();
    };
    window.addEventListener('export-png', handleExport);

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size update

    return () => {
      window.removeEventListener('export-png', handleExport);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Render wires (completed connections)
  const renderConnections = () => {
    return connections.map(conn => {
      const fromComp = components.find(c => c.id === conn.fromComponentId);
      const toComp = components.find(c => c.id === conn.toComponentId);
      if (!fromComp || !toComp) return null;

      const fromPos = getPinAbsolutePosition(fromComp, conn.fromPinId);
      const toPos = getPinAbsolutePosition(toComp, conn.toPinId);
      if (!fromPos || !toPos) return null;

      return (
        <Line
          key={conn.id}
          points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
          stroke="#2DD4BF"
          strokeWidth={2}
          lineCap="round"
        />
      );
    });
  };

  // Render pending (in-progress) wire
  const renderPendingWire = () => {
    if (!pendingConn || !mousePos) return null;
    const fromComp = components.find(c => c.id === pendingConn.componentId);
    if (!fromComp) return null;
    const fromPos = getPinAbsolutePosition(fromComp, pendingConn.pinId);
    if (!fromPos) return null;

    return (
      <Arrow
        points={[fromPos.x, fromPos.y, mousePos.x, mousePos.y]}
        stroke="#FF6B6B"
        strokeWidth={2}
        fill="#FF6B6B"
        pointerLength={8}
        pointerWidth={6}
        dash={[6, 3]}
      />
    );
  };

  // Render a single component (box + label + pins)
  const renderComponent = (comp: typeof components[0]) => {
    const isSelected = comp.id === selectedId;
    const isPendingFrom = pendingConn?.componentId === comp.id;
    const fillColor = COMP_COLORS[comp.type] ?? '#555';
    const pins = COMPONENT_PINS[comp.type];

    return (
      <Group
        key={comp.id}
        x={comp.x}
        y={comp.y}
        draggable={!pendingConn} // disable drag while wiring
        onDragEnd={(e) => handleDragEnd(e, comp.id)}
        onClick={() => {
          if (!pendingConn) dispatch(selectComponent(comp.id));
        }}
      >
        {/* Component body */}
        <Rect
          width={80}
          height={40}
          fill={fillColor}
          stroke={comp.hasError ? '#FF6B6B' : isSelected ? '#F59E0B' : '#000'}
          strokeWidth={isSelected || comp.hasError ? 2.5 : 1}
          cornerRadius={6}
          shadowBlur={isSelected ? 10 : 4}
          shadowColor={isSelected ? '#F59E0B' : '#00000033'}
          opacity={isPendingFrom ? 0.7 : 1}
        />

        {/* Component type label */}
        <Text
          text={comp.type === 'OpAmp' ? 'Op-Amp' : comp.type}
          fontSize={11}
          fontFamily="Inter, sans-serif"
          fill="white"
          width={80}
          height={20}
          align="center"
          y={5}
          listening={false}
        />

        {/* Component designator + value */}
        <Text
          text={comp.value !== undefined ? `${comp.label}: ${formatValue(comp.value, comp.unit)}` : comp.label}
          fontSize={9}
          fontFamily="Inter, sans-serif"
          fill="rgba(255,255,255,0.8)"
          width={80}
          height={16}
          align="center"
          y={24}
          listening={false}
        />

        {/* Error indicator */}
        {comp.hasError && (
          <Text text="⚠" fontSize={14} fill="#FF6B6B" x={64} y={-18} listening={false} />
        )}

        {/* Pins */}
        {pins.map(pin => {
          const isPendingFromPin =
            pendingConn?.componentId === comp.id && pendingConn?.pinId === pin.id;
          return (
            <Circle
              key={pin.id}
              x={pin.offsetX}
              y={pin.offsetY}
              radius={PIN_RADIUS}
              fill={isPendingFromPin ? '#FF6B6B' : '#2DD4BF'}
              stroke="white"
              strokeWidth={1.5}
              hitStrokeWidth={PIN_HIT_RADIUS}
              onClick={(e) => {
                e.cancelBubble = true;
                handlePinClick(comp.id, pin.id);
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = 'crosshair';
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = pendingConn ? 'crosshair' : 'default';
              }}
            />
          );
        })}
      </Group>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-100"
      style={{ backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {/* Wiring mode banner */}
      {pendingConn && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-500 text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none">
          🔴 Modo conexión — haz clic en el pin de destino · ESC para cancelar
        </div>
      )}

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        style={{ cursor: pendingConn ? 'crosshair' : 'default' }}
      >
        <Layer>
          {renderConnections()}
          {renderPendingWire()}
          {components.map(renderComponent)}
        </Layer>
      </Stage>
    </div>
  );
};

// Helper: format numeric value to human-readable string
function formatValue(value: number, unit?: string): string {
  if (!unit) return String(value);
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M${unit}`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}k${unit}`;
  if (Math.abs(value) < 1e-6) return `${(value * 1e9).toFixed(1)}n${unit}`;
  if (Math.abs(value) < 1e-3) return `${(value * 1e6).toFixed(1)}µ${unit}`;
  if (Math.abs(value) < 1) return `${(value * 1e3).toFixed(1)}m${unit}`;
  return `${value}${unit}`;
}

export default CircuitCanvas;
