'use client';

import { useManufacturers } from '../hooks/useManufacturers';
import { useModels } from '../hooks/useModels';
import { RVClass } from '../types';
import { Manufacturer } from '../types/manufacturers';
import AddManufacturerDialog from './AddManufacturerDialog';
import AddModelDialog from './AddModelDialog';
import ManufacturersList from './ManufacturersList';
import ModelsList from './ModelsList';
import RVClassesSection from './RVClassesSection';

/**
 * Props for the CustomDataForm component
 */
interface CustomDataFormProps {
  /** Organization UUID for API calls */
  organizationUuid: string;
  /** List of manufacturers */
  manufacturers: Manufacturer[];
  /** List of RV classes */
  classes: RVClass[];
  /** Currently selected manufacturer */
  selectedManufacturer: Manufacturer | null;
  /** Callback for when a manufacturer is hovered */
  onManufacturerHover: (manufacturer: Manufacturer) => void;
  /** Whether models are currently loading */
  isLoadingModels: boolean;
  /** Callback for when a manufacturer is selected */
  onManufacturerSelect: (manufacturer: Manufacturer) => void;
  /** Callback for when a manufacturer is added */
  onAddManufacturer: (name: string) => Promise<void>;
  /** Callback for when a manufacturer is deleted */
  onDeleteManufacturer: (id: string) => Promise<void>;
  /** Callback for when a model is added */
  onAddModel: (name: string) => Promise<void>;
  /** Callback for when a model is deleted */
  onDeleteModel: (id: string) => Promise<void>;
}

/**
 * Main component for managing custom data (manufacturers, models, and RV classes)
 */
function CustomDataForm({
  organizationUuid,
  manufacturers,
  classes,
  selectedManufacturer: initialSelectedManufacturer,
  isLoadingModels,
  onManufacturerSelect: parentOnManufacturerSelect,
  onAddManufacturer,
  onDeleteManufacturer,
  onAddModel,
  onDeleteModel,
  onManufacturerHover,
}: CustomDataFormProps) {
  // Use custom hooks for managing manufacturers and models
  const {
    selectedManufacturer,
    showAddManufacturer,
    setShowAddManufacturer,
    handleAddManufacturer,
    handleDeleteManufacturer,
    handleManufacturerSelect,
  } = useManufacturers(
    organizationUuid,
    manufacturers,
    onAddManufacturer,
    onDeleteManufacturer,
  );

  const {
    models,
    showAddModel,
    setShowAddModel,
    handleAddModel,
    handleDeleteModel,
  } = useModels(
    organizationUuid,
    selectedManufacturer || initialSelectedManufacturer,
    onAddModel,
    onDeleteModel,
  );

  // Sync the selected manufacturer with the parent component
  const handleSelectManufacturer = (manufacturer: Manufacturer) => {
    handleManufacturerSelect(manufacturer);
    parentOnManufacturerSelect(manufacturer);
  };

  return (
    <div className="w-full p-3 flex flex-col flex-1 h-full">
      <div className="grid grid-cols-3 gap-4 h-full overflow-hidden">
        {/* Manufacturers List */}
        <ManufacturersList
          manufacturers={manufacturers}
          selectedManufacturer={
            selectedManufacturer || initialSelectedManufacturer
          }
          onManufacturerSelect={handleSelectManufacturer}
          onManufacturerHover={onManufacturerHover}
          onDeleteManufacturer={handleDeleteManufacturer}
          showAddManufacturer={showAddManufacturer}
          setShowAddManufacturer={setShowAddManufacturer}
        />

        {/* Models List */}
        <ModelsList
          models={models}
          selectedManufacturer={
            selectedManufacturer || initialSelectedManufacturer
          }
          isLoadingModels={isLoadingModels}
          onDeleteModel={handleDeleteModel}
          showAddModel={showAddModel}
          setShowAddModel={setShowAddModel}
        />

        {/* RV Classes */}
        <RVClassesSection
          organizationUuid={organizationUuid}
          initialClasses={classes}
        />
      </div>

      {/* Dialogs */}
      <AddManufacturerDialog
        open={showAddManufacturer}
        onOpenChange={setShowAddManufacturer}
        onSubmit={handleAddManufacturer}
      />
      <AddModelDialog
        open={showAddModel}
        onOpenChange={setShowAddModel}
        onSubmit={handleAddModel}
        manufacturerName={
          (selectedManufacturer || initialSelectedManufacturer)?.name
        }
      />
    </div>
  );
}

export default CustomDataForm;
