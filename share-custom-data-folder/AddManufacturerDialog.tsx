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
 * Props for the AddManufacturerDialog component
 */
interface AddManufacturerDialogProps {
  /** Controls whether the dialog is open */
  open: boolean;
  /** Callback for when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback for when the form is submitted */
  onSubmit: (name: string) => void;
}

/**
 * Dialog component for adding a new manufacturer
 * Includes validation for similar manufacturer names
 */
function AddManufacturerDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddManufacturerDialogProps) {
  // Form state
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  /**
   * Handles form submission
   * Checks for similar manufacturer names before submitting
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get all manufacturers from cache
    const manufacturers =
      queryClient.getQueryData<Array<{ name: string }>>(['manufacturers']) ||
      [];

    // Find similar names using fuzzy match
    const similarManufacturers = manufacturers.filter((m) =>
      fuzzyMatch(name, m.name),
    );

    // Confirm with user if similar manufacturers are found
    if (similarManufacturers.length > 0) {
      const confirmed = window.confirm(
        `Found similar manufacturers:\n${similarManufacturers
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
          <DialogTitle>Add Manufacturer</DialogTitle>
        </DialogHeader>

        {/* Manufacturer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer-name">Name</Label>
            <Input
              id="manufacturer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter manufacturer name"
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
              Add Manufacturer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddManufacturerDialog;
