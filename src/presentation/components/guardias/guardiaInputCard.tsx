/**
 * GuardiaInputCard Component
 *
 * Card for adding new guardias (on-call shifts) with date picker, hours input, and optional description
 * Features:
 * - Native date input for selecting guardia date
 * - Number input for hours worked (0-24)
 * - Optional text input for description/notes
 * - Add button with validation
 * - Clear button to reset form
 */

"use client";

import { useState } from "react";
import { Shield, X } from "lucide-react";
import { Card, CardContent } from "../ui";
import { Button } from "../ui/button";

interface GuardiaInputCardProps {
  onAdd: (date: Date, hours: number, description: string) => void;
  selectedYear: number;
  disabled?: boolean;
}

export function GuardiaInputCard({
  onAdd,
  selectedYear,
  disabled = false,
}: GuardiaInputCardProps) {
  const [dateInput, setDateInput] = useState("");
  const [hoursInput, setHoursInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  // Generate min and max dates for the selected year
  const minDate = `${selectedYear}-01-01`;
  const maxDate = `${selectedYear}-12-31`;

  const handleAdd = () => {
    if (!dateInput || !hoursInput) return;

    const date = new Date(dateInput);
    const hours = parseFloat(hoursInput);

    // Validate hours
    if (hours < 0 || hours > 24 || isNaN(hours)) {
      return;
    }

    onAdd(date, hours, descriptionInput.trim());

    // Clear inputs after adding
    setDateInput("");
    setHoursInput("");
    setDescriptionInput("");
  };

  const handleClear = () => {
    setDateInput("");
    setHoursInput("");
    setDescriptionInput("");
  };

  const canAdd = dateInput.length > 0 && hoursInput.length > 0;
  const hasInput = dateInput || hoursInput || descriptionInput;

  return (
    <Card>
      <CardContent className="pt-6 pb-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground">
                Añadir Guardia
              </h4>
              <p className="text-sm text-muted-foreground">
                Solo en días de descanso o festivos
              </p>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label
              htmlFor="guardia-date"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Fecha de la guardia
            </label>
            <input
              id="guardia-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              min={minDate}
              max={maxDate}
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Hours Input */}
          <div>
            <label
              htmlFor="guardia-hours"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Horas trabajadas
            </label>
            <input
              id="guardia-hours"
              type="number"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              min="0"
              max="24"
              step="0.5"
              placeholder="Ej: 12"
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Entre 0 y 24 horas
            </p>
          </div>

          {/* Description Input (Optional) */}
          <div>
            <label
              htmlFor="guardia-description"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Observaciones <span className="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="guardia-description"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Ej: Guardia de fin de semana, urgencias..."
              maxLength={200}
              rows={2}
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Máximo 200 caracteres
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={!canAdd || disabled}
              className="flex-1 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              <Shield className="h-4 w-4 mr-2" />
              Añadir Guardia
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
