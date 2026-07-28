import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleOscilloscope } from '../store/simulationSlice';

const CHANNEL_COLORS = ['#4ade80', '#fbbf24', '#38bdf8', '#f472b6']; // Green, Yellow, Blue, Pink
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
  const oscilloscopeVisible = useSelector((s: RootState) => s.simulation.oscilloscopeVisible);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  
  // Array of node IDs assigned to CH1, CH2, CH3, CH4
  const [channels, setChannels] = useState<(number | null)[]>([null, null, null, null]);

  // Auto-assign first nodes on load if empty
  useEffect(() => {
    if (waveformData && channels.every(c => c === null)) {
      const nodes = Object.keys(waveformData.nodeWaveforms).map(Number).filter(n => n !== 0);
      setChannels([
        nodes[0] ?? null,
        nodes[1] ?? null,
        null,
        null
      ]);
    }
  }, [waveformData]);

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
    ctx.fillStyle = '#0f172a'; // Slate 900
    ctx.fillRect(0, 0, W, H);

    // Compute Y range across assigned channels
    let yMin = Infinity, yMax = -Infinity;
    channels.forEach(ch => {
      if (ch === null) return;
      const wf = waveformData.nodeWaveforms[ch];
      if (!wf) return;
      wf.forEach(v => { if (v < yMin) yMin = v; if (v > yMax) yMax = v; });
    });
    
    if (!isFinite(yMin) || !isFinite(yMax)) { yMin = -5; yMax = 5; }
    if (Math.abs(yMax - yMin) < 1e-9) { yMin -= 2; yMax += 2; }

    const yRange = yMax - yMin;
    const yMargin = yRange * 0.1;
    yMin -= yMargin;
    yMax += yMargin;
    const yScale = plotH / (yMax - yMin);

    const tPts = waveformData.timePoints;
    const tStart = tPts[0];
    const tEnd = tPts[tPts.length - 1];
    const tRange = tEnd - tStart;
    if (tRange <= 0) return;

    // Draw Grid
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    const V_LINES = 10;
    for (let i = 0; i <= V_LINES; i++) {
      const x = PADDING.left + (i / V_LINES) * plotW;
      ctx.moveTo(x, PADDING.top);
      ctx.lineTo(x, H - PADDING.bottom);
    }
    const H_LINES = 8;
    for (let i = 0; i <= H_LINES; i++) {
      const y = PADDING.top + (i / H_LINES) * plotH;
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(W - PADDING.right, y);
    }
    ctx.stroke();

    // Zero axis
    if (0 >= yMin && 0 <= yMax) {
      const yZero = PADDING.top + plotH - (0 - yMin) * yScale;
      ctx.beginPath();
      ctx.strokeStyle = AXIS_COLOR;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(PADDING.left, yZero);
      ctx.lineTo(W - PADDING.right, yZero);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Y labels
    ctx.fillStyle = '#64748B'; // slate-500
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= H_LINES; i++) {
      const y = PADDING.top + (i / H_LINES) * plotH;
      const v = yMax - (i / H_LINES) * (yMax - yMin);
      ctx.fillText(formatVoltage(v), PADDING.left - 8, y);
    }

    // X labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= V_LINES; i++) {
      const x = PADDING.left + (i / V_LINES) * plotW;
      const t = tStart + (i / V_LINES) * tRange;
      ctx.fillText(formatTime(t), x, H - PADDING.bottom + 8);
    }

    // Draw Waveforms
    channels.forEach((nodeId, idx) => {
      if (nodeId === null) return;
      const wf = waveformData.nodeWaveforms[nodeId];
      if (!wf) return;
      
      const color = CHANNEL_COLORS[idx];
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      wf.forEach((v, i) => {
        const x = PADDING.left + ((tPts[i] - tStart) / tRange) * plotW;
        const y = PADDING.top + plotH - (v - yMin) * yScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw Cursor
    if (cursorX !== null && hoveredTime !== null) {
      ctx.beginPath();
      ctx.strokeStyle = '#FCD34D';
      ctx.lineWidth = 1;
      ctx.moveTo(cursorX, PADDING.top);
      ctx.lineTo(cursorX, H - PADDING.bottom);
      ctx.stroke();

      // Draw values at cursor
      channels.forEach((nodeId, idx) => {
        if (nodeId === null) return;
        const wf = waveformData.nodeWaveforms[nodeId];
        if (!wf) return;
        
        let closestIdx = 0;
        let minDiff = Infinity;
        tPts.forEach((t, i) => {
          const d = Math.abs(t - hoveredTime);
          if (d < minDiff) { minDiff = d; closestIdx = i; }
        });
        
        const v = wf[closestIdx];
        const y = PADDING.top + plotH - (v - yMin) * yScale;
        
        ctx.fillStyle = CHANNEL_COLORS[idx];
        ctx.beginPath();
        ctx.arc(cursorX, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.stroke();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${formatVoltage(v)}`, cursorX + 8, y);
      });
    }

  }, [waveformData, channels, hoveredTime, cursorX]);

  if (!waveformData || !oscilloscopeVisible) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x >= PADDING.left && x <= canvas.width - PADDING.right) {
      setCursorX(x);
      const tPts = waveformData.timePoints;
      const tRange = tPts[tPts.length - 1] - tPts[0];
      const t = tPts[0] + ((x - PADDING.left) / (canvas.width - PADDING.left - PADDING.right)) * tRange;
      setHoveredTime(t);
    } else {
      setHoveredTime(null);
      setCursorX(null);
    }
  };

  const allNodes = Object.keys(waveformData.nodeWaveforms).map(Number).filter(n => n !== 0);

  const handleChannelChange = (idx: number, nodeIdStr: string) => {
    const newChannels = [...channels];
    newChannels[idx] = nodeIdStr === 'OFF' ? null : Number(nodeIdStr);
    setChannels(newChannels);
  };

  return (
    <div className="absolute bottom-10 left-0 right-0 mx-auto w-[800px] bg-gray-900 rounded-xl border border-gray-700 shadow-2xl z-30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-blue-500 inline-block animate-pulse"></span>
            Osciloscopio
          </span>
        </div>
        <div className="flex items-center gap-4">
          {hoveredTime !== null && (
            <span className="text-xs font-mono text-yellow-400 bg-gray-900 px-2 py-1 rounded">t = {formatTime(hoveredTime)}</span>
          )}
          <button
            onClick={() => dispatch(toggleOscilloscope())}
            className="text-gray-400 hover:text-white text-lg leading-none"
          >×</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-[#0f172a] p-1">
        <canvas
          ref={canvasRef}
          width={790}
          height={280}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredTime(null); setCursorX(null); }}
          className="block w-full rounded"
          style={{ cursor: 'crosshair' }}
        />
      </div>

      {/* Channel Config Panel */}
      <div className="flex items-center px-4 py-3 bg-gray-800 border-t border-gray-700 gap-4">
        {[1, 2, 3, 4].map((ch, i) => {
          const color = CHANNEL_COLORS[i];
          const assignedNode = channels[i];
          const lastVal = assignedNode !== null ? waveformData.nodeWaveforms[assignedNode]?.at(-1) : null;
          
          return (
            <div key={ch} className="flex-1 flex flex-col gap-1 border-r border-gray-700 last:border-0 pr-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color }}>CH{ch}</span>
                {lastVal !== null && lastVal !== undefined && (
                  <span className="text-[10px] font-mono text-gray-400">{formatVoltage(lastVal)}</span>
                )}
              </div>
              <select
                className="bg-gray-900 border border-gray-600 text-xs text-gray-300 rounded px-1 py-1 w-full outline-none"
                value={assignedNode === null ? 'OFF' : assignedNode.toString()}
                onChange={(e) => handleChannelChange(i, e.target.value)}
              >
                <option value="OFF">Apagado</option>
                {allNodes.map(n => (
                  <option key={n} value={n}>
                    {waveformData.nodeLabels[n] ?? `Nodo ${n}`}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Oscilloscope;
