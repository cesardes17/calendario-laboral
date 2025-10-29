/**
 * ConfigurationReviewConfigurator Component
 *
 * Final review step before completing the wizard
 * Shows a compact summary of all configurations and requires user confirmation
 *
 * Features:
 * - Compact summary of all wizard steps
 * - Visual checkmarks for completed configurations
 * - Confirmation checkbox
 * - Only valid when user confirms
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

export interface ConfigurationReviewConfiguratorProps {
  /**
   * Validation states from all previous steps
   */
  stepsValidation: {
    workCycle: boolean;
    year: boolean;
    contractStart: boolean;
    workingHours: boolean;
    annualHours: boolean;
    holidays: boolean;
    vacations: boolean;
  };

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ConfigurationReviewConfigurator: React.FC<
  ConfigurationReviewConfiguratorProps
> = ({ stepsValidation, onConfigurationChange, className = "" }) => {
  const [confirmed, setConfirmed] = useState(false);

  // Configuration steps to review
  const steps = [
    {
      id: "workCycle",
      label: "Ciclo de Trabajo",
      description: "Patrón de trabajo semanal o por partes",
      isValid: stepsValidation.workCycle,
    },
    {
      id: "year",
      label: "Año de Referencia",
      description: "Año del calendario laboral",
      isValid: stepsValidation.year,
    },
    {
      id: "contractStart",
      label: "Inicio de Contrato",
      description: "Fecha de inicio o continuación del ciclo",
      isValid: stepsValidation.contractStart,
    },
    {
      id: "workingHours",
      label: "Horas de Trabajo",
      description: "Jornada laboral diaria por tipo de día",
      isValid: stepsValidation.workingHours,
    },
    {
      id: "annualHours",
      label: "Horas de Convenio",
      description: "Horas anuales según convenio laboral",
      isValid: stepsValidation.annualHours,
    },
    {
      id: "holidays",
      label: "Festivos del Año",
      description: "Días festivos oficiales",
      isValid: stepsValidation.holidays,
    },
    {
      id: "vacations",
      label: "Vacaciones",
      description: "Períodos de vacaciones planificados",
      isValid: stepsValidation.vacations,
    },
  ];

  // Check if all steps are valid
  const allStepsValid = steps.every((step) => step.isValid);

  // This step is only valid when user confirms AND all previous steps are valid
  const isValid = confirmed && allStepsValid;

  // Notify parent of validation state
  useEffect(() => {
    onConfigurationChange?.(isValid);
  }, [isValid, onConfigurationChange]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Revisión Final
        </CardTitle>
        <CardDescription>
          Revisa tu configuración antes de completar el asistente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Steps Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-dashed">
            <CardContent className="pt-6 pb-5">
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Configuraciones Completadas
              </h4>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          step.isValid
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warning if not all valid */}
        {!allStepsValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertDescription className="text-orange-700 dark:text-orange-300 text-sm">
                <strong>Atención:</strong> Algunos pasos anteriores no están
                completados correctamente. Usa los botones de navegación para
                revisarlos.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Confirmation Checkbox */}
        {allStepsValid && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6 pb-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-input bg-background focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      He revisado la configuración y es correcta
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Al confirmar, podrás generar tu calendario laboral con
                      estas configuraciones
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Success message when confirmed */}
        {isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                <strong>¡Listo para completar!</strong> Haz clic en &quot;Finalizar&quot;
                para generar tu calendario laboral.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
