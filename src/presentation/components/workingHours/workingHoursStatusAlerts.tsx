/**
 * WorkingHoursStatusAlerts Component
 *
 * Displays success and error alerts for working hours configuration
 * Features:
 * - Success alert with configuration summary
 * - Error alerts for validation issues
 * - Smooth animations
 * - Icon feedback
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import type { WorkingHours } from "@/src/core/domain/workingHours";

interface WorkingHoursStatusAlertsProps {
  isValid: boolean;
  hasErrors: boolean;
  workingHours: WorkingHours;
}

export function WorkingHoursStatusAlerts({
  isValid,
  hasErrors,
  workingHours,
}: WorkingHoursStatusAlertsProps) {
  const config = workingHours.getAll();

  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <AnimatePresence>
        {isValid && !hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Configuración válida:</strong> L-V: {config.weekday}h,
                Sáb: {config.saturday}h, Dom: {config.sunday}h, Festivo:{" "}
                {config.holiday}h
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              className="border-red-500/50 bg-red-500/10"
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor, corrige los errores antes de continuar
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
