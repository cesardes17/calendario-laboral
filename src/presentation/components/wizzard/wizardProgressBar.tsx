/**
 * WizardProgressBar Component
 *
 * Displays wizard completion progress with:
 * - Current step count (e.g., "Paso 2 de 5")
 * - Percentage completion (e.g., "40% completado")
 * - Animated progress bar
 */

"use client";

import { motion } from "framer-motion";
import { progressBarTransition } from "./wizardAnimations";

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgressBar({
  currentStep,
  totalSteps,
}: WizardProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Step Counter and Percentage */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium text-muted-foreground">
          Paso {currentStep + 1} de {totalSteps}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {Math.round(progressPercentage)}% completado
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={progressBarTransition}
        />
      </div>
    </div>
  );
}
