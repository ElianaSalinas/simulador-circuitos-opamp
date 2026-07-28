import React from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { updateComponentPosition, selectComponent } from '../store/circuitSlice';

const CircuitCanvas: React.FC = () => {
  const dispatch = useDispatch();
  const components = useSelector((state: RootState) => state.circuit.components);
  const selectedComponentId = useSelector((state: RootState) => state.circuit.selectedComponentId);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>, id: string) => {
    dispatch(updateComponentPosition({
      id,
      x: e.target.x(),
      y: e.target.y()
    }));
  };

  const handleSelect = (id: string) => {
    dispatch(selectComponent(id));
  };

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      dispatch(selectComponent(null));
    }
  };

  return (
    <div className="flex-1 bg-surface relative overflow-hidden" 
         onDragOver={(e) => e.preventDefault()}>
      <Stage
        width={window.innerWidth - 250} // Rough width excluding palette
        height={window.innerHeight - 60} // Rough height excluding header
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {components.map((comp) => (
            <Group
              key={comp.id}
              x={comp.x}
              y={comp.y}
              draggable
              onDragEnd={(e) => handleDragEnd(e, comp.id)}
              onClick={() => handleSelect(comp.id)}
            >
              <Rect
                width={80}
                height={40}
                fill={comp.type === 'OpAmp' ? 'theme(colors.secondary)' : 'theme(colors.primary)'}
                stroke={selectedComponentId === comp.id ? '#FF6B6B' : 'black'}
                strokeWidth={selectedComponentId === comp.id ? 2 : 1}
                shadowBlur={5}
                cornerRadius={5}
              />
              <Text
                text={comp.type}
                fontSize={14}
                fontFamily="Inter"
                fill="white"
                width={80}
                height={40}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default CircuitCanvas;
