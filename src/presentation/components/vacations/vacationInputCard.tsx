/**
 * VacationInputCard Component
 *
 * Card for adding new vacation periods with date range picker and optional description
 * Features:
 * - Start and end date pickers restricted to selected year
 * - Optional text input for vacation description
 * - Validation: end date >= start date
 * - Add button with validation
 * - Clear button to reset form
 * - Shows calculated day count
 */

"use client";

import { useState, useMemo } from "react";
import { Plane, X } from "lucide-react";
import { Card, CardContent } from "../ui";
import { Button } from "../ui/button";

interface VacationInputCardProps {
  onAdd: (startDate: Date, endDate: Date, description: string) => void;
  selectedYear: number;
  disabled?: boolean;
}

export function VacationInputCard({
  onAdd,
  selectedYear,
  disabled = false,
}: VacationInputCardProps) {
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  // Generate min and max dates for the selected year
  const minDate = `${selectedYear}-01-01`;
  const maxDate = `${selectedYear}-12-31`;

  // Calculate day count
  const dayCount = useMemo(() => {
    if (!startDateInput || !endDateInput) return null;

    const start = new Date(startDateInput);
    const end = new Date(endDateInput);

    // Normalize to noon to avoid timezone/DST issues
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    if (end < start) return null;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.round(timeDiff / millisecondsPerDay);
    return daysDiff + 1; // +1 because both dates are inclusive
  }, [startDateInput, endDateInput]);

  const handleAdd = () => {
    if (!startDateInput || !endDateInput || dayCount === null) return;

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    onAdd(startDate, endDate, descriptionInput.trim());

    // Clear inputs after adding
    setStartDateInput("");
    setEndDateInput("");
    setDescriptionInput("");
  };

  const handleClear = () => {
    setStartDateInput("");
    setEndDateInput("");
    setDescriptionInput("");
  };

  const canAdd = startDateInput && endDateInput && dayCount !== null && dayCount > 0;
  const hasInput = startDateInput || endDateInput || descriptionInput;
  const hasDateRangeError = startDateInput && endDateInput && dayCount === null;

  return (
    <Card>
      <CardContent className="pt-6 pb-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground">
                Añadir Período de Vacaciones
              </h4>
              <p className="text-sm text-muted-foreground">
                Selecciona las fechas de inicio y fin
              </p>
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label
                htmlFor="vacation-start-date"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Fecha de inicio
              </label>
              <input
                id="vacation-start-date"
                type="date"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
                min={minDate}
                max={maxDate}
                disabled={disabled}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="vacation-end-date"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Fecha de fin
              </label>
              <input
                id="vacation-end-date"
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                min={minDate}
                max={maxDate}
                disabled={disabled}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Day Count Display */}
          {dayCount !== null && dayCount > 0 && (
            <div className="text-center py-2 px-3 rounded-md bg-muted/50">
              <p className="text-sm font-medium text-foreground">
                {dayCount} {dayCount === 1 ? "día" : "días"} de vacaciones
              </p>
            </div>
          )}

          {/* Date Range Error */}
          {hasDateRangeError && (
            <div className="text-center py-2 px-3 rounded-md bg-destructive/10">
              <p className="text-sm text-destructive">
                La fecha de fin debe ser posterior o igual a la de inicio
              </p>
            </div>
          )}

          {/* Description Input (Optional) */}
          <div>
            <label
              htmlFor="vacation-description"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="vacation-description"
              type="text"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Ej: Vacaciones de verano, Navidad..."
              maxLength={100}
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 100 caracteres
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!canAdd || disabled}
              className="flex-1"
            >
              <Plane className="h-4 w-4 mr-2" />
              Añadir Vacaciones
            </Button>
            {hasInput && (
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={disabled}
                className="px-3"
                aria-label="Limpiar formulario"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
