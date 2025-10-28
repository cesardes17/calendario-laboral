/**
 * WizardStepHeader Component
 *
 * Displays the animated header for each wizard step:
 * - Step title (e.g., "Ciclo de Trabajo")
 * - Optional step description (e.g., "Define tu patrón de trabajo semanal")
 *
 * Slides in/out with direction-based animation when step changes
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slideVariants, springTransition } from "./wizardAnimations";
import type { WizardStep } from "./wizzardStepper";

interface WizardStepHeaderProps {
  step: WizardStep;
  direction: number;
  currentStep: number;
}

export function WizardStepHeader({
  step,
  direction,
  currentStep,
}: WizardStepHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`header-${currentStep}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className="px-6 pt-6 pb-4"
        >
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            {step.title}
          </h3>
          {step.description && (
            <p className="text-base text-muted-foreground mt-1.5">
              {step.description}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
