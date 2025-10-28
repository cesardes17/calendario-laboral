/**
 * WizardStepIndicators Component
 *
 * Displays circular step indicators showing:
 * - Completed steps: Check icon with primary background
 * - Current step: Number with pulsing ring effect
 * - Pending steps: Number with secondary background
 *
 * Each indicator shows the step title below (hidden on mobile)
 */

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { WizardStep } from "./wizzardStepper";

interface WizardStepIndicatorsProps {
  steps: WizardStep[];
  currentStep: number;
}

export function WizardStepIndicators({
  steps,
  currentStep,
}: WizardStepIndicatorsProps) {
  return (
    <div className="flex justify-between mt-4">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div
            key={step.id}
            className="flex flex-col items-center gap-2 flex-1"
          >
            {/* Circle Indicator */}
            <motion.div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                isCompleted && "bg-primary text-primary-foreground",
                isCurrent &&
                  "bg-primary text-primary-foreground ring-4 ring-primary/20",
                isPending && "bg-secondary text-muted-foreground"
              )}
              initial={false}
              animate={{
                scale: isCurrent ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>

            {/* Step Title (hidden on mobile) */}
            <div className="text-xs text-center text-muted-foreground max-w-[100px] hidden md:block">
              {step.title}
            </div>
          </div>
        );
      })}
    </div>
  );
}
