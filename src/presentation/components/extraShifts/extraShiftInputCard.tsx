/**
 * Extra Shift Input Card Component
 *
 * Allows users to add extra shifts to specific dates
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { TurnoExtra } from '@/src/core/domain/turnoExtra';

export interface ExtraShiftInputCardProps {
  /** Year for date validation */
  year: number;

  /** Callback when adding a new extra shift */
  onAdd: (extraShift: TurnoExtra) => boolean;

  /** Current error message if any */
  error?: string | null;

  /** Callback to clear error */
  onClearError?: () => void;
}

/**
 * ExtraShiftInputCard component
 *
 * Provides form to add a new extra shift with date, hours, and optional description.
 *
 * @example
 * ```tsx
 * <ExtraShiftInputCard
 *   year={2025}
 *   onAdd={handleAddExtraShift}
 *   error={error}
 *   onClearError={clearError}
 * />
 * ```
 */
export function ExtraShiftInputCard({
  year,
  onAdd,
  error,
  onClearError,
}: ExtraShiftInputCardProps) {
  const [date, setDate] = useState<string>('');
  const [hours, setHours] = useState<string>('8');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    onClearError?.();

    // Validate date input
    if (!date) {
      return;
    }

    // Parse date (format: YYYY-MM-DD)
    const [yearStr, monthStr, dayStr] = date.split('-');
    const parsedDate = new Date(
      parseInt(yearStr),
      parseInt(monthStr) - 1, // Month is 0-indexed
      parseInt(dayStr)
    );

    // Validate hours
    const parsedHours = parseFloat(hours);
    if (isNaN(parsedHours)) {
      return;
    }

    // Create TurnoExtra value object
    const extraShiftResult = TurnoExtra.create({
      date: parsedDate,
      hours: parsedHours,
      description: description.trim(),
    });

    if (extraShiftResult.isFailure()) {
      // Could show error here
      return;
    }

    // Call parent handler
    const success = onAdd(extraShiftResult.getValue());

    // Reset form if successful
    if (success) {
      setDate('');
      setHours('8');
      setDescription('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Añadir Turno Extra</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date input */}
          <div>
            <label
              htmlFor="extra-shift-date"
              className="block text-sm font-medium mb-2"
            >
              Fecha
            </label>
            <input
              type="date"
              id="extra-shift-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={`${year}-01-01`}
              max={`${year}-12-31`}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Hours input */}
          <div>
            <label
              htmlFor="extra-shift-hours"
              className="block text-sm font-medium mb-2"
            >
              Horas trabajadas
            </label>
            <input
              type="number"
              id="extra-shift-hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              min="0"
              max="24"
              step="0.5"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Entre 0 y 24 horas
            </p>
          </div>

          {/* Description input */}
          <div>
            <label
              htmlFor="extra-shift-description"
              className="block text-sm font-medium mb-2"
            >
              Descripción (opcional)
            </label>
            <input
              type="text"
              id="extra-shift-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              placeholder="Ej: Cubriendo turno de tarde"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 200 caracteres ({description.length}/200)
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Turno Extra
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
