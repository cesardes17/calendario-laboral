/**
 * WorkingHoursConfigurator Component
 *
 * UI component for working hours configuration (HU-010)
 * Implements:
 * - Hours configuration for 4 day types (weekday, saturday, sunday, holiday)
 * - Visual card-based layout
 * - Real-time validation
 * - Clear visual feedback
 *
 * Redesigned to match WorkCycleConfigurator and YearSelector patterns
 */

"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Sun, PartyPopper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useWorkingHours } from "@/src/application/hooks/useWorkingHours";
import type { WorkingHoursConfig } from "@/src/core/domain/workingHours";
import { HoursInputCard } from "./workingHours/hoursInputCard";
import { WorkingHoursStatusAlerts } from "./workingHours/workingHoursStatusAlerts";

export interface WorkingHoursConfiguratorProps {
  /**
   * Initial configuration (optional)
   */
  initialConfig?: Partial<WorkingHoursConfig>;

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when valid configuration changes
   */
  onChange?: (config: WorkingHoursConfig) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const WorkingHoursConfigurator: React.FC<
  WorkingHoursConfiguratorProps
> = ({ initialConfig, onConfigurationChange, onChange, className = "" }) => {
  const {
    workingHours,
    weekdayInput,
    saturdayInput,
    sundayInput,
    holidayInput,
    weekdayValidation,
    saturdayValidation,
    sundayValidation,
    holidayValidation,
    isValid,
    updateWeekdayHours,
    updateSaturdayHours,
    updateSundayHours,
    updateHolidayHours,
  } = useWorkingHours(initialConfig);

  // Check if there are any errors
  const hasErrors =
    !weekdayValidation.isValid ||
    !saturdayValidation.isValid ||
    !sundayValidation.isValid ||
    !holidayValidation.isValid;

  // Notify parent when validity changes
  useEffect(() => {
    onConfigurationChange?.(isValid);
  }, [isValid, onConfigurationChange]);

  // Notify parent when valid configuration changes
  useEffect(() => {
    if (isValid && onChange) {
      onChange(workingHours.toJSON());
    }
  }, [workingHours, isValid, onChange]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horas de Trabajo
        </CardTitle>
        <CardDescription>
          Define cuántas horas trabajas según el tipo de día
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 pb-6">
        {/* Hours Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekday Hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            <HoursInputCard
              label="Lunes a Viernes"
              icon={Calendar}
              description="Días laborables normales"
              value={weekdayInput}
              onChange={updateWeekdayHours}
              isValid={weekdayValidation.isValid}
              error={weekdayValidation.error}
            />
          </motion.div>

          {/* Saturday Hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <HoursInputCard
              label="Sábado"
              icon={Calendar}
              description="Si trabajas en sábado"
              value={saturdayInput}
              onChange={updateSaturdayHours}
              isValid={saturdayValidation.isValid}
              error={saturdayValidation.error}
            />
          </motion.div>

          {/* Sunday Hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <HoursInputCard
              label="Domingo"
              icon={Sun}
              description="Si trabajas en domingo"
              value={sundayInput}
              onChange={updateSundayHours}
              isValid={sundayValidation.isValid}
              error={sundayValidation.error}
            />
          </motion.div>

          {/* Holiday Hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <HoursInputCard
              label="Festivo Trabajado"
              icon={PartyPopper}
              description="Cuando trabajas un festivo"
              value={holidayInput}
              onChange={updateHolidayHours}
              isValid={holidayValidation.isValid}
              error={holidayValidation.error}
            />
          </motion.div>
        </div>

        {/* Info Box */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <p>
            <strong>Nota:</strong> Estas horas se usarán para calcular tu
            balance anual de horas trabajadas vs. horas de convenio. Puedes
            usar decimales (ej: 7.5 horas).
          </p>
        </div>

        {/* Status Alerts */}
        <WorkingHoursStatusAlerts
          isValid={isValid}
          hasErrors={hasErrors}
          workingHours={workingHours}
        />
      </CardContent>
    </Card>
  );
};
