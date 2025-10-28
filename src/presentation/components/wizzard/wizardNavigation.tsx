/**
 * WizardNavigation Component
 *
 * Provides navigation buttons for wizard steps:
 * - "Anterior" button: Disabled on first step
 * - "Siguiente/Finalizar" button: Disabled if step is invalid, changes text on last step
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface WizardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isValid?: boolean;
}

export function WizardNavigation({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  isValid,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-6 mt-6 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="gap-2 bg-transparent"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>

      <Button
        onClick={onNext}
        disabled={isValid === false}
        className="gap-2"
      >
        {isLastStep ? "Finalizar" : "Siguiente"}
        {!isLastStep && <ChevronRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}
