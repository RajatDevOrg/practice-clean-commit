'use client';

import { useState } from 'react';

import Button from '~/core/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/core/ui/Dialog';
import { Input } from '~/core/ui/input';
import Label from '~/core/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/core/ui/Select';

import { MasterClassType } from '~/lib/rental_units/types/rental_units';

/**
 * Form data structure for adding a new RV class
 */
interface RVClassFormData {
  name: string;
  category: MasterClassType;
  sortOrder: number;
}

/**
 * Props for the AddRVClassDialog component
 */
interface AddRVClassDialogProps {
  /** Controls whether the dialog is open */
  open: boolean;
  /** Callback for when the dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback for when the form is submitted */
  onSubmit: (data: RVClassFormData) => void;
  /** Current sort order to determine the new class's position */
  currentSortOrder: number;
}

/**
 * Dialog component for adding a new RV class
 * Allows users to specify a name and category for the new class
 */
function AddRVClassDialog({
  open,
  onOpenChange,
  onSubmit,
  currentSortOrder,
}: AddRVClassDialogProps) {
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MasterClassType>('Drivable');

  /**
   * Handles form submission
   * Calls the onSubmit callback with the form data and resets the form
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare form data
    const formData: RVClassFormData = {
      name,
      category,
      sortOrder: currentSortOrder + 1,
    };

    // Submit form data
    onSubmit(formData);

    // Reset form fields
    setName('');
    setCategory('Drivable');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add RV Class</DialogTitle>
        </DialogHeader>

        {/* RV Class Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter class name"
              required
              aria-required="true"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as MasterClassType)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Drivable">Drivable</SelectItem>
                <SelectItem value="Towable">Towable</SelectItem>
                <SelectItem value="Camper">Camper</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit">Add Class</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddRVClassDialog;
