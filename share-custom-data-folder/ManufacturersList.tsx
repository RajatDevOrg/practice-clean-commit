'use client';

import Button from '~/core/ui/Button';
import { Card } from '~/core/ui/card';
import { XIcon } from 'lucide-react';

import { Manufacturer } from '../types/manufacturers';

/**
 * Props for the ManufacturersList component
 */
interface ManufacturersListProps {
  /** List of manufacturers to display */
  manufacturers: Manufacturer[];
  /** Currently selected manufacturer */
  selectedManufacturer: Manufacturer | null;
  /** Callback for when a manufacturer is selected */
  onManufacturerSelect: (manufacturer: Manufacturer) => void;
  /** Callback for when a manufacturer is hovered */
  onManufacturerHover: (manufacturer: Manufacturer) => void;
  /** Callback for when a manufacturer is deleted */
  onDeleteManufacturer: (id: string) => void;
  /** Whether to show the add manufacturer dialog */
  showAddManufacturer: boolean;
  /** Callback for when the add manufacturer dialog open state changes */
  setShowAddManufacturer: (open: boolean) => void;
}

/**
 * Component for displaying a list of manufacturers
 */
const ManufacturersList = ({
  manufacturers,
  selectedManufacturer,
  onManufacturerSelect,
  onManufacturerHover,
  onDeleteManufacturer,
  showAddManufacturer,
  setShowAddManufacturer,
}: ManufacturersListProps) => {
  return (
    <Card className="flex flex-col h-full p-4 overflow-auto">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Manufacturers</h2>
          <p className="text-sm text-muted-foreground">Custom names in blue</p>
        </div>
        <Button onClick={() => setShowAddManufacturer(true)}>
          Add Manufacturer
        </Button>
      </div>

      {/* Manufacturers list */}
      <div
        className="flex-1 overflow-y-auto space-y-2"
        role="list"
        aria-label="Manufacturers list"
      >
        {manufacturers.map((manufacturer) => (
          <div
            key={manufacturer.id}
            role="listitem"
            className={`flex justify-between items-center p-4 cursor-pointer hover:bg-accent rounded-lg border bg-white ${
              selectedManufacturer?.id === manufacturer.id
                ? 'border-primary'
                : 'border-border'
            }`}
            onClick={() => onManufacturerSelect(manufacturer)}
            onMouseEnter={() => onManufacturerHover(manufacturer)}
          >
            <span className={manufacturer.is_custom ? 'text-blue-500' : ''}>
              {manufacturer.name}
            </span>
            {manufacturer.is_custom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteManufacturer(manufacturer.id);
                }}
                className="text-destructive hover:text-destructive/80"
                aria-label={`Delete ${manufacturer.name}`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ManufacturersList;
