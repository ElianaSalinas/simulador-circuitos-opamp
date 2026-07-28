import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SimulationResult } from '../simulation/types';

type SimulationStatus = 'idle' | 'running' | 'success' | 'error';

interface SimulationState {
  status: SimulationStatus;
  result: SimulationResult | null;
  error: string | null;
  // Map from component/connection id to node voltage for display in canvas
  nodeVoltageMap: Record<number, number>;
}

const initialState: SimulationState = {
  status: 'idle',
  result: null,
  error: null,
  nodeVoltageMap: {},
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
    },
  },
});

export const { startSimulation, simulationSuccess, simulationError, resetSimulation } =
  simulationSlice.actions;

export default simulationSlice.reducer;
