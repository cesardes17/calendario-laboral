"use client";

import { type ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

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

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">
            Paso {currentStep + 1} de {steps.length}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% completado
          </div>
        </div>
        {/* Progress Bar */}
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-secondary text-muted-foreground"
                )}
                initial={false}
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              <div className="text-xs text-center text-muted-foreground max-w-[100px] hidden md:block">
                {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="min-h-[500px] flex flex-col">
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`header-${currentStep}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="px-6 pt-6 pb-4"
            >
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {currentStepData.title}
              </h3>
              {currentStepData.description && (
                <p className="text-base text-muted-foreground mt-1.5">
                  {currentStepData.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={`content-${currentStep}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0"
              >
                <div className="h-full overflow-y-auto pr-2">
                  {currentStepData.component}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentStepData.isValid === false}
              className="gap-2"
            >
              {isLastStep ? "Finalizar" : "Siguiente"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
