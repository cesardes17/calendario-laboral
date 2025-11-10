/**
 * Extra Shift List Card Component
 *
 * Displays a list of configured extra shifts with delete functionality
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, Clock } from 'lucide-react';
import { TurnoExtra } from '@/src/core/domain/turnoExtra';

export interface ExtraShiftListCardProps {
  /** List of extra shifts to display */
  extraShifts: TurnoExtra[];

  /** Callback when removing an extra shift */
  onRemove: (date: Date) => void;
}

/**
 * ExtraShiftListCard component
 *
 * Shows all configured extra shifts with their date, hours, and description.
 * Allows users to delete extra shifts.
 *
 * @example
 * ```tsx
 * <ExtraShiftListCard
 *   extraShifts={extraShifts}
 *   onRemove={handleRemoveExtraShift}
 * />
 * ```
 */
export function ExtraShiftListCard({
  extraShifts,
  onRemove,
}: ExtraShiftListCardProps) {
  if (extraShifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Turnos Extras Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No hay turnos extras configurados. Añade un turno extra usando el
            formulario de arriba.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total hours
  const totalHours = extraShifts.reduce((sum, shift) => sum + shift.hours, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Turnos Extras Configurados</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {extraShifts.length} {extraShifts.length === 1 ? 'turno' : 'turnos'} ({totalHours.toFixed(2)}h total)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {extraShifts.map((extraShift) => (
            <div
              key={extraShift.date.toISOString()}
              className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {extraShift.getFormattedDate()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({extraShift.hours}h)
                  </span>
                </div>
                {extraShift.hasDescription() && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {extraShift.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(extraShift.date)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                title="Eliminar turno extra"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
