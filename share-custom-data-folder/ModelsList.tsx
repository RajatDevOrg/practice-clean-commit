'use client';

import Button from '~/core/ui/Button';
import { Card } from '~/core/ui/card';
import { XIcon } from 'lucide-react';

import { Manufacturer, Model } from '../types/manufacturers';

/**
 * Props for the ModelsList component
 */
interface ModelsListProps {
  /** List of models to display */
  models: Model[];
  /** Currently selected manufacturer */
  selectedManufacturer: Manufacturer | null;
  /** Whether models are currently loading */
  isLoadingModels: boolean;
  /** Callback for when a model is deleted */
  onDeleteModel: (id: string) => void;
  /** Whether to show the add model dialog */
  showAddModel: boolean;
  /** Callback for when the add model dialog open state changes */
  setShowAddModel: (open: boolean) => void;
}

/**
 * Component for displaying a list of models for a selected manufacturer
 */
const ModelsList = ({
  models,
  selectedManufacturer,
  isLoadingModels,
  onDeleteModel,
  showAddModel,
  setShowAddModel,
}: ModelsListProps) => {
  return (
    <Card className="flex flex-col h-full p-4 overflow-auto">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Models</h2>
          <p className="text-sm text-muted-foreground">Custom names in blue</p>
        </div>
        <Button
          onClick={() => setShowAddModel(true)}
          disabled={!selectedManufacturer}
        >
          Add Model
        </Button>
      </div>

      {/* Models list */}
      <div
        className="flex-1 overflow-y-auto space-y-2"
        role="list"
        aria-label="Models list"
      >
        {isLoadingModels ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading models...</p>
          </div>
        ) : !selectedManufacturer ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a manufacturer to view models
            </p>
          </div>
        ) : (
          models.map((model) => (
            <div
              key={model.id}
              role="listitem"
              className="flex justify-between items-center p-4 rounded-lg border bg-white"
            >
              <span className={model.is_custom ? 'text-blue-500' : ''}>
                {model.name}
              </span>
              {model.is_custom && (
                <button
                  onClick={() => onDeleteModel(model.id)}
                  className="text-destructive hover:text-destructive/80"
                  aria-label={`Delete ${model.name}`}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ModelsList;
