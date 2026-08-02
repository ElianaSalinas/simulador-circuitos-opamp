import React from 'react';
import { Group, Line, Text } from 'react-konva';
import type { CircuitComponent } from '../../store/circuitSlice';

interface OpAmpSymbolProps {
  component: CircuitComponent;
  isSelected: boolean;
}

export const OpAmpSymbol: React.FC<OpAmpSymbolProps> = ({ component, isSelected }) => {
  const strokeColor = component.hasError ? '#f43f5e' : isSelected ? '#38bdf8' : '#0d9488';
  const glowColor = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(13, 148, 136, 0.25)';

  return (
    <Group>
      {/* Op-Amp Triangular Body */}
      <Line
        points={[12, 0, 12, 40, 68, 20]}
        closed
        fill="#042f2e"
        opacity={0.88}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.8}
        shadowBlur={isSelected ? 12 : 4}
        shadowColor={glowColor}
      />

      {/* Terminal Lead Stubs */}
      {/* Non-inverting Input (in+) Lead */}
      <Line points={[0, 10, 12, 10]} stroke={strokeColor} strokeWidth={1.8} />
      {/* Inverting Input (in-) Lead */}
      <Line points={[0, 30, 12, 30]} stroke={strokeColor} strokeWidth={1.8} />
      {/* Output (out) Lead */}
      <Line points={[68, 20, 80, 20]} stroke={strokeColor} strokeWidth={1.8} />
      {/* V+ Lead */}
      <Line points={[40, 0, 40, 10]} stroke={strokeColor} strokeWidth={1.2} strokeScaleEnabled={false} dash={[2, 2]} />
      {/* V- Lead */}
      <Line points={[40, 40, 40, 30]} stroke={strokeColor} strokeWidth={1.2} strokeScaleEnabled={false} dash={[2, 2]} />

      {/* Polarities & Glyphs inside Body */}
      <Text
        text="+"
        x={16}
        y={4}
        fontSize={13}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#38bdf8"
        listening={false}
      />
      <Text
        text="−"
        x={16}
        y={22}
        fontSize={14}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#f87171"
        listening={false}
      />

      {/* Label and Integrated Model */}
      <Text
        text={component.label}
        x={28}
        y={15}
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#ccfbf1"
        listening={false}
      />

      {/* External Subtitle / Spec */}
      <Text
        text="TL082"
        x={0}
        y={-14}
        width={80}
        align="center"
        fontSize={9}
        fontFamily="Inter, sans-serif"
        fill="#94a3b8"
        listening={false}
      />
    </Group>
  );
};
