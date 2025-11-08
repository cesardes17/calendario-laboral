/**
 * GuardiaManagerConfigurator Component
 *
 * UI component for guardia (on-call shift) management
 * Implements:
 * - Adding guardias with date, hours, and optional description
 * - Listing all added guardias
 * - Removing guardias
 * - Validation and error handling
 * - Visual card-based layout
 *
 * Note: Only applicable for weekly cycles (modo: 'semanal')
 * Guardias can only be assigned to rest days or holidays
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { useGuardias } from "@/src/application/hooks/useGuardias";
import { useYearSelection } from "@/src/application/hooks/useYearSelection";
import { Guardia } from "@/src/core/domain/guardia";
import { Year } from "@/src/core/domain/year";
import { GuardiaInputCard } from "./guardias/guardiaInputCard";
import { GuardiaListCard } from "./guardias/guardiaListCard";

export interface GuardiaManagerConfiguratorProps {
  /**
   * Initial year for validation (optional)
   */
  initialYear?: number;

  /**
   * Initial guardias to load (optional)
   */
  initialGuardias?: Guardia[];

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when guardias change
   */
  onGuardiasChange?: (guardias: Guardia[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const GuardiaManagerConfigurator: React.FC<
  GuardiaManagerConfiguratorProps
> = ({
  initialYear,
  initialGuardias,
  onConfigurationChange,
  onGuardiasChange,
  className = "",
}) => {
  const { selectedYear } = useYearSelection(initialYear);

  // Create Year object from selectedYear for hook
  const yearObj = React.useMemo(() => {
    const result = Year.create(selectedYear);
    return result.isSuccess() ? result.getValue() : null;
  }, [selectedYear]);

  const {
    guardias,
    addGuardia: addGuardiaHook,
    removeGuardia: removeGuardiaHook,
    error,
    clearError,
    getCount,
    getTotalHours,
    setGuardias,
  } = useGuardias(yearObj);

  // Load initial guardias if provided
  React.useEffect(() => {
    if (initialGuardias && initialGuardias.length > 0) {
      setGuardias(initialGuardias);
    }
  }, [initialGuardias, setGuardias]);

  // Handle adding a guardia
  const handleAddGuardia = useCallback(
    (date: Date, hours: number, description: string) => {
      clearError();

      // Create Guardia value object
      const guardiaResult = Guardia.create({ date, hours, description });

      if (guardiaResult.isFailure()) {
        // This will be handled by the error state from the hook
        return;
      }

      const success = addGuardiaHook(guardiaResult.getValue());

      if (!success) {
        // Error is already set by the hook
        return;
      }
    },
    [addGuardiaHook, clearError]
  );

  // Handle removing a guardia
  const handleRemoveGuardia = useCallback(
    (date: Date) => {
      clearError();
      removeGuardiaHook(date);
    },
    [removeGuardiaHook, clearError]
  );

  // Validation: Always valid (guardias are optional)
  // User can proceed even with 0 guardias
  const isValid = React.useMemo(() => {
    return true; // Always valid, guardias are optional
  }, []);

  // Notify parent of validation state (always true)
  useEffect(() => {
    onConfigurationChange?.(isValid);
  }, [isValid, onConfigurationChange]);

  // Notify parent of guardias changes
  useEffect(() => {
    if (onGuardiasChange) {
      onGuardiasChange(guardias);
    }
  }, [guardias, onGuardiasChange]);

  const totalHours = getTotalHours();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          Gestión de Guardias
        </CardTitle>
        <CardDescription>
          Añade las guardias realizadas en días de descanso o festivos. Solo aplica para ciclos semanales.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Info Alert */}
        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-sm text-amber-900 dark:text-amber-100">
            Las guardias solo pueden añadirse en días de descanso según tu ciclo semanal o en días festivos.
            Especifica las horas trabajadas en cada guardia.
          </AlertDescription>
        </Alert>

        {/* Guardia Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GuardiaInputCard
            onAdd={handleAddGuardia}
            selectedYear={selectedYear}
            disabled={false}
          />
        </motion.div>

        {/* Guardia List Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GuardiaListCard
            guardias={guardias}
            onRemove={handleRemoveGuardia}
            disabled={false}
          />
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary */}
        {getCount() > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            {getCount()} {getCount() === 1 ? 'guardia añadida' : 'guardias añadidas'} • {totalHours}h totales
          </div>
        )}
      </CardContent>
    </Card>
  );
};
