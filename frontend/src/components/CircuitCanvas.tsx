import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Group, Circle, Line, Arrow, Text } from 'react-konva';
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
import {
  OpAmpSymbol,
  ResistorSymbol,
  CapacitorSymbol,
  VoltageSymbol,
  GroundSymbol,
} from './symbols';
import { CanvasToolbar } from './CanvasToolbar';

const PIN_RADIUS = 5;
const PIN_HOVER_RADIUS = 7;
const GRID_SIZE = 20;

export const CircuitCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const components = useSelector((state: RootState) => state.circuit.components);
  const connections = useSelector((state: RootState) => state.circuit.connections);
  const selectedId = useSelector((state: RootState) => state.circuit.selectedComponentId);
  const pendingConn = useSelector((state: RootState) => state.circuit.pendingConnection);
  const simResult = useSelector((state: RootState) => state.simulation.result);
  const waveformData = useSelector((state: RootState) => state.simulation.waveformData);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas Viewport & Navigation State
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Interactive Tools & Flags
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{ compId: string; pinId: string } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  // Animation Frame State (for Current Particles & Oscillating Glow)
  const [animTime, setAnimTime] = useState(0);

  // ── 1. ResizeObserver for 100% Adaptive Viewport ──────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── 2. 60 FPS Animation Loop ──────────────────────────────────────────────
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const renderLoop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isAnimationActive) {
        setAnimTime((prev) => (prev + delta) % 1000);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isAnimationActive]);

  // ── 3. Spacebar Panning Listener ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && (e.target as HTMLElement).tagName !== 'INPUT') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // ── 4. Zoom & Pan Handlers ────────────────────────────────────────────────
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.08;
    const newScale = e.evt.deltaY < 0
      ? Math.min(oldScale * scaleBy, 3.5)
      : Math.max(oldScale / scaleBy, 0.25);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStageScale(newScale);
    setStagePosition(newPos);
  }, []);

  const handleZoomIn = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const newScale = Math.min(stageScale * 1.2, 3.5);
    const center = { x: dimensions.width / 2, y: dimensions.height / 2 };
    const mousePointTo = {
      x: (center.x - stagePosition.x) / stageScale,
      y: (center.y - stagePosition.y) / stageScale,
    };
    setStageScale(newScale);
    setStagePosition({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  };

  const handleZoomOut = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const newScale = Math.max(stageScale / 1.2, 0.25);
    const center = { x: dimensions.width / 2, y: dimensions.height / 2 };
    const mousePointTo = {
      x: (center.x - stagePosition.x) / stageScale,
      y: (center.y - stagePosition.y) / stageScale,
    };
    setStageScale(newScale);
    setStagePosition({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    });
  };

  const handleZoomReset = () => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    if (components.length === 0) {
      handleZoomReset();
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    components.forEach((c) => {
      if (c.x < minX) minX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.x + 80 > maxX) maxX = c.x + 80;
      if (c.y + 40 > maxY) maxY = c.y + 40;
    });

    const PADDING = 80;
    const bboxW = (maxX - minX) + PADDING * 2;
    const bboxH = (maxY - minY) + PADDING * 2;

    const scaleX = dimensions.width / bboxW;
    const scaleY = dimensions.height / bboxH;
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.4), 1.6);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setStageScale(newScale);
    setStagePosition({
      x: dimensions.width / 2 - centerX * newScale,
      y: dimensions.height / 2 - centerY * newScale,
    });
  };

  // ── 5. Drag & Selection ───────────────────────────────────────────────────
  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    let finalX = e.target.x();
    let finalY = e.target.y();

    if (snapToGrid) {
      finalX = Math.round(finalX / GRID_SIZE) * GRID_SIZE;
      finalY = Math.round(finalY / GRID_SIZE) * GRID_SIZE;
      e.target.position({ x: finalX, y: finalY });
    }

    dispatch(updateComponentPosition({ id, x: finalX, y: finalY }));
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      dispatch(selectComponent(null));
      dispatch(cancelConnection());
    }
  };

  const handleMouseMove = () => {
    if (!pendingConn) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (pointer) {
      const canvasPos = {
        x: (pointer.x - stagePosition.x) / stageScale,
        y: (pointer.y - stagePosition.y) / stageScale,
      };
      setMousePos(canvasPos);
    }
  };

  const handlePinClick = (componentId: string, pinId: string) => {
    if (!pendingConn) {
      dispatch(startConnection({ componentId, pinId }));
    } else {
      dispatch(completeConnection({ componentId, pinId }));
      setMousePos(null);
    }
  };

  // ── 6. Export PNG Handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleExport = (e: Event) => {
      const customEvent = e as CustomEvent;
      const stage = stageRef.current;
      if (!stage) return;
      const dataURL = stage.toDataURL({ pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${customEvent.detail?.name || 'circuito'}.png`;
      a.click();
    };
    window.addEventListener('export-png', handleExport);
    return () => window.removeEventListener('export-png', handleExport);
  }, []);

  // ── 7. Render Connections & Dynamic Current Particles ─────────────────────
  const renderConnections = () => {
    return connections.map((conn, idx) => {
      const fromComp = components.find((c) => c.id === conn.fromComponentId);
      const toComp = components.find((c) => c.id === conn.toComponentId);
      if (!fromComp || !toComp) return null;

      const fromPos = getPinAbsolutePosition(fromComp, conn.fromPinId);
      const toPos = getPinAbsolutePosition(toComp, conn.toPinId);
      if (!fromPos || !toPos) return null;

      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const wireLength = Math.sqrt(dx * dx + dy * dy);

      // Interpolate wire voltage & current speed
      let v1 = 0;
      let v2 = 0;

      if (simResult) {
        // DC simulated voltages
        v1 = simResult.nodeVoltages[1] ?? 0;
        v2 = simResult.nodeVoltages[2] ?? 0;
      } else if (waveformData && waveformData.timePoints.length > 0) {
        // Transient animation sample
        const tLen = waveformData.timePoints.length;
        const sampleIdx = Math.floor((animTime * 60) % tLen);
        const wfKeys = Object.keys(waveformData.nodeWaveforms);
        v1 = waveformData.nodeWaveforms[Number(wfKeys[0])] ? waveformData.nodeWaveforms[Number(wfKeys[0])][sampleIdx] : 0;
        v2 = waveformData.nodeWaveforms[Number(wfKeys[1])] ? waveformData.nodeWaveforms[Number(wfKeys[1])][sampleIdx] : 0;
      }

      const avgV = (v1 + v2) / 2;
      const wireStroke =
        avgV > 1 ? '#10b981' : avgV < -1 ? '#f43f5e' : '#06b6d4';
      const wireGlow =
        avgV > 1 ? 'rgba(16, 185, 129, 0.4)' : avgV < -1 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.3)';

      // Calculate 3 moving particles per wire
      const particleCount = Math.max(1, Math.min(4, Math.floor(wireLength / 40)));
      const particles = [];

      if (isAnimationActive && wireLength > 5) {
        const speed = (animTime * 1.5) % 1; // 0 to 1
        for (let p = 0; p < particleCount; p++) {
          const t = (speed + p / particleCount) % 1;
          const px = fromPos.x + dx * t;
          const py = fromPos.y + dy * t;
          particles.push({ x: px, y: py });
        }
      }

      return (
        <Group key={conn.id || idx}>
          {/* Outer wire glow */}
          <Line
            points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
            stroke={wireStroke}
            strokeWidth={3}
            lineCap="round"
            shadowBlur={6}
            shadowColor={wireGlow}
          />
          {/* Core wire trace */}
          <Line
            points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
            stroke="#e0f2fe"
            strokeWidth={1.2}
            lineCap="round"
          />

          {/* Glowing Current Particles */}
          {particles.map((p, pIdx) => (
            <Circle
              key={pIdx}
              x={p.x}
              y={p.y}
              radius={2.5}
              fill="#ffffff"
              shadowBlur={6}
              shadowColor="#38bdf8"
            />
          ))}
        </Group>
      );
    });
  };

  // ── 8. Render Pending Connection Arrow ────────────────────────────────────
  const renderPendingWire = () => {
    if (!pendingConn || !mousePos) return null;
    const fromComp = components.find((c) => c.id === pendingConn.componentId);
    if (!fromComp) return null;
    const fromPos = getPinAbsolutePosition(fromComp, pendingConn.pinId);
    if (!fromPos) return null;

    return (
      <Arrow
        points={[fromPos.x, fromPos.y, mousePos.x, mousePos.y]}
        stroke="#f43f5e"
        strokeWidth={2.5}
        fill="#f43f5e"
        pointerLength={10}
        pointerWidth={8}
        dash={[8, 4]}
        shadowBlur={8}
        shadowColor="rgba(244, 63, 94, 0.6)"
      />
    );
  };

  // ── 9. Render Canonical Electronic Component ──────────────────────────────
  const renderComponent = (comp: typeof components[0]) => {
    const isSelected = comp.id === selectedId;
    const isPendingFrom = pendingConn?.componentId === comp.id;
    const pins = COMPONENT_PINS[comp.type] || [];

    const renderSymbol = () => {
      switch (comp.type) {
        case 'OpAmp':
          return <OpAmpSymbol component={comp} isSelected={isSelected} />;
        case 'Resistor':
          return <ResistorSymbol component={comp} isSelected={isSelected} />;
        case 'Capacitor':
          return <CapacitorSymbol component={comp} isSelected={isSelected} />;
        case 'Voltage':
          return <VoltageSymbol component={comp} isSelected={isSelected} />;
        case 'Ground':
          return <GroundSymbol component={comp} isSelected={isSelected} />;
        default:
          return null;
      }
    };

    return (
      <Group
        key={comp.id}
        x={comp.x}
        y={comp.y}
        draggable={!pendingConn && !isPanning && !isSpacePressed}
        onDragEnd={(e) => handleDragEnd(e, comp.id)}
        onClick={(e) => {
          e.cancelBubble = true;
          if (!pendingConn) dispatch(selectComponent(comp.id));
        }}
        opacity={isPendingFrom ? 0.7 : 1}
      >
        {/* Canonical IEEE/IEC Vector Symbol */}
        {renderSymbol()}

        {/* Error Indicator Badge */}
        {comp.hasError && (
          <Group x={66} y={-16}>
            <Circle radius={7} fill="#f43f5e" shadowBlur={6} shadowColor="#f43f5e" />
            <Text text="!" fontSize={10} fontStyle="bold" fill="white" x={-2.5} y={-5} listening={false} />
          </Group>
        )}

        {/* Magnetic Interactive Connection Pins */}
        {pins.map((pin) => {
          const isPendingFromPin =
            pendingConn?.componentId === comp.id && pendingConn?.pinId === pin.id;
          const isHovered =
            hoveredPin?.compId === comp.id && hoveredPin?.pinId === pin.id;

          const pinFill = isPendingFromPin ? '#f43f5e' : isHovered ? '#38bdf8' : '#06b6d4';

          return (
            <Group key={pin.id} x={pin.offsetX} y={pin.offsetY}>
              {/* Glowing Halo on Hover / Wire Drag */}
              {(isHovered || pendingConn) && (
                <Circle
                  radius={PIN_HOVER_RADIUS + 4}
                  fill="transparent"
                  stroke={isPendingFromPin ? '#f43f5e' : '#38bdf8'}
                  strokeWidth={1.5}
                  dash={[3, 2]}
                  opacity={0.8}
                />
              )}

              {/* Pin Terminal Dot */}
              <Circle
                radius={isHovered ? PIN_HOVER_RADIUS : PIN_RADIUS}
                fill={pinFill}
                stroke="#ffffff"
                strokeWidth={1.5}
                hitStrokeWidth={18}
                shadowBlur={isHovered ? 12 : 4}
                shadowColor={pinFill}
                onClick={(e) => {
                  e.cancelBubble = true;
                  handlePinClick(comp.id, pin.id);
                }}
                onMouseEnter={() => setHoveredPin({ compId: comp.id, pinId: pin.id })}
                onMouseLeave={() => setHoveredPin(null)}
              />
            </Group>
          );
        })}
      </Group>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full relative overflow-hidden bg-[#0a0f1d] select-none"
      style={{
        backgroundImage: `
          radial-gradient(circle, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
          radial-gradient(circle, rgba(56, 189, 248, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`,
      }}
    >
      {/* Floating Canvas Toolbar */}
      <CanvasToolbar
        zoom={stageScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFitToScreen={handleFitToScreen}
        isAnimationActive={isAnimationActive}
        onToggleAnimation={() => setIsAnimationActive(!isAnimationActive)}
        snapToGrid={snapToGrid}
        onToggleGrid={() => setSnapToGrid(!snapToGrid)}
      />

      {/* Wiring mode banner */}
      {pendingConn && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-rose-600/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border border-rose-400/40 flex items-center gap-2 pointer-events-none animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          Modo Conexión — Haz clic en el terminal de destino · ESC para cancelar
        </div>
      )}

      {/* Main Konva Stage */}
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        draggable={isSpacePressed}
        onDragStart={() => setIsPanning(true)}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setStagePosition({ x: e.target.x(), y: e.target.y() });
            setIsPanning(false);
          }
        }}
        style={{
          cursor: isSpacePressed
            ? isPanning ? 'grabbing' : 'grab'
            : pendingConn ? 'crosshair' : 'default',
        }}
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

export default CircuitCanvas;
