'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { XIcon, GripVertical } from 'lucide-react';
import { RVClass } from '../types';

interface Props {
  classes: RVClass[];
  onDragEnd: (result: DropResult) => void;
  onDelete: (id: string) => void;
}

export default function DraggableClasses({
  classes,
  onDragEnd,
  onDelete,
}: Props) {
  const [winReady, setWinReady] = useState(false);

  useEffect(() => {
    setWinReady(true);
  }, []);

  if (!winReady) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="rental-classes">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {classes.map((rvClass, index) => (
              <Draggable
                key={rvClass.id}
                draggableId={rvClass.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            className="text-gray-500"
                          >
                            <circle cx="5" cy="5" r="2" fill="currentColor" />
                            <circle cx="5" cy="10" r="2" fill="currentColor" />
                            <circle cx="5" cy="15" r="2" fill="currentColor" />
                            <circle cx="10" cy="5" r="2" fill="currentColor" />
                            <circle cx="10" cy="10" r="2" fill="currentColor" />
                            <circle cx="10" cy="15" r="2" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                          <span
                            className={
                              !rvClass.is_system ? 'text-blue-500' : ''
                            }
                          >
                            {rvClass.name}
                          </span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({rvClass.category})
                          </span>
                        </div>
                      </div>
                      {!rvClass.is_system && (
                        <button
                          onClick={() => onDelete(rvClass.id)}
                          className="text-destructive hover:text-destructive/80"
                          aria-label={`Delete ${rvClass.name}`}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
