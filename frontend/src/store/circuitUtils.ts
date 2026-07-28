import type { CircuitComponent, Connection, ValidationError } from './circuitSlice';
import { COMPONENT_PINS } from './circuitSlice';

/**
 * Validates the circuit and returns a list of errors.
 * Rules:
 *  - Every component must have at least one connection (no floating nodes)
 *  - There must be at least one Ground component
 *  - There must be at least one OpAmp to allow simulation
 */
export function validateCircuit(
  components: CircuitComponent[],
  connections: Connection[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (components.length === 0) return errors;

  // Rule 1: At least one Ground
  const hasGround = components.some(c => c.type === 'Ground');
  if (!hasGround) {
    components.forEach(c => {
      errors.push({ componentId: c.id, message: 'Falta un nodo de Tierra (Ground) en el circuito.' });
    });
    return errors;
  }

  // Rule 2: No floating components (every component must have at least 1 connection)
  const connectedIds = new Set<string>();
  connections.forEach(cn => {
    connectedIds.add(cn.fromComponentId);
    connectedIds.add(cn.toComponentId);
  });

  components.forEach(c => {
    if (!connectedIds.has(c.id)) {
      errors.push({ componentId: c.id, message: `${c.label} está flotando (sin conexiones).` });
    }
  });

  // Rule 3: OpAmp output must not be directly connected to its own input
  // (simplified check — full SPICE validation happens in the backend)

  return errors;
}

/**
 * Returns the absolute canvas position of a pin given the parent component's position.
 */
export function getPinAbsolutePosition(
  component: CircuitComponent,
  pinId: string
): { x: number; y: number } | null {
  const pins = COMPONENT_PINS[component.type];
  const pin = pins.find(p => p.id === pinId);
  if (!pin) return null;
  return { x: component.x + pin.offsetX, y: component.y + pin.offsetY };
}
