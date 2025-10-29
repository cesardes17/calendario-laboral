/**
 * VacationStatusAlerts Component
 *
 * Displays success, error, and info alerts for vacation management
 * Features:
 * - Error alert when operations fail
 * - Success alert when vacations are added/removed
 * - Warning alert when approaching limit (>80%)
 * - Info box with helpful guidance
 * - Smooth animations
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface VacationStatusAlertsProps {
  error: string | null;
  vacationCount: number;
  totalDays: number;
  maxDays?: number;
}

const DEFAULT_MAX_DAYS = 30;

export function VacationStatusAlerts({
  error,
  vacationCount,
  totalDays,
  maxDays = DEFAULT_MAX_DAYS,
}: VacationStatusAlertsProps) {
  const percentage = (totalDays / maxDays) * 100;
  const isApproachingLimit = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;

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

      {/* Warning Alert - Approaching Limit */}
      <AnimatePresence>
        {!error && isApproachingLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                <strong>Cerca del límite:</strong> Has utilizado {totalDays} de {maxDays} días.
                Te quedan {maxDays - totalDays} {maxDays - totalDays === 1 ? "día" : "días"}.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Alert - At or Over Limit */}
      <AnimatePresence>
        {!error && isAtLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Límite alcanzado:</strong> Has utilizado {totalDays} días.
                No puedes añadir más períodos sin eliminar algunos existentes.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Alert */}
      <AnimatePresence>
        {!error && vacationCount > 0 && !isApproachingLimit && !isAtLimit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Vacaciones configuradas:</strong> {vacationCount}{" "}
                {vacationCount === 1 ? "período" : "períodos"} ({totalDays}{" "}
                {totalDays === 1 ? "día" : "días"})
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
            Los períodos de vacaciones tienen prioridad sobre el ciclo de trabajo.
            Los días de vacaciones no contarán como días trabajados en tu balance anual.
            {vacationCount === 0 && " Puedes añadir hasta 30 días de vacaciones al año."}
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
