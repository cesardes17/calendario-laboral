/**
 * ContractStartStatusAlerts Component
 *
 * Displays success and error alerts for contract start configuration
 * Features:
 * - Success alert with configuration summary
 * - Error alerts with validation messages
 * - Smooth animations
 * - Icon feedback
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { EmploymentStatusType } from "@/src/core/domain/employmentStatus";

interface ContractStartStatusAlertsProps {
  isValid: boolean;
  errors: string[];
  selectedStatus: EmploymentStatusType | null;
  contractDate?: Date | null;
  cycleOffsetSummary?: string;
}

export function ContractStartStatusAlerts({
  isValid,
  errors,
  selectedStatus,
  contractDate,
  cycleOffsetSummary,
}: ContractStartStatusAlertsProps) {
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get success message based on status
  const getSuccessMessage = (): string => {
    if (!selectedStatus) return "";

    if (selectedStatus === EmploymentStatusType.STARTED_THIS_YEAR) {
      return contractDate
        ? `Contrato iniciado el ${formatDate(contractDate)}`
        : "";
    }

    return cycleOffsetSummary || "Offset de ciclo configurado correctamente";
  };

  return (
    <div className="space-y-4">
      {/* Success Alert */}
      <AnimatePresence>
        {isValid && selectedStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>Configuración válida:</strong> {getSuccessMessage()}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alerts */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {errors.map((error, index) => (
              <Alert
                key={index}
                className="border-red-500/50 bg-red-500/10"
                variant="destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
