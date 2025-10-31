/**
 * CycleOffsetConfig Component
 *
 * Configuration for cycle offset (when user worked before the selected year)
 * Allows user to specify:
 * - Part number in the cycle (first dropdown)
 * - Exact day and type within that part (second dropdown - dynamic)
 *
 * Features:
 * - Two-step selection for better UX
 * - Dynamic options generated from work cycle
 * - Second dropdown updates based on selected part
 * - Clear descriptions for each option
 * - Prevents invalid inputs
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ListOrdered } from "lucide-react";
import { CycleDayType } from "@/src/core/domain/cycleOffset";
import { WorkCycle } from "@/src/core/domain/workCycle";
import { Card, CardContent } from "../ui";

interface DayOption {
  dayWithinPart: number;
  dayType: CycleDayType;
  label: string;
  value: string;
}

interface PartInfo {
  partNumber: number;
  workDays: number;
  restDays: number;
  label: string;
}

interface CycleOffsetConfigProps {
  partNumber: number;
  dayWithinPart: number;
  dayType: CycleDayType;
  onPartNumberChange: (value: number) => void;
  onDayWithinPartChange: (value: number) => void;
  onDayTypeChange: (type: CycleDayType) => void;
  workCycle?: WorkCycle | null;
}

export function CycleOffsetConfig({
  partNumber,
  dayWithinPart,
  dayType,
  onPartNumberChange,
  onDayWithinPartChange,
  onDayTypeChange,
  workCycle,
}: CycleOffsetConfigProps) {
  // Local state for selected part (to trigger re-render of day options)
  const [selectedPart, setSelectedPart] = useState<number>(partNumber);

  // Update local state when prop changes
  useEffect(() => {
    setSelectedPart(partNumber);
  }, [partNumber]);

  // Generate part options from work cycle
  const partOptions = useMemo<PartInfo[]>(() => {
    if (!workCycle || workCycle.isWeekly()) {
      return [];
    }

    const parts = workCycle.getParts();
    if (!parts || parts.length === 0) {
      return [];
    }

    return parts.map((part, index) => ({
      partNumber: index + 1,
      workDays: part.workDays,
      restDays: part.restDays,
      label: `Parte ${index + 1} (${part.workDays} trabajo, ${part.restDays} descanso)`,
    }));
  }, [workCycle]);

  // Generate day options for the currently selected part
  const dayOptions = useMemo<DayOption[]>(() => {
    if (partOptions.length === 0) {
      return [];
    }

    const currentPart = partOptions.find((p) => p.partNumber === selectedPart);
    if (!currentPart) {
      return [];
    }

    const options: DayOption[] = [];

    // Add work day options
    for (let day = 1; day <= currentPart.workDays; day++) {
      options.push({
        dayWithinPart: day,
        dayType: CycleDayType.WORK,
        label: `Trabajo día ${day}`,
        value: `${day}-WORK`,
      });
    }

    // Add rest day options
    for (let day = 1; day <= currentPart.restDays; day++) {
      options.push({
        dayWithinPart: day,
        dayType: CycleDayType.REST,
        label: `Descanso día ${day}`,
        value: `${day}-REST`,
      });
    }

    return options;
  }, [partOptions, selectedPart]);

  // Handle part selection change
  const handlePartChange = (value: string) => {
    const newPartNumber = parseInt(value, 10);
    setSelectedPart(newPartNumber);
    onPartNumberChange(newPartNumber);

    // Reset to first work day of new part
    onDayWithinPartChange(1);
    onDayTypeChange(CycleDayType.WORK);
  };

  // Handle day selection change
  const handleDayChange = (value: string) => {
    const selectedOption = dayOptions.find((opt) => opt.value === value);
    if (selectedOption) {
      onDayWithinPartChange(selectedOption.dayWithinPart);
      onDayTypeChange(selectedOption.dayType);
    }
  };

  // Current value for day selector
  const currentDayValue = `${dayWithinPart}-${dayType}`;

  // Show fallback if no options available
  if (partOptions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          Posición en el ciclo el 1 de enero
        </h3>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No se pudo generar las opciones. Asegúrate de haber configurado
              correctamente tu ciclo de trabajo por partes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        Posición en el ciclo el 1 de enero
      </h3>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Part Selector */}
          <div className="space-y-3">
            <label
              htmlFor="part-selector"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ListOrdered className="h-4 w-4" />
              Parte del ciclo
            </label>
            <select
              id="part-selector"
              value={selectedPart}
              onChange={(e) => handlePartChange(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              aria-label="Parte del ciclo"
            >
              {partOptions.map((part) => (
                <option key={part.partNumber} value={part.partNumber}>
                  {part.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              ¿En qué parte de tu ciclo te encontrabas?
            </p>
          </div>

          {/* Day and Type Selector (updates dynamically) */}
          <div className="space-y-3">
            <label
              htmlFor="day-selector"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Calendar className="h-4 w-4" />
              Día y tipo dentro de la parte
            </label>
            <select
              id="day-selector"
              value={currentDayValue}
              onChange={(e) => handleDayChange(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              aria-label="Día y tipo dentro de la parte"
            >
              {dayOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              ¿Qué día específico era el 1 de enero?
            </p>
          </div>

          {/* Visual summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-foreground">
              Resumen de tu selección:
            </p>
            <p className="text-sm text-muted-foreground">
              El 1 de enero estabas en la{" "}
              <span className="font-semibold text-foreground">
                Parte {partNumber}
              </span>
              , en el{" "}
              <span className="font-semibold text-foreground">
                día {dayWithinPart} de{" "}
                {dayType === CycleDayType.WORK ? "trabajo" : "descanso"}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
