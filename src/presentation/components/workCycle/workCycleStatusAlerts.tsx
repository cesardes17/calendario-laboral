/**
 * WorkCycleStatusAlerts Component
 *
 * Displays validation status:
 * - Error alerts (red) when configuration is invalid
 * - Success alert (green) when configuration is valid
 *
 * Features:
 * - Animated entrance/exit
 * - Shows cycle description when valid
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { WorkCycle } from "@/src/core/domain/workCycle";
import { Alert, AlertDescription } from "../ui";

interface WorkCycleStatusAlertsProps {
  isValid: boolean;
  errors: string[];
  cycle: WorkCycle | null;
  hasSelectedMode: boolean;
}

export function WorkCycleStatusAlerts({
  isValid,
  errors,
  cycle,
  hasSelectedMode,
}: WorkCycleStatusAlertsProps) {
  return (
    <>
      {/* Error alerts */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success alert */}
      <AnimatePresence>
        {isValid && cycle && hasSelectedMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm">
                <strong className="text-green-900 dark:text-green-100">
                  {cycle.getDisplayText()}
                </strong>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {cycle.getDescription()}
                </p>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
