import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// --- Types ---
export type ComponentType = 'Resistor' | 'Capacitor' | 'OpAmp' | 'Voltage' | 'Ground';

export interface Pin {
  id: string;
  label: string;
  offsetX: number; // relative to component top-left
  offsetY: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  label: string;      // e.g. "R1", "U1"
  value?: number;     // e.g. 1000 for 1kΩ
  unit?: string;      // e.g. "Ω", "F", "V"
  hasError?: boolean; // visual validation flag
}

export interface Connection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
}

export interface ValidationError {
  componentId: string;
  message: string;
}

// --- Pin definitions per component type ---
export const COMPONENT_PINS: Record<ComponentType, Pin[]> = {
  Resistor: [
    { id: 'left', label: 'L', offsetX: 0, offsetY: 20 },
    { id: 'right', label: 'R', offsetX: 80, offsetY: 20 },
  ],
  Capacitor: [
    { id: 'left', label: '+', offsetX: 0, offsetY: 20 },
    { id: 'right', label: '-', offsetX: 80, offsetY: 20 },
  ],
  OpAmp: [
    { id: 'in+', label: '+', offsetX: 0, offsetY: 10 },
    { id: 'in-', label: '-', offsetX: 0, offsetY: 30 },
    { id: 'out', label: 'O', offsetX: 80, offsetY: 20 },
    { id: 'vcc', label: 'V+', offsetX: 40, offsetY: 0 },
    { id: 'vee', label: 'V-', offsetX: 40, offsetY: 40 },
  ],
  Voltage: [
    { id: '+', label: '+', offsetX: 40, offsetY: 0 },
    { id: '-', label: '-', offsetX: 40, offsetY: 40 },
  ],
  Ground: [
    { id: 'gnd', label: 'G', offsetX: 20, offsetY: 0 },
  ],
};

// Counter for auto-labeling
const counters: Record<string, number> = {};
const getNextLabel = (type: ComponentType): string => {
  const prefix: Record<ComponentType, string> = {
    Resistor: 'R', Capacitor: 'C', OpAmp: 'U', Voltage: 'VS', Ground: 'GND',
  };
  const p = prefix[type];
  counters[p] = (counters[p] ?? 0) + 1;
  return `${p}${counters[p]}`;
};

const getDefaultValue = (type: ComponentType): { value?: number; unit?: string } => {
  switch (type) {
    case 'Resistor': return { value: 1000, unit: 'Ω' };
    case 'Capacitor': return { value: 100e-9, unit: 'F' };
    case 'Voltage': return { value: 5, unit: 'V' };
    default: return {};
  }
};

// --- State ---
interface CircuitState {
  components: CircuitComponent[];
  connections: Connection[];
  selectedComponentId: string | null;
  pendingConnection: { componentId: string; pinId: string } | null;
  validationErrors: ValidationError[];
}

const initialState: CircuitState = {
  components: [],
  connections: [],
  selectedComponentId: null,
  pendingConnection: null,
  validationErrors: [],
};

// --- Slice ---
export const circuitSlice = createSlice({
  name: 'circuit',
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<{ type: ComponentType; x: number; y: number }>) => {
      const { type, x, y } = action.payload;
      const { value, unit } = getDefaultValue(type);
      state.components.push({
        id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        x,
        y,
        label: getNextLabel(type),
        value,
        unit,
        hasError: false,
      });
    },
    updateComponentPosition: (state, action: PayloadAction<{ id: string; x: number; y: number }>) => {
      const comp = state.components.find(c => c.id === action.payload.id);
      if (comp) { comp.x = action.payload.x; comp.y = action.payload.y; }
    },
    updateComponentValue: (state, action: PayloadAction<{ id: string; value: number; label?: string }>) => {
      const comp = state.components.find(c => c.id === action.payload.id);
      if (comp) {
        comp.value = action.payload.value;
        if (action.payload.label) comp.label = action.payload.label;
      }
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter(c => c.id !== action.payload);
      state.connections = state.connections.filter(
        cn => cn.fromComponentId !== action.payload && cn.toComponentId !== action.payload
      );
      if (state.selectedComponentId === action.payload) state.selectedComponentId = null;
      if (state.pendingConnection?.componentId === action.payload) state.pendingConnection = null;
    },
    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    },
    startConnection: (state, action: PayloadAction<{ componentId: string; pinId: string }>) => {
      state.pendingConnection = action.payload;
    },
    completeConnection: (state, action: PayloadAction<{ componentId: string; pinId: string }>) => {
      const from = state.pendingConnection;
      const to = action.payload;
      if (!from) return;
      // Avoid self-connection and duplicate connections
      if (from.componentId === to.componentId) { state.pendingConnection = null; return; }
      const exists = state.connections.some(
        cn =>
          (cn.fromComponentId === from.componentId && cn.fromPinId === from.pinId &&
           cn.toComponentId === to.componentId && cn.toPinId === to.pinId) ||
          (cn.fromComponentId === to.componentId && cn.fromPinId === to.pinId &&
           cn.toComponentId === from.componentId && cn.toPinId === from.pinId)
      );
      if (!exists) {
        state.connections.push({
          id: `conn-${Date.now()}`,
          fromComponentId: from.componentId,
          fromPinId: from.pinId,
          toComponentId: to.componentId,
          toPinId: to.pinId,
        });
      }
      state.pendingConnection = null;
    },
    cancelConnection: (state) => { state.pendingConnection = null; },
    removeConnection: (state, action: PayloadAction<string>) => {
      state.connections = state.connections.filter(cn => cn.id !== action.payload);
    },
    setValidationErrors: (state, action: PayloadAction<ValidationError[]>) => {
      state.validationErrors = action.payload;
      // Mark components with errors
      const errorIds = new Set(action.payload.map(e => e.componentId));
      state.components.forEach(c => { c.hasError = errorIds.has(c.id); });
    },
    clearValidationErrors: (state) => {
      state.validationErrors = [];
      state.components.forEach(c => { c.hasError = false; });
    },
  },
});

export const {
  addComponent, updateComponentPosition, updateComponentValue,
  removeComponent, selectComponent,
  startConnection, completeConnection, cancelConnection, removeConnection,
  setValidationErrors, clearValidationErrors,
} = circuitSlice.actions;

export default circuitSlice.reducer;
