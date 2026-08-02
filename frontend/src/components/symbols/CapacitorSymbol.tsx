import React from 'react';
import { Group, Line, Text, Rect } from 'react-konva';
import type { CircuitComponent } from '../../store/circuitSlice';

interface CapacitorSymbolProps {
  component: CircuitComponent;
  isSelected: boolean;
}

const formatCapacitorValue = (v?: number): string => {
  if (v === undefined) return '';
  if (v >= 1e-3) return `${(v * 1e3).toFixed(1)} mF`;
  if (v >= 1e-6) return `${(v * 1e6).toFixed(v % 1e-6 === 0 ? 0 : 1)} µF`;
  if (v >= 1e-9) return `${(v * 1e9).toFixed(v % 1e-9 === 0 ? 0 : 1)} nF`;
  return `${(v * 1e12).toFixed(0)} pF`;
};

export const CapacitorSymbol: React.FC<CapacitorSymbolProps> = ({ component, isSelected }) => {
  const strokeColor = component.hasError ? '#f43f5e' : isSelected ? '#38bdf8' : '#a855f7';
  const glowColor = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(168, 85, 247, 0.2)';

  return (
    <Group>
      {/* Selection bounding box */}
      <Rect
        x={0}
        y={4}
        width={80}
        height={32}
        fill={isSelected ? 'rgba(168, 85, 247, 0.1)' : 'transparent'}
        cornerRadius={4}
      />

      {/* Left Lead */}
      <Line
        points={[0, 20, 35, 20]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        shadowBlur={isSelected ? 8 : 2}
        shadowColor={glowColor}
      />

      {/* Left Plate (Vertical) */}
      <Line
        points={[35, 6, 35, 34]}
        stroke={strokeColor}
        strokeWidth={3}
        lineCap="round"
        shadowBlur={isSelected ? 10 : 3}
        shadowColor={glowColor}
      />

      {/* Right Plate (Vertical) */}
      <Line
        points={[45, 6, 45, 34]}
        stroke={strokeColor}
        strokeWidth={3}
        lineCap="round"
        shadowBlur={isSelected ? 10 : 3}
        shadowColor={glowColor}
      />

      {/* Right Lead */}
      <Line
        points={[45, 20, 80, 20]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        shadowBlur={isSelected ? 8 : 2}
        shadowColor={glowColor}
      />

      {/* Labels */}
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
        text={formatCapacitorValue(component.value)}
        x={0}
        y={35}
        width={80}
        align="center"
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fill="#c084fc"
        listening={false}
      />
    </Group>
  );
};
