import { configureStore } from '@reduxjs/toolkit';
import circuitReducer from './circuitSlice';
import simulationReducer from './simulationSlice';

export const store = configureStore({
  reducer: {
    circuit: circuitReducer,
    simulation: simulationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


