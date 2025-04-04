'use client';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { fuzzyMatch } from '~/app/dashboard/[organization]/rvs/utils/rv-list.utils';
import Button from '~/core/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/core/ui/Dialog';
import { Input } from '~/core/ui/input';
import Label from '~/core/ui/Label';

/**
 * Props for the AddModelDialog component
 */
interface AddModelDialogProps {
  /** Controls whether the dialog is open */
  open: boolean;
  /** Callback for when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback for when the form is submitted */
  onSubmit: (name: string) => void;
  /** Name of the manufacturer this model belongs to */
  manufacturerName?: string;
}

/**
 * Dialog component for adding a new model for a manufacturer
 * Includes validation for similar model names
 */
function AddModelDialog({
  open,
  onOpenChange,
  onSubmit,
  manufacturerName,
}: AddModelDialogProps) {
  // Form state
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  /**
   * Handles form submission
   * Checks for similar model names before submitting
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get all models from cache for this manufacturer
    const models =
      queryClient.getQueryData<Array<{ name: string }>>(['models']) || [];

    // Find similar names using fuzzy match
    const similarModels = models.filter((m) => fuzzyMatch(name, m.name));

    // Confirm with user if similar models are found
    // This probably need to not be a lame window and should be a styled component
    if (similarModels.length > 0) {
      const confirmed = window.confirm(
        `Found similar models${
          manufacturerName ? ` for ${manufacturerName}` : ''
        }:\n${similarModels
          .map((m) => m.name)
          .join('\n')}\n\nDo you still want to add "${name}"?`,
      );
      if (!confirmed) return;
    }

    // Submit the form and reset
    onSubmit(name);
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add Model{manufacturerName ? ` for ${manufacturerName}` : ''}
          </DialogTitle>
        </DialogHeader>

        {/* Model Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="model-name">Name</Label>
            <Input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter model name"
              required
              aria-required="true"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add Model
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddModelDialog;
