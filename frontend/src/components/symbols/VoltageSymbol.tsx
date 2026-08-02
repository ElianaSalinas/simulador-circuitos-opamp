import React from 'react';
import { Group, Circle, Line, Text } from 'react-konva';
import type { CircuitComponent } from '../../store/circuitSlice';

interface VoltageSymbolProps {
  component: CircuitComponent;
  isSelected: boolean;
}

export const VoltageSymbol: React.FC<VoltageSymbolProps> = ({ component, isSelected }) => {
  const strokeColor = component.hasError ? '#f43f5e' : isSelected ? '#38bdf8' : '#f59e0b';
  const glowColor = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(245, 158, 11, 0.25)';
  const waveform = component.waveform || 'dc';

  const formatVoltage = (v?: number) => {
    if (v === undefined) return '5 V';
    return `${v} V`;
  };

  return (
    <Group>
      {/* Circle Generator Body */}
      <Circle
        x={40}
        y={20}
        radius={16}
        fill="#1e1b4b"
        opacity={0.88}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        shadowBlur={isSelected ? 10 : 4}
        shadowColor={glowColor}
      />

      {/* Top Lead (Positive Terminal) */}
      <Line
        points={[40, 0, 40, 4]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
      />

      {/* Bottom Lead (Negative Terminal) */}
      <Line
        points={[40, 36, 40, 40]}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
      />

      {/* Glyphs inside Source */}
      {waveform === 'dc' ? (
        <>
          <Text
            text="+"
            x={33}
            y={6}
            fontSize={12}
            fontFamily="JetBrains Mono, monospace"
            fontStyle="bold"
            fill="#38bdf8"
            listening={false}
          />
          <Text
            text="−"
            x={33}
            y={19}
            fontSize={14}
            fontFamily="JetBrains Mono, monospace"
            fontStyle="bold"
            fill="#f87171"
            listening={false}
          />
        </>
      ) : waveform === 'sine' ? (
        /* Sinusoidal ~ glyph */
        <Line
          points={[30, 20, 33, 15, 37, 15, 40, 20, 43, 25, 47, 25, 50, 20]}
          stroke="#fcd34d"
          strokeWidth={2}
          tension={0.4}
        />
      ) : waveform === 'square' ? (
        /* Square pulse glyph */
        <Line
          points={[30, 24, 30, 16, 40, 16, 40, 24, 50, 24]}
          stroke="#fcd34d"
          strokeWidth={2}
        />
      ) : (
        /* Triangle glyph */
        <Line
          points={[30, 24, 40, 16, 50, 24]}
          stroke="#fcd34d"
          strokeWidth={2}
        />
      )}

      {/* Labels */}
      <Text
        text={component.label}
        x={58}
        y={8}
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        fontStyle="bold"
        fill="#e2e8f0"
        listening={false}
      />
      <Text
        text={
          waveform === 'dc'
            ? formatVoltage(component.value)
            : `${component.amplitude ?? component.value ?? 5}Vpk ${component.frequency ? `@${component.frequency}Hz` : ''}`
        }
        x={58}
        y={22}
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fill="#fcd34d"
        listening={false}
      />
    </Group>
  );
};
