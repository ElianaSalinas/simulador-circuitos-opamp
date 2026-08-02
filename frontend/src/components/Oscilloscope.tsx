import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleOscilloscope } from '../store/simulationSlice';

const CHANNEL_COLORS = ['#38bdf8', '#4ade80', '#fbbf24', '#f472b6']; // Cyan, Green, Yellow, Pink
const GRID_COLOR = 'rgba(255, 255, 255, 0.07)';
const AXIS_COLOR = 'rgba(255, 255, 255, 0.2)';

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

const computeMetrics = (timePoints: number[], wf: number[] | undefined) => {
  if (!wf || wf.length === 0) return null;
  let min = Infinity, max = -Infinity, sumSquares = 0;
  for (let i = 0; i < wf.length; i++) {
    const val = wf[i];
    if (val < min) min = val;
    if (val > max) max = val;
    sumSquares += val * val;
  }
  const vpp = max - min;
  const vrms = Math.sqrt(sumSquares / wf.length);
  const mid = (max + min) / 2;

  let crossings = 0;
  let firstT = 0;
  let lastT = 0;

  for (let i = 1; i < wf.length; i++) {
    if (wf[i - 1] < mid && wf[i] >= mid) {
      if (crossings === 0) firstT = timePoints[i];
      lastT = timePoints[i];
      crossings++;
    }
  }

  let freq = 0;
  if (crossings > 1 && lastT > firstT) {
    freq = (crossings - 1) / (lastT - firstT);
  }

  return { min, max, vpp, vrms, freq };
};

const Oscilloscope: React.FC = () => {
  const dispatch = useDispatch();
  const waveformData = useSelector((s: RootState) => s.simulation.waveformData);
  const oscilloscopeVisible = useSelector((s: RootState) => s.simulation.oscilloscopeVisible);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  // Channels assignment
  const [channels, setChannels] = useState<(number | null)[]>([null, null, null, null]);

  // Live Continuous Sweep & Playback controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [sweepProgress, setSweepProgress] = useState(0); // 0 to 1

  // Draggable window state
  const [windowPos, setWindowPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);

  // Smart Auto-assign nodes when waveformData is loaded or changed
  useEffect(() => {
    if (waveformData) {
      const nodes = Object.keys(waveformData.nodeWaveforms)
        .map(Number)
        .filter((n) => n !== 0);

      const scoredNodes = [...nodes].sort((a, b) => {
        const labelA = waveformData.nodeLabels[a] || '';
        const labelB = waveformData.nodeLabels[b] || '';
        const getScore = (label: string) => {
          if (label.includes('.out') || label.includes('out')) return 3;
          if (label.includes('.in-') || label.includes('in-') || label.includes('C1')) return 2;
          if (label.includes('.in+') || label.includes('in+')) return 1;
          return 0;
        };
        return getScore(labelB) - getScore(labelA);
      });

      setChannels([
        scoredNodes[0] ?? null,
        scoredNodes[1] ?? null,
        scoredNodes[2] ?? null,
        scoredNodes[3] ?? null,
      ]);
    }
  }, [waveformData]);

  // 60 FPS Sweep Animation Loop
  useEffect(() => {
    if (!isPlaying || !oscilloscopeVisible) return;

    let frameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setSweepProgress((prev) => (prev + delta * 0.4 * speedMultiplier) % 1);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, speedMultiplier, oscilloscopeVisible]);

  const PADDING = { top: 20, right: 20, bottom: 40, left: 65 };

  // Canvas Drawing Effect
  useEffect(() => {
    if (!waveformData || !canvasRef.current || !oscilloscopeVisible) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const plotW = W - PADDING.left - PADDING.right;
    const plotH = H - PADDING.top - PADDING.bottom;

    // Clear Canvas with phosphor CRT dark slate
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, W, H);

    // Compute Y range across assigned channels
    let yMin = Infinity, yMax = -Infinity;
    channels.forEach((ch) => {
      if (ch === null) return;
      const wf = waveformData.nodeWaveforms[ch];
      if (!wf) return;
      wf.forEach((v) => {
        if (v < yMin) yMin = v;
        if (v > yMax) yMax = v;
      });
    });

    if (!isFinite(yMin) || !isFinite(yMax)) {
      yMin = -5;
      yMax = 5;
    }
    if (Math.abs(yMax - yMin) < 1e-9) {
      yMin -= 2;
      yMax += 2;
    }

    const yRange = yMax - yMin;
    const yMargin = yRange * 0.12;
    yMin -= yMargin;
    yMax += yMargin;
    const yScale = plotH / (yMax - yMin);

    const tPts = waveformData.timePoints;
    const tStart = tPts[0];
    const tEnd = tPts[tPts.length - 1];
    const tRange = tEnd - tStart;
    if (tRange <= 0) return;

    // Grid lines
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

    // 0V Axis
    if (0 >= yMin && 0 <= yMax) {
      const yZero = PADDING.top + plotH - (0 - yMin) * yScale;
      ctx.beginPath();
      ctx.strokeStyle = AXIS_COLOR;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(PADDING.left, yZero);
      ctx.lineTo(W - PADDING.right, yZero);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Y labels (Voltages)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= H_LINES; i++) {
      const y = PADDING.top + (i / H_LINES) * plotH;
      const v = yMax - (i / H_LINES) * (yMax - yMin);
      ctx.fillText(formatVoltage(v), PADDING.left - 8, y);
    }

    // X labels (Time)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= V_LINES; i++) {
      const x = PADDING.left + (i / V_LINES) * plotW;
      const t = tStart + (i / V_LINES) * tRange;
      ctx.fillText(formatTime(t), x, H - PADDING.bottom + 8);
    }

    // Draw Channel Waveforms
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

      // Phosphor Glow Effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Continuous Live Sweep Line (Beam)
    if (isPlaying) {
      const sweepX = PADDING.left + sweepProgress * plotW;

      // Glowing vertical sweep line
      const gradient = ctx.createLinearGradient(sweepX - 25, 0, sweepX + 5, 0);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
      gradient.addColorStop(0.85, 'rgba(56, 189, 248, 0.15)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.9)');

      ctx.fillStyle = gradient;
      ctx.fillRect(sweepX - 25, PADDING.top, 25, plotH);

      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.moveTo(sweepX, PADDING.top);
      ctx.lineTo(sweepX, H - PADDING.bottom);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Static Hover Cursor
    if (cursorX !== null && hoveredTime !== null) {
      ctx.beginPath();
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 1;
      ctx.moveTo(cursorX, PADDING.top);
      ctx.lineTo(cursorX, H - PADDING.bottom);
      ctx.stroke();

      channels.forEach((nodeId, idx) => {
        if (nodeId === null) return;
        const wf = waveformData.nodeWaveforms[nodeId];
        if (!wf) return;

        let closestIdx = 0;
        let minDiff = Infinity;
        tPts.forEach((t, i) => {
          const d = Math.abs(t - hoveredTime);
          if (d < minDiff) {
            minDiff = d;
            closestIdx = i;
          }
        });

        const v = wf[closestIdx];
        const y = PADDING.top + plotH - (v - yMin) * yScale;

        ctx.fillStyle = CHANNEL_COLORS[idx];
        ctx.beginPath();
        ctx.arc(cursorX, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(`${formatVoltage(v)}`, cursorX + 8, y);
      });
    }
  }, [waveformData, channels, hoveredTime, cursorX, sweepProgress, isPlaying, oscilloscopeVisible]);

  if (!waveformData || !oscilloscopeVisible) return null;

  // Window drag handlers
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'SELECT') return;
    setIsDraggingWindow(true);
    setDragOffset({
      x: e.clientX - windowPos.x,
      y: e.clientY - windowPos.y,
    });
  };

  const handleMouseMoveWindow = (e: React.MouseEvent) => {
    if (!isDraggingWindow) return;
    setWindowPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUpWindow = () => setIsDraggingWindow(false);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

  const allNodes = Object.keys(waveformData.nodeWaveforms)
    .map(Number)
    .filter((n) => n !== 0);

  const handleChannelChange = (idx: number, nodeIdStr: string) => {
    const newChannels = [...channels];
    newChannels[idx] = nodeIdStr === 'OFF' ? null : Number(nodeIdStr);
    setChannels(newChannels);
  };

  return (
    <div
      onMouseMove={handleMouseMoveWindow}
      onMouseUp={handleMouseUpWindow}
      style={{
        transform: `translate(${windowPos.x}px, ${windowPos.y}px)`,
      }}
      className={`absolute bottom-6 left-0 right-0 mx-auto z-30 transition-shadow ${
        isMaximized ? 'w-[96vw] max-w-[1200px]' : 'w-[880px]'
      } bg-slate-950/95 backdrop-blur-xl rounded-2xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden select-none`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-700/80 cursor-move"
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]"></span>
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Osciloscopio Digital de 4 Canales
          </span>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            {isPlaying ? '● EN VIVO' : '❚❚ PAUSADO'}
          </span>
        </div>

        {/* Top Controls: Play/Pause, Speed, Cursor time, Minimize */}
        <div className="flex items-center gap-3">
          {/* Live Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
              isPlaying
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
            }`}
          >
            {isPlaying ? '⏸ Pausa' : '▶ Reanudar'}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeedMultiplier(s)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-colors ${
                  speedMultiplier === s
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Cursor Time Display */}
          {hoveredTime !== null && (
            <span className="text-xs font-mono text-yellow-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
              t = {formatTime(hoveredTime)}
            </span>
          )}

          {/* Maximize Toggle */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            {isMaximized ? '🗗 Reducir' : '🗖 Expandir'}
          </button>

          {/* Close Button */}
          <button
            onClick={() => dispatch(toggleOscilloscope())}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-rose-600/80 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Screen Canvas */}
      <div className="bg-[#090d16] p-2">
        <canvas
          ref={canvasRef}
          width={isMaximized ? 1160 : 860}
          height={isMaximized ? 320 : 250}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => {
            setHoveredTime(null);
            setCursorX(null);
          }}
          className="block w-full rounded-lg"
          style={{ cursor: 'crosshair' }}
        />
      </div>

      {/* Channel Controls & Real-Time Telemetry Cards */}
      <div className="grid grid-cols-4 px-3 py-2.5 bg-slate-900 border-t border-slate-700/80 gap-2.5">
        {[0, 1, 2, 3].map((i) => {
          const color = CHANNEL_COLORS[i];
          const assignedNode = channels[i];
          const wf = assignedNode !== null ? waveformData.nodeWaveforms[assignedNode] : undefined;
          const metrics = computeMetrics(waveformData.timePoints, wf);

          return (
            <div
              key={i}
              className="flex flex-col gap-1.5 p-2 bg-slate-950/70 rounded-xl border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono flex items-center gap-1.5" style={{ color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                  CH{i + 1}
                </span>
                {metrics && metrics.freq > 0 ? (
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {metrics.freq >= 1000
                      ? `${(metrics.freq / 1000).toFixed(2)} kHz`
                      : `${metrics.freq.toFixed(1)} Hz`}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">--</span>
                )}
              </div>

              <select
                className="bg-slate-900 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2 py-1 w-full outline-none focus:border-cyan-500 truncate font-mono"
                value={assignedNode === null ? 'OFF' : assignedNode.toString()}
                onChange={(e) => handleChannelChange(i, e.target.value)}
              >
                <option value="OFF">-- Desactivado --</option>
                {allNodes.map((n) => (
                  <option key={n} value={n}>
                    {waveformData.nodeLabels[n] ?? `Nodo ${n}`}
                  </option>
                ))}
              </select>

              {/* Real-time Measurements */}
              {metrics ? (
                <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <div>Vpp: <span className="text-slate-100 font-semibold">{formatVoltage(metrics.vpp)}</span></div>
                  <div>Vrms: <span className="text-slate-100 font-semibold">{formatVoltage(metrics.vrms)}</span></div>
                  <div>Vmax: <span className="text-slate-100 font-semibold">{formatVoltage(metrics.max)}</span></div>
                  <div>Vmin: <span className="text-slate-100 font-semibold">{formatVoltage(metrics.min)}</span></div>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-slate-500 italic pt-1 border-t border-slate-800/80">
                  Canal apagado
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Oscilloscope;
