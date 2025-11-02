/**
 * ContractDatePicker Component
 *
 * Date picker for selecting contract start date
 * Features:
 * - Native HTML date input with proper styling
 * - Year validation
 * - Clear visual feedback
 * - Responsive design
 */

"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent } from "../ui";

interface ContractDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  yearValue: number;
}

export function ContractDatePicker({
  selectedDate,
  onDateChange,
  yearValue,
}: ContractDatePickerProps) {
  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";

    // Ensure we have a Date object (handle string case from localStorage)
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return "";

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle date change from input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;

    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      onDateChange(date);
    }
  };

  // Calculate min and max dates for the input
  const minDate = `${yearValue}-01-01`;
  const maxDate = `${yearValue}-12-31`;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        Fecha de inicio de contrato
      </h3>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <label
              htmlFor="contract-date"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Calendar className="h-4 w-4" />
              Selecciona la fecha
            </label>
            <input
              id="contract-date"
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              min={minDate}
              max={maxDate}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Fecha de inicio de contrato"
            />
            <p className="text-xs text-muted-foreground">
              La fecha debe estar dentro del año {yearValue}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
