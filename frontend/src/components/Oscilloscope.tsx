import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleChannel, toggleOscilloscope } from '../store/simulationSlice';

const CHANNEL_COLORS = ['#2DD4BF', '#F59E0B', '#A78BFA', '#FB7185'];
const GRID_COLOR = 'rgba(255,255,255,0.07)';
const AXIS_COLOR = 'rgba(255,255,255,0.2)';

const formatTime = (s: number): string => {
  if (s >= 1) return `${s.toFixed(2)} s`;
  if (s >= 1e-3) return `${(s * 1e3).toFixed(2)} ms`;
  if (s >= 1e-6) return `${(s * 1e6).toFixed(2)} µs`;
  return `${(s * 1e9).toFixed(2)} ns`;
};

const formatVoltage = (v: number): string => {
  if (Math.abs(v) >= 1) return `${v.toFixed(2)} V`;
  if (Math.abs(v) >= 1e-3) return `${(v * 1e3).toFixed(2)} mV`;
  return `${(v * 1e6).toFixed(2)} µV`;
};

const Oscilloscope: React.FC = () => {
  const dispatch = useDispatch();
  const waveformData = useSelector((s: RootState) => s.simulation.waveformData);
  const activeChannels = useSelector((s: RootState) => s.simulation.activeChannels);
  const oscilloscopeVisible = useSelector((s: RootState) => s.simulation.oscilloscopeVisible);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };

  useEffect(() => {
    if (!waveformData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const plotW = W - PADDING.left - PADDING.right;
    const plotH = H - PADDING.top - PADDING.bottom;

    // Clear
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, W, H);

    // Compute Y range across all active channels
    let yMin = Infinity, yMax = -Infinity;
    activeChannels.forEach(ch => {
      const wf = waveformData.nodeWaveforms[ch];
      if (!wf) return;
      wf.forEach(v => { if (v < yMin) yMin = v; if (v > yMax) yMax = v; });
    });
    if (!isFinite(yMin) || !isFinite(yMax)) { yMin = -1; yMax = 1; }
    if (Math.abs(yMax - yMin) < 1e-9) { yMin -= 0.5; yMax += 0.5; }
    const yPad = (yMax - yMin) * 0.1;
    yMin -= yPad; yMax += yPad;

    const tStart = waveformData.timePoints[0];
    const tEnd = waveformData.timePoints[waveformData.timePoints.length - 1];

    const toCanvasX = (t: number) =>
      PADDING.left + ((t - tStart) / (tEnd - tStart)) * plotW;
    const toCanvasY = (v: number) =>
      PADDING.top + (1 - (v - yMin) / (yMax - yMin)) * plotH;

    // Grid (10x8)
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = PADDING.left + (i / 10) * plotW;
      ctx.beginPath(); ctx.moveTo(x, PADDING.top); ctx.lineTo(x, PADDING.top + plotH); ctx.stroke();
    }
    for (let i = 0; i <= 8; i++) {
      const y = PADDING.top + (i / 8) * plotH;
      ctx.beginPath(); ctx.moveTo(PADDING.left, y); ctx.lineTo(PADDING.left + plotW, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 1.5;
    // Y axis
    ctx.beginPath();
    ctx.moveTo(PADDING.left, PADDING.top);
    ctx.lineTo(PADDING.left, PADDING.top + plotH);
    ctx.stroke();
    // X axis (at V=0 if in range, else at bottom)
    const zeroY = yMin < 0 && yMax > 0 ? toCanvasY(0) : PADDING.top + plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING.left, zeroY);
    ctx.lineTo(PADDING.left + plotW, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const v = yMin + (i / 4) * (yMax - yMin);
      const y = toCanvasY(v);
      ctx.fillText(formatVoltage(v), PADDING.left - 5, y + 4);
    }

    // X axis labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const t = tStart + (i / 5) * (tEnd - tStart);
      const x = toCanvasX(t);
      ctx.fillText(formatTime(t), x, PADDING.top + plotH + 16);
    }

    // Plot waveforms
    activeChannels.forEach((ch, ci) => {
      const wf = waveformData.nodeWaveforms[ch];
      if (!wf || wf.length === 0) return;
      const color = CHANNEL_COLORS[ci % CHANNEL_COLORS.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      waveformData.timePoints.forEach((t, i) => {
        const x = toCanvasX(t);
        const y = toCanvasY(wf[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    // Cursor line
    if (cursorX !== null) {
      const rect = canvas.getBoundingClientRect();
      const relX = cursorX - rect.left;
      if (relX >= PADDING.left && relX <= PADDING.left + plotW) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(relX, PADDING.top);
        ctx.lineTo(relX, PADDING.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [waveformData, activeChannels, cursorX]);

  if (!waveformData || !oscilloscopeVisible) return null;

  const tStart = waveformData.timePoints[0];
  const tEnd = waveformData.timePoints[waveformData.timePoints.length - 1];
  const allNodes = Object.keys(waveformData.nodeWaveforms).map(Number).filter(n => n !== 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const plotW = canvas.width - 80;
    const t = tStart + ((relX - 60) / plotW) * (tEnd - tStart);
    setHoveredTime(t >= tStart && t <= tEnd ? t : null);
    setCursorX(e.clientX);
  };

  return (
    <div className="absolute bottom-10 left-0 right-0 mx-auto w-[760px] bg-gray-950 rounded-xl border border-gray-700 shadow-2xl z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">⊡ Osciloscopio Virtual</span>
          <span className="text-xs text-gray-500 font-mono">
            {formatTime(tStart)} → {formatTime(tEnd)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hoveredTime !== null && (
            <span className="text-xs font-mono text-yellow-400 mr-2">t = {formatTime(hoveredTime)}</span>
          )}
          <button
            onClick={() => dispatch(toggleOscilloscope())}
            className="text-gray-400 hover:text-white text-lg leading-none px-1"
          >×</button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={760}
        height={260}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredTime(null); setCursorX(null); }}
        className="block w-full"
        style={{ cursor: 'crosshair' }}
      />

      {/* Channel selector */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-t border-gray-700 flex-wrap">
        <span className="text-xs text-gray-500 font-semibold">Canales:</span>
        {allNodes.map((nodeId, ci) => {
          const label = waveformData.nodeLabels[nodeId] ?? `N${nodeId}`;
          const color = CHANNEL_COLORS[ci % CHANNEL_COLORS.length];
          const isActive = activeChannels.includes(nodeId);
          // Get current value (last point)
          const lastVal = waveformData.nodeWaveforms[nodeId]?.at(-1) ?? 0;
          return (
            <button
              key={nodeId}
              onClick={() => dispatch(toggleChannel(nodeId))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                isActive
                  ? 'border-current text-white opacity-100'
                  : 'border-gray-600 text-gray-500 opacity-50'
              }`}
              style={{ borderColor: isActive ? color : undefined, color: isActive ? color : undefined }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label} = {formatVoltage(lastVal)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Oscilloscope;
