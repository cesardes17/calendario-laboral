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
import { useHolidayPolicy } from "@/src/application/hooks/useHolidayPolicy";
import type { WorkingHoursConfig } from "@/src/core/domain/workingHours";
import type { HolidayPolicyType } from "@/src/core/domain/holidayPolicy";
import { HoursInputCard } from "./workingHours/hoursInputCard";
import { WorkingHoursStatusAlerts } from "./workingHours/workingHoursStatusAlerts";

export interface WorkingHoursConfiguratorProps {
  /**
   * Initial configuration (optional)
   */
  initialConfig?: Partial<WorkingHoursConfig>;

  /**
   * Initial holiday policy (optional)
   */
  initialHolidayPolicy?: HolidayPolicyType;

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when valid configuration changes
   */
  onChange?: (config: WorkingHoursConfig) => void;

  /**
   * Callback when holiday policy changes
   */
  onHolidayPolicyChange?: (policyType: HolidayPolicyType) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const WorkingHoursConfigurator: React.FC<
  WorkingHoursConfiguratorProps
> = ({
  initialConfig,
  initialHolidayPolicy,
  onConfigurationChange,
  onChange,
  onHolidayPolicyChange,
  className = ""
}) => {
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

  const {
    holidayPolicy,
    respectsHolidays,
    togglePolicy,
  } = useHolidayPolicy(initialHolidayPolicy);

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

  // Notify parent when holiday policy changes
  useEffect(() => {
    onHolidayPolicyChange?.(holidayPolicy.type);
  }, [holidayPolicy, onHolidayPolicyChange]);

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

        {/* Holiday Policy Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="border-t pt-6"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="respectsHolidays"
                checked={respectsHolidays}
                onChange={togglePolicy}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              />
              <div className="flex-1">
                <label
                  htmlFor="respectsHolidays"
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Respeto festivos (no trabajo en días festivos)
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {respectsHolidays
                    ? "Los festivos nunca se trabajarán, independientemente de tu ciclo laboral"
                    : "Los festivos se trabajarán solo si tu ciclo indica que es un día de trabajo"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

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
