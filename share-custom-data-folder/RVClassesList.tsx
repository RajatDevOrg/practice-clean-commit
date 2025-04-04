'use client';

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';

import { RVClass } from '../types';
import RVClassItem from './RVClassItem';

/**
 * Props for the RVClassesList component
 */
interface RVClassesListProps {
  /** List of RV classes to display */
  classes: RVClass[];
  /** Whether drag-and-drop is initialized */
  winReady: boolean;
  /** Callback for when a class is deleted */
  onDelete: (id: string) => void;
  /** Callback for when classes are reordered */
  onDragEnd: (result: DropResult) => void;
}

/**
 * Component for rendering a list of RV classes with or without drag-and-drop functionality
 */
const RVClassesList = ({
  classes,
  winReady,
  onDelete,
  onDragEnd,
}: RVClassesListProps) => {
  // Render a static list before drag-and-drop is initialized
  if (!winReady) {
    return (
      <div className="space-y-4">
        {classes.map((rvClass) => (
          <RVClassItem key={rvClass.id} rvClass={rvClass} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  // Render with drag-and-drop functionality
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
                  <RVClassItem
                    rvClass={rvClass}
                    index={index}
                    isDraggable={true}
                    innerRef={provided.innerRef}
                    draggableProps={provided.draggableProps}
                    dragHandleProps={provided.dragHandleProps}
                    onDelete={onDelete}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default RVClassesList;
