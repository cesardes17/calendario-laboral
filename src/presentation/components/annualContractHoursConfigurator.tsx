/**
 * AnnualContractHoursConfigurator Component
 *
 * UI component for annual contract hours configuration (HU-011)
 * Implements:
 * - Annual hours input with validation
 * - Weekly hours calculator (collapsible)
 * - Quick presets for common values
 * - Warning system for unusual values
 * - Visual card-based layout
 *
 * Redesigned to match WorkCycleConfigurator and WorkingHoursConfigurator patterns
 */

"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useAnnualContractHours } from "@/src/application/hooks/useAnnualContractHours";
import { AnnualHoursInputCard } from "./annualHours/annualHoursInputCard";
import { AnnualHoursStatusAlerts } from "./annualHours/annualHoursStatusAlerts";

export interface AnnualContractHoursConfiguratorProps {
  /**
   * Initial hours (optional)
   */
  initialHours?: number;

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when valid hours change
   */
  onValidHours?: (annualHours: number) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const AnnualContractHoursConfigurator: React.FC<
  AnnualContractHoursConfiguratorProps
> = ({
  initialHours,
  onConfigurationChange,
  onValidHours,
  className = "",
}) => {
  const {
    annualHours,
    annualInput,
    annualError,
    warning,
    setAnnualHours,
    isValid,
    getFormattedWeeklyHours,
  } = useAnnualContractHours();

  // Track if initial hours have been loaded
  const initialHoursLoadedRef = React.useRef(false);

  // Load initial hours if provided (only once)
  useEffect(() => {
    if (initialHours !== undefined && !initialHoursLoadedRef.current) {
      setAnnualHours(initialHours.toString());
      initialHoursLoadedRef.current = true;
    }
  }, [initialHours, setAnnualHours]);

  // Notify parent when validity changes
  useEffect(() => {
    onConfigurationChange?.(isValid());
  }, [isValid, onConfigurationChange]);

  // Notify parent when valid hours change
  useEffect(() => {
    if (isValid() && annualHours && onValidHours) {
      onValidHours(annualHours.getValue());
    }
  }, [annualHours, isValid, onValidHours]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Horas de Convenio Anual
        </CardTitle>
        <CardDescription>
          Define las horas totales establecidas en tu convenio laboral
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Main Annual Hours Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnnualHoursInputCard
            value={annualInput}
            onChange={setAnnualHours}
            isValid={isValid()}
            error={annualError}
            weeklyEquivalent={
              isValid() && annualHours
                ? getFormattedWeeklyHours()
                : undefined
            }
          />
        </motion.div>

        {/* Status Alerts */}
        <AnnualHoursStatusAlerts
          isValid={isValid()}
          annualHours={annualHours?.getValue() ?? null}
          weeklyHours={getFormattedWeeklyHours()}
          warning={warning}
        />
      </CardContent>
    </Card>
  );
};
