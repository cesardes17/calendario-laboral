/**
 * VacationManagerConfigurator Component
 *
 * UI component for vacation management (HU-014)
 * Implements:
 * - Adding vacation periods with date ranges and optional description
 * - Listing all added vacation periods
 * - Removing vacation periods
 * - Progress bar showing days used vs 30-day limit
 * - Validation and error handling
 * - Visual card-based layout
 *
 * Follows the pattern established by HolidayManagerConfigurator
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useVacations } from "@/src/application/hooks/useVacations";
import { useYearSelection } from "@/src/application/hooks/useYearSelection";
import { VacationPeriod } from "@/src/core/domain/vacationPeriod";
import { Year } from "@/src/core/domain/year";
import { VacationInputCard } from "./vacations/vacationInputCard";
import { VacationProgressCard } from "./vacations/vacationProgressCard";
import { VacationListCard } from "./vacations/vacationListCard";
import { VacationStatusAlerts } from "./vacations/vacationStatusAlerts";

export interface VacationManagerConfiguratorProps {
  /**
   * Initial year for validation (optional)
   */
  initialYear?: number;

  /**
   * Initial vacations to load (optional)
   */
  initialVacations?: VacationPeriod[];

  /**
   * Contract start date for proportional vacation calculation (optional)
   */
  contractStartDate?: Date;

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when vacations change
   */
  onVacationsChange?: (vacations: VacationPeriod[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const VacationManagerConfigurator: React.FC<
  VacationManagerConfiguratorProps
> = ({
  initialYear,
  initialVacations,
  contractStartDate,
  onConfigurationChange,
  onVacationsChange,
  className = "",
}) => {
  const { selectedYear } = useYearSelection(initialYear);

  // Create Year object from selectedYear for hook
  const yearObj = React.useMemo(() => {
    const result = Year.create(selectedYear);
    return result.isSuccess() ? result.getValue() : null;
  }, [selectedYear]);

  const {
    vacations,
    addVacation: addVacationHook,
    removeVacation: removeVacationHook,
    error,
    clearError,
    totalDays,
    maxVacationDays,
    getCount,
    setVacations,
  } = useVacations(yearObj, contractStartDate);

  // Load initial vacations if provided
  React.useEffect(() => {
    if (initialVacations && initialVacations.length > 0) {
      setVacations(initialVacations);
    }
  }, [initialVacations, setVacations]);

  // Handle adding a vacation period
  const handleAddVacation = useCallback(
    (startDate: Date, endDate: Date, description: string) => {
      clearError();

      // Create VacationPeriod value object
      const vacationResult = VacationPeriod.create({
        startDate,
        endDate,
        description,
      });

      if (vacationResult.isFailure()) {
        // This will be handled by the error state from the hook
        return;
      }

      const success = addVacationHook(vacationResult.getValue());

      if (!success) {
        // Error is already set by the hook
        return;
      }
    },
    [addVacationHook, clearError]
  );

  // Handle removing a vacation period
  const handleRemoveVacation = useCallback(
    (index: number) => {
      clearError();
      removeVacationHook(index);
    },
    [removeVacationHook, clearError]
  );

  // Validation: Always valid (vacations are optional)
  // User can proceed even with 0 vacations
  const isValid = React.useMemo(() => {
    return true; // Always valid, vacations are optional
  }, []);

  // Notify parent of validation state (always true)
  useEffect(() => {
    onConfigurationChange?.(isValid);
  }, [isValid, onConfigurationChange]);

  // Notify parent of vacations changes
  useEffect(() => {
    if (onVacationsChange) {
      onVacationsChange(vacations);
    }
  }, [vacations, onVacationsChange]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Gestión de Vacaciones
        </CardTitle>
        <CardDescription>
          Añade tus períodos de vacaciones para el año (máximo {maxVacationDays} días)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Vacation Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VacationInputCard
            onAdd={handleAddVacation}
            selectedYear={selectedYear}
            disabled={false}
          />
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <VacationProgressCard totalDays={totalDays} maxVacationDays={maxVacationDays} />
        </motion.div>

        {/* Vacation List Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <VacationListCard
            vacations={vacations}
            onRemove={handleRemoveVacation}
            disabled={false}
          />
        </motion.div>

        {/* Status Alerts */}
        <VacationStatusAlerts
          error={error}
          vacationCount={getCount()}
          totalDays={totalDays}
        />
      </CardContent>
    </Card>
  );
};
