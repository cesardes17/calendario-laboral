/**
 * useWizardNavigation Hook
 *
 * Manages wizard navigation state and logic
 * Handles step transitions, validation, and completion
 */

import { useState } from "react";
import type { WizardStep, WizardData } from "./wizzardStepper";

interface UseWizardNavigationReturn {
  currentStep: number;
  direction: number;
  currentStepData: WizardStep;
  isLastStep: boolean;
  isFirstStep: boolean;
  handleNext: () => void;
  handlePrevious: () => void;
}

export function useWizardNavigation(
  steps: WizardStep[],
  onComplete?: (data: WizardData) => void
): UseWizardNavigationReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else if (onComplete) {
      onComplete({});
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    direction,
    currentStepData: steps[currentStep],
    isLastStep: currentStep === steps.length - 1,
    isFirstStep: currentStep === 0,
    handleNext,
    handlePrevious,
  };
}
