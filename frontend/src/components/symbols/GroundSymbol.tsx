import React from 'react';
import { Group, Line, Text } from 'react-konva';
import type { CircuitComponent } from '../../store/circuitSlice';

interface GroundSymbolProps {
  component: CircuitComponent;
  isSelected: boolean;
}

export const GroundSymbol: React.FC<GroundSymbolProps> = ({ component, isSelected }) => {
  const strokeColor = component.hasError ? '#f43f5e' : isSelected ? '#38bdf8' : '#94a3b8';
  const glowColor = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(148, 163, 184, 0.2)';

  const pinX = 20; // Default Ground Pin X offset

  return (
    <Group>
      {/* Vertical Stem */}
      <Line
        points={[pinX, 0, pinX, 14]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        shadowBlur={isSelected ? 8 : 2}
        shadowColor={glowColor}
      />

      {/* 3 Horizontal Descending Bars */}
      <Line
        points={[pinX - 14, 14, pinX + 14, 14]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2.5}
        lineCap="round"
        shadowBlur={isSelected ? 10 : 3}
        shadowColor={glowColor}
      />
      <Line
        points={[pinX - 9, 20, pinX + 9, 20]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        lineCap="round"
        shadowBlur={isSelected ? 8 : 2}
        shadowColor={glowColor}
      />
      <Line
        points={[pinX - 4, 26, pinX + 4, 26]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2 : 1.5}
        lineCap="round"
        shadowBlur={isSelected ? 6 : 1}
        shadowColor={glowColor}
      />

      {/* Label */}
      <Text
        text={component.label || 'GND'}
        x={pinX - 30}
        y={30}
        width={60}
        align="center"
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#94a3b8"
        listening={false}
      />
    </Group>
  );
};
