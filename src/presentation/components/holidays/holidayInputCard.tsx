/**
 * HolidayInputCard Component
 *
 * Card for adding new holidays with date picker and optional name input
 * Features:
 * - Native date input for selecting holiday date
 * - Optional text input for holiday name
 * - Add button with validation
 * - Clear button to reset form
 */

"use client";

import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { Card, CardContent } from "../ui";
import { Button } from "../ui/button";

interface HolidayInputCardProps {
  onAdd: (date: Date, name: string) => void;
  selectedYear: number;
  disabled?: boolean;
}

export function HolidayInputCard({
  onAdd,
  selectedYear,
  disabled = false,
}: HolidayInputCardProps) {
  const [dateInput, setDateInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Generate min and max dates for the selected year
  const minDate = `${selectedYear}-01-01`;
  const maxDate = `${selectedYear}-12-31`;

  const handleAdd = () => {
    if (!dateInput) return;

    const date = new Date(dateInput);
    onAdd(date, nameInput.trim());

    // Clear inputs after adding
    setDateInput("");
    setNameInput("");
  };

  const handleClear = () => {
    setDateInput("");
    setNameInput("");
  };

  const canAdd = dateInput.length > 0;
  const hasInput = dateInput || nameInput;

  return (
    <Card>
      <CardContent className="pt-6 pb-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CalendarPlus className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-foreground">
                Añadir Festivo
              </h4>
              <p className="text-sm text-muted-foreground">
                Selecciona la fecha y añade un nombre (opcional)
              </p>
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label
              htmlFor="holiday-date"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Fecha del festivo
            </label>
            <input
              id="holiday-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              min={minDate}
              max={maxDate}
              disabled={disabled}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Name Input (Optional) */}
          <div>
            <label
              htmlFor="holiday-name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Nombre del festivo <span className="text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="holiday-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Ej: Año Nuevo, Día del Trabajo..."
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
              <CalendarPlus className="h-4 w-4 mr-2" />
              Añadir Festivo
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
