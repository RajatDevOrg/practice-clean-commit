'use client';

// UI components
import { GripVertical, XIcon } from 'lucide-react';

// Types
import { RVClass } from '../types';

/**
 * Props for the RVClassItem component
 */
interface RVClassItemProps {
  /** The RV class to display */
  rvClass: RVClass;
  /** The index of the class in the list (for drag and drop) */
  index?: number;
  /** Whether the item is draggable */
  isDraggable?: boolean;
  /** Props for the drag handle */
  dragHandleProps?: any;
  /** Props for the draggable element */
  draggableProps?: any;
  /** Ref for the draggable element */
  innerRef?: any;
  /** Callback for when the delete button is clicked */
  onDelete: (id: string) => void;
}

/**
 * Component for displaying a single RV class item
 * Can be used in both draggable and non-draggable contexts
 */
const RVClassItem = ({
  rvClass,
  index,
  isDraggable = false,
  dragHandleProps = null,
  draggableProps = null,
  innerRef = null,
  onDelete,
}: RVClassItemProps) => (
  <div
    ref={innerRef}
    {...draggableProps}
    className="border rounded-lg p-4 bg-white"
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <div {...dragHandleProps} className="cursor-move">
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
        <div>
          <span className={!rvClass.is_system ? 'text-blue-500' : ''}>
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
);

export default RVClassItem;
