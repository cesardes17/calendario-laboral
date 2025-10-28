/**
 * WizardStepper Component
 *
 * Main wizard component that orchestrates multi-step forms.
 * Composed of smaller, focused sub-components for better maintainability.
 *
 * Features:
 * - Progress indicator with percentage
 * - Visual step indicators (circles with check marks)
 * - Animated transitions between steps
 * - Navigation buttons with validation
 * - Responsive design
 */

"use client";

import { type ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Card, CardContent } from "../ui/card";
import { useWizardNavigation } from "./useWizardNavigation";
import { WizardProgressBar } from "./wizardProgressBar";
import { WizardStepIndicators } from "./wizardStepIndicators";
import { WizardStepHeader } from "./wizardStepHeader";
import { WizardStepContent } from "./wizardStepContent";
import { WizardNavigation } from "./wizardNavigation";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isValid?: boolean;
}

export interface WizardData {
  [key: string]: unknown;
}

interface WizardStepperProps {
  steps: WizardStep[];
  onComplete?: (data: WizardData) => void;
  className?: string;
}

export function WizardStepper({
  steps,
  onComplete,
  className,
}: WizardStepperProps) {
  const navigation = useWizardNavigation(steps, onComplete);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Progress Bar */}
      <WizardProgressBar
        currentStep={navigation.currentStep}
        totalSteps={steps.length}
      />

      {/* Step Indicators */}
      <WizardStepIndicators
        steps={steps}
        currentStep={navigation.currentStep}
      />

      {/* Main Content Card */}
      <Card className="min-h-[500px] flex flex-col">
        {/* Step Header */}
        <WizardStepHeader
          step={navigation.currentStepData}
          direction={navigation.direction}
          currentStep={navigation.currentStep}
        />

        {/* Step Content and Navigation */}
        <CardContent className="flex-1 flex flex-col">
          <WizardStepContent
            step={navigation.currentStepData}
            direction={navigation.direction}
            currentStep={navigation.currentStep}
          />

          <WizardNavigation
            onNext={navigation.handleNext}
            onPrevious={navigation.handlePrevious}
            isFirstStep={navigation.isFirstStep}
            isLastStep={navigation.isLastStep}
            isValid={navigation.currentStepData.isValid}
          />
        </CardContent>
      </Card>
    </div>
  );
}
