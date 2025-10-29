/**
 * AnnualHoursStatusAlerts Component
 *
 * Displays success and warning alerts for annual hours configuration
 * Features:
 * - Success alert with configuration summary
 * - Warning alerts for unusual values (low/high)
 * - Smooth animations
 * - Icon feedback
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { WarningType } from "@/src/core/domain/annualContractHours";

interface AnnualHoursStatusAlertsProps {
  isValid: boolean;
  annualHours: number | null;
  weeklyHours: string;
  warning: { type: string; message?: string } | null;
}

export function AnnualHoursStatusAlerts({
  isValid,
  annualHours,
  weeklyHours,
  warning,
}: AnnualHoursStatusAlertsProps) {
  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <AnimatePresence>
        {isValid && annualHours && warning?.type === WarningType.NONE && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Configuración válida:</strong> {annualHours} horas/año
                (≈ {weeklyHours} h/semana)
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Alerts */}
      <AnimatePresence>
        {isValid &&
          warning &&
          warning.type !== WarningType.NONE &&
          warning.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                className={`
                ${
                  warning.type === WarningType.UNUSUALLY_LOW
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-orange-500/50 bg-orange-500/10"
                }
              `}
              >
                <AlertTriangle
                  className={`h-4 w-4 ${
                    warning.type === WarningType.UNUSUALLY_LOW
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
                <AlertDescription
                  className={`${
                    warning.type === WarningType.UNUSUALLY_LOW
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-orange-700 dark:text-orange-300"
                  }`}
                >
                  <strong>Valor inusual:</strong> {warning.message}
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
            Las horas de convenio se usan para calcular tu balance anual de
            horas. Consulta tu contrato o convenio colectivo para el valor
            exacto.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
