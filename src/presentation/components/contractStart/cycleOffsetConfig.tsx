/**
 * CycleOffsetConfig Component
 *
 * Configuration for cycle offset (when user worked before the selected year)
 * Allows user to specify:
 * - Part number in the cycle
 * - Day within that part
 * - Day type (work or rest)
 *
 * Features:
 * - Number inputs with validation
 * - Toggle buttons for day type
 * - Visual feedback
 * - Responsive layout
 */

"use client";

import { Settings2, Briefcase, Home } from "lucide-react";
import { CycleDayType } from "@/src/core/domain/cycleOffset";
import { Card, CardContent, Button } from "../ui";

interface CycleOffsetConfigProps {
  partNumber: number;
  dayWithinPart: number;
  dayType: CycleDayType;
  onPartNumberChange: (value: number) => void;
  onDayWithinPartChange: (value: number) => void;
  onDayTypeChange: (type: CycleDayType) => void;
  maxParts?: number;
}

export function CycleOffsetConfig({
  partNumber,
  dayWithinPart,
  dayType,
  onPartNumberChange,
  onDayWithinPartChange,
  onDayTypeChange,
  maxParts,
}: CycleOffsetConfigProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        Posición en el ciclo el 1 de enero
      </h3>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Part Number Input */}
          <div className="space-y-3">
            <label
              htmlFor="part-number"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Settings2 className="h-4 w-4" />
              Número de parte
            </label>
            <input
              id="part-number"
              type="number"
              min={1}
              max={maxParts}
              value={partNumber}
              onChange={(e) => onPartNumberChange(parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Número de parte del ciclo"
            />
            <p className="text-xs text-muted-foreground">
              ¿En qué parte de tu ciclo estabas?
              {maxParts && ` (1-${maxParts})`}
            </p>
          </div>

          {/* Day Within Part Input */}
          <div className="space-y-3">
            <label
              htmlFor="day-within-part"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Settings2 className="h-4 w-4" />
              Día dentro de la parte
            </label>
            <input
              id="day-within-part"
              type="number"
              min={1}
              value={dayWithinPart}
              onChange={(e) =>
                onDayWithinPartChange(parseInt(e.target.value, 10))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Día dentro de la parte"
            />
            <p className="text-xs text-muted-foreground">
              ¿Qué día de esa parte era el 1 de enero?
            </p>
          </div>

          {/* Day Type Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tipo de día</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={dayType === CycleDayType.WORK ? "default" : "outline"}
                className="w-full flex items-center justify-center gap-2"
                onClick={() => onDayTypeChange(CycleDayType.WORK)}
                aria-pressed={dayType === CycleDayType.WORK}
              >
                <Briefcase className="h-4 w-4" />
                Trabajo
              </Button>
              <Button
                type="button"
                variant={dayType === CycleDayType.REST ? "default" : "outline"}
                className="w-full flex items-center justify-center gap-2"
                onClick={() => onDayTypeChange(CycleDayType.REST)}
                aria-pressed={dayType === CycleDayType.REST}
              >
                <Home className="h-4 w-4" />
                Descanso
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ¿Era un día de trabajo o descanso?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
