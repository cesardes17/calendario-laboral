/**
 * Extra Shift Manager Configurator Component
 *
 * Main component for managing extra shifts in the wizard workflow
 */

import React, { useEffect } from 'react';
import { ExtraShiftInputCard } from './extraShifts/extraShiftInputCard';
import { ExtraShiftListCard } from './extraShifts/extraShiftListCard';
import { useExtraShifts } from '@/src/application/hooks/useExtraShifts';
import { useYearSelection } from '@/src/application/hooks/useYearSelection';
import { Year } from '@/src/core/domain/year';
import { TurnoExtra } from '@/src/core/domain/turnoExtra';

export interface ExtraShiftManagerConfiguratorProps {
  /** Initial year for validation (optional) */
  initialYear?: number;

  /** Initial extra shifts to load (optional) */
  initialExtraShifts?: TurnoExtra[];

  /** Callback when configuration validity changes */
  onConfigurationChange?: (isValid: boolean) => void;

  /** Callback when extra shifts change */
  onExtraShiftsChange?: (extraShifts: TurnoExtra[]) => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * ExtraShiftManagerConfigurator component
 *
 * Provides a complete interface for managing extra shifts:
 * - Adding new extra shifts
 * - Viewing configured extra shifts
 * - Removing extra shifts
 *
 * @example
 * ```tsx
 * <ExtraShiftManagerConfigurator
 *   initialYear={2025}
 *   onExtraShiftsChange={handleExtraShiftsChange}
 * />
 * ```
 */
export function ExtraShiftManagerConfigurator({
  initialYear,
  initialExtraShifts,
  onConfigurationChange,
  onExtraShiftsChange,
  className = "",
}: ExtraShiftManagerConfiguratorProps) {
  const { selectedYear } = useYearSelection(initialYear);

  // Create Year object from selectedYear for hook
  const yearObj = React.useMemo(() => {
    const result = Year.create(selectedYear);
    return result.isSuccess() ? result.getValue() : null;
  }, [selectedYear]);

  const {
    extraShifts,
    setExtraShifts,
    addExtraShift,
    removeExtraShift,
    error,
    clearError,
  } = useExtraShifts(yearObj);

  // Load initial extra shifts if provided
  useEffect(() => {
    if (initialExtraShifts && initialExtraShifts.length > 0) {
      setExtraShifts(initialExtraShifts);
    }
  }, [initialExtraShifts, setExtraShifts]);

  // Notify parent of changes
  useEffect(() => {
    onExtraShiftsChange?.(extraShifts);
  }, [extraShifts, onExtraShiftsChange]);

  // Notify parent of validity (always valid for extra shifts)
  useEffect(() => {
    onConfigurationChange?.(true);
  }, [onConfigurationChange]);

  if (!yearObj) {
    return (
      <div className="p-6 border rounded-lg bg-muted/50">
        <p className="text-center text-muted-foreground">
          Debes seleccionar un año primero para configurar turnos extras.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Info section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          ¿Qué son los turnos extras?
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          Los turnos extras son horas adicionales trabajadas cuando cubres a un compañero
          que no puede realizar su turno. Estas horas se suman a tus horas base del día,
          y puedes aplicarlas a cualquier día del calendario (laboral, descanso, festivo, etc.).
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-400 mt-2">
          Ejemplo: Si tu jornada normal es de 8h y haces un turno extra de 8h, ese día
          trabajarás un total de 16h.
        </p>
      </div>

      {/* Input form */}
      <ExtraShiftInputCard
        year={yearObj.value}
        onAdd={addExtraShift}
        error={error}
        onClearError={clearError}
      />

      {/* List of extra shifts */}
      <ExtraShiftListCard
        extraShifts={extraShifts}
        onRemove={removeExtraShift}
      />
    </div>
  );
}
