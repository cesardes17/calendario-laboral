/**
 * HolidayManagerConfigurator Component
 *
 * UI component for holiday management (HU-007)
 * Implements:
 * - Adding holidays with date and optional name
 * - Listing all added holidays
 * - Removing holidays
 * - Validation and error handling
 * - Visual card-based layout
 *
 * Follows the pattern established by WorkCycleConfigurator and other wizard steps
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useHolidays } from "@/src/application/hooks/useHolidays";
import { useYearSelection } from "@/src/application/hooks/useYearSelection";
import { Holiday } from "@/src/core/domain/holiday";
import { Year } from "@/src/core/domain/year";
import { HolidayInputCard } from "./holidays/holidayInputCard";
import { HolidayListCard } from "./holidays/holidayListCard";
import { HolidayStatusAlerts } from "./holidays/holidayStatusAlerts";

export interface HolidayManagerConfiguratorProps {
  /**
   * Initial year for validation (optional)
   */
  initialYear?: number;

  /**
   * Initial holidays to load (optional)
   */
  initialHolidays?: Holiday[];

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when holidays change
   */
  onHolidaysChange?: (holidays: Holiday[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const HolidayManagerConfigurator: React.FC<
  HolidayManagerConfiguratorProps
> = ({
  initialYear,
  initialHolidays,
  onConfigurationChange,
  onHolidaysChange,
  className = "",
}) => {
  const { selectedYear } = useYearSelection(initialYear);

  // Create Year object from selectedYear for hook
  const yearObj = React.useMemo(() => {
    const result = Year.create(selectedYear);
    return result.isSuccess() ? result.getValue() : null;
  }, [selectedYear]);

  const {
    holidays,
    addHoliday: addHolidayHook,
    removeHoliday: removeHolidayHook,
    error,
    clearError,
    getCount,
    setHolidays,
  } = useHolidays(yearObj);

  // Load initial holidays if provided
  React.useEffect(() => {
    if (initialHolidays && initialHolidays.length > 0) {
      setHolidays(initialHolidays);
    }
  }, [initialHolidays, setHolidays]);

  // Handle adding a holiday
  const handleAddHoliday = useCallback(
    (date: Date, name: string) => {
      clearError();

      // Create Holiday value object
      const holidayResult = Holiday.create({ date, name });

      if (holidayResult.isFailure()) {
        // This will be handled by the error state from the hook
        return;
      }

      const success = addHolidayHook(holidayResult.getValue());

      if (!success) {
        // Error is already set by the hook
        return;
      }
    },
    [addHolidayHook, clearError]
  );

  // Handle removing a holiday
  const handleRemoveHoliday = useCallback(
    (date: Date) => {
      clearError();
      removeHolidayHook(date);
    },
    [removeHolidayHook, clearError]
  );

  // Validation: Always valid (holidays are optional)
  // User can proceed even with 0 holidays
  const isValid = React.useMemo(() => {
    return true; // Always valid, holidays are optional
  }, []);

  // Notify parent of validation state (always true)
  useEffect(() => {
    onConfigurationChange?.(isValid);
  }, [isValid, onConfigurationChange]);

  // Notify parent of holidays changes
  useEffect(() => {
    if (onHolidaysChange) {
      onHolidaysChange(holidays);
    }
  }, [holidays, onHolidaysChange]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Gestión de Festivos
        </CardTitle>
        <CardDescription>
          Añade los días festivos del año que correspondan a tu calendario laboral
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Holiday Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HolidayInputCard
            onAdd={handleAddHoliday}
            selectedYear={selectedYear}
            disabled={false}
          />
        </motion.div>

        {/* Holiday List Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <HolidayListCard
            holidays={holidays}
            onRemove={handleRemoveHoliday}
            disabled={false}
          />
        </motion.div>

        {/* Status Alerts */}
        <HolidayStatusAlerts
          error={error}
          holidayCount={getCount()}
        />
      </CardContent>
    </Card>
  );
};
