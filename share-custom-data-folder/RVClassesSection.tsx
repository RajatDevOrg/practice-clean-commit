'use client';

import Button from '~/core/ui/Button';
import { Card } from '~/core/ui/card';

import { useRVClasses } from '../hooks/useRVClasses';
import { RVClass } from '../types';
import AddRVClassDialog from './AddRVClassDialog';
import RVClassesList from './RVClassesList';

/**
 * Props for the RVClassesSection component
 */
interface RVClassesSectionProps {
  /** Organization UUID for API calls */
  organizationUuid: string;
  /** Initial list of RV classes */
  initialClasses: RVClass[];
}

/**
 * Component for managing and displaying RV classes with drag-and-drop reordering
 * This is the main container component that coordinates the RV classes functionality
 */
function RVClassesSection({
  organizationUuid,
  initialClasses,
}: RVClassesSectionProps) {
  // Use the custom hook to manage RV classes
  const {
    classes,
    showAddClass,
    setShowAddClass,
    winReady,
    handleAddClass,
    handleDeleteClass,
    handleDragEnd,
  } = useRVClasses(organizationUuid, initialClasses);

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header */}
      <div className="p-4 flex-none">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">RV Classes</h2>
            <p className="text-sm text-muted-foreground">
              Custom classes in blue. Drag to reorder.
            </p>
          </div>
          <Button onClick={() => setShowAddClass(true)}>Add RV Class</Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <RVClassesList
          classes={classes}
          winReady={winReady}
          onDelete={handleDeleteClass}
          onDragEnd={handleDragEnd}
        />
      </div>

      {/* Add RV Class Dialog */}
      <AddRVClassDialog
        open={showAddClass}
        onOpenChange={setShowAddClass}
        onSubmit={handleAddClass}
        currentSortOrder={classes.length}
      />
    </Card>
  );
}

export default RVClassesSection;
