/**
 * WizardStepContent Component
 *
 * Renders the main content area for each wizard step:
 * - Contains the step's component (WorkCycleConfigurator, YearSelector, etc.)
 * - Provides scrollable area for overflow content
 * - Animates in/out when step changes
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { slideVariants, springTransition } from "./wizardAnimations";
import type { WizardStep } from "./wizzardStepper";

interface WizardStepContentProps {
  step: WizardStep;
  direction: number;
  currentStep: number;
}

export function WizardStepContent({
  step,
  direction,
  currentStep,
}: WizardStepContentProps) {
  return (
    <div className="relative">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`content-${currentStep}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springTransition}
          className="px-3"
        >
          <div>{step.component}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
