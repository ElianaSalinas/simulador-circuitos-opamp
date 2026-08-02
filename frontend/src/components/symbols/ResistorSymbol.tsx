import React from 'react';
import { Group, Line, Text, Rect } from 'react-konva';
import type { CircuitComponent } from '../../store/circuitSlice';

interface ResistorSymbolProps {
  component: CircuitComponent;
  isSelected: boolean;
}

const formatResistorValue = (v?: number): string => {
  if (v === undefined) return '';
  if (v >= 1e6) return `${(v / 1e6).toFixed(v % 1e6 === 0 ? 0 : 1)} MΩ`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(v % 1e3 === 0 ? 0 : 1)} kΩ`;
  return `${v} Ω`;
};

export const ResistorSymbol: React.FC<ResistorSymbolProps> = ({ component, isSelected }) => {
  const strokeColor = component.hasError ? '#f43f5e' : isSelected ? '#38bdf8' : '#38bdf8';
  const glowColor = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(56, 189, 248, 0.2)';

  // IEEE standard zigzag points (6 crests/troughs)
  const zigzagPoints = [
    0, 20,    // Left lead start
    14, 20,   // Zigzag start
    18, 9,    // Peak 1
    26, 31,   // Trough 1
    34, 9,    // Peak 2
    42, 31,   // Trough 2
    50, 9,    // Peak 3
    58, 31,   // Trough 3
    62, 20,   // Zigzag end
    80, 20    // Right lead end
  ];

  return (
    <Group>
      {/* Subtle interactive bounding box for click/selection */}
      <Rect
        x={0}
        y={4}
        width={80}
        height={32}
        fill={isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent'}
        cornerRadius={4}
      />

      {/* Zigzag Resistor Trace */}
      <Line
        points={zigzagPoints}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        lineCap="round"
        lineJoin="miter"
        shadowBlur={isSelected ? 10 : 3}
        shadowColor={glowColor}
      />

      {/* Label and Value */}
      <Text
        text={component.label}
        x={0}
        y={-14}
        width={80}
        align="center"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#e2e8f0"
        listening={false}
      />
      <Text
        text={formatResistorValue(component.value)}
        x={0}
        y={33}
        width={80}
        align="center"
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fill="#38bdf8"
        listening={false}
      />
    </Group>
  );
};
