import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SimulationResult } from '../simulation/types';
import type { WaveformData } from '../simulation/TransientSolver';

type SimulationStatus = 'idle' | 'running' | 'success' | 'error';

interface SimulationState {
  status: SimulationStatus;
  result: SimulationResult | null;
  error: string | null;
  nodeVoltageMap: Record<number, number>;
  // Transient
  waveformData: WaveformData | null;
  oscilloscopeVisible: boolean;
  activeChannels: number[]; // node ids to display
}

const initialState: SimulationState = {
  status: 'idle',
  result: null,
  error: null,
  nodeVoltageMap: {},
  waveformData: null,
  oscilloscopeVisible: false,
  activeChannels: [],
};

export const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    startSimulation: (state) => {
      state.status = 'running';
      state.error = null;
    },
    simulationSuccess: (state, action: PayloadAction<SimulationResult>) => {
      state.status = 'success';
      state.result = action.payload;
      state.nodeVoltageMap = action.payload.nodeVoltages;
      state.error = null;
    },
    simulationError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.result = null;
    },
    resetSimulation: (state) => {
      state.status = 'idle';
      state.result = null;
      state.error = null;
      state.nodeVoltageMap = {};
      state.waveformData = null;
      state.oscilloscopeVisible = false;
    },
    transientSuccess: (state, action: PayloadAction<WaveformData>) => {
      state.status = 'success';
      state.waveformData = action.payload;
      state.oscilloscopeVisible = true;
      // Auto-select all non-GND nodes as channels (max 4)
      state.activeChannels = Object.keys(action.payload.nodeWaveforms)
        .map(Number)
        .filter(n => n !== 0)
        .slice(0, 4);
    },
    toggleChannel: (state, action: PayloadAction<number>) => {
      const idx = state.activeChannels.indexOf(action.payload);
      if (idx === -1) state.activeChannels.push(action.payload);
      else state.activeChannels.splice(idx, 1);
    },
    toggleOscilloscope: (state) => {
      state.oscilloscopeVisible = !state.oscilloscopeVisible;
    },
  },
});

export const {
  startSimulation, simulationSuccess, simulationError, resetSimulation,
  transientSuccess, toggleChannel, toggleOscilloscope,
} = simulationSlice.actions;

export default simulationSlice.reducer;
