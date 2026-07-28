import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CircuitComponent {
  id: string;
  type: string;
  x: number;
  y: number;
  value?: number;
}

interface CircuitState {
  components: CircuitComponent[];
  selectedComponentId: string | null;
}

const initialState: CircuitState = {
  components: [],
  selectedComponentId: null,
};

export const circuitSlice = createSlice({
  name: 'circuit',
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<CircuitComponent>) => {
      state.components.push(action.payload);
    },
    updateComponentPosition: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const component = state.components.find((c) => c.id === action.payload.id);
      if (component) {
        component.x = action.payload.x;
        component.y = action.payload.y;
      }
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter((c) => c.id !== action.payload);
      if (state.selectedComponentId === action.payload) {
        state.selectedComponentId = null;
      }
    },
    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    }
  },
});

export const { addComponent, updateComponentPosition, removeComponent, selectComponent } = circuitSlice.actions;
export default circuitSlice.reducer;
