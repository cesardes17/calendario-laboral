/**
 * HolidayStatusAlerts Component
 *
 * Displays success, error, and info alerts for holiday management
 * Features:
 * - Error alert when operations fail
 * - Success alert when holidays are added/removed
 * - Info box with helpful guidance
 * - Smooth animations
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface HolidayStatusAlertsProps {
  error: string | null;
  holidayCount: number;
}

export function HolidayStatusAlerts({
  error,
  holidayCount,
}: HolidayStatusAlertsProps) {
  return (
    <div className="space-y-4">
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Alert */}
      <AnimatePresence>
        {!error && holidayCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Festivos configurados:</strong> {holidayCount}{" "}
                {holidayCount === 1 ? "festivo añadido" : "festivos añadidos"}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Alert className="border-blue-500/30 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm text-muted-foreground">
            Los festivos se aplicarán a todo el año seleccionado. Según tu
            ciclo de trabajo, algunos festivos podrían coincidir con días de
            descanso o ser trabajados.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
