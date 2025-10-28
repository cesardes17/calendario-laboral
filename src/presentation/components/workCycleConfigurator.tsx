/**
 * WorkCycleConfigurator Component
 *
 * UI component for work cycle configuration (HU-003, HU-004, HU-005, HU-006)
 * Implements:
 * - Mode selection: Weekly or Parts-based
 * - Weekly mode: 7-day checkbox grid (Mon-Sun) [HU-004]
 * - Parts mode: Dynamic part configuration with work/rest days [HU-005]
 * - Predefined templates for common cycles (4-2, 6-3, 6-2, 6-3-6-3-6-3-6-2) [HU-006]
 * - Automatic switch to "Custom" when template is modified
 * - Validation and error display
 * - Visual feedback
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useWorkCycle } from "@/src/application/hooks/useWorkCycle";
import {
  CycleMode,
  type WeeklyMask,
  type CyclePart,
  type WorkCycle,
} from "@/src/core/domain/workCycle";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui";

export interface WorkCycleConfiguratorProps {
  /**
   * Callback when configuration is complete and valid
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when cycle is configured (returns the cycle object)
   */
  onCycleConfigured?: (cycle: WorkCycle) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const WorkCycleConfigurator: React.FC<WorkCycleConfiguratorProps> = ({
  onConfigurationChange,
  onCycleConfigured,
  className = "",
}) => {
  const { state, configureWeekly, configureParts } = useWorkCycle();

  // Local state for mode selection
  const [selectedMode, setSelectedMode] = useState<CycleMode | null>(null);

  // Local state for weekly mode
  const [weeklyMask, setWeeklyMask] = useState<WeeklyMask>([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
  ]);

  // Local state for parts mode
  const [parts, setParts] = useState<CyclePart[]>([
    { workDays: 4, restDays: 2 },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");

  const dayNames = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const dayNamesShort = ["L", "M", "X", "J", "V", "S", "D"];

  // Predefined templates for common work cycles
  const templates = {
    custom: { name: "Personalizado", parts: [] as CyclePart[] },
    "4-2": {
      name: "4-2 (Trabaja 4, descansa 2)",
      parts: [{ workDays: 4, restDays: 2 }],
    },
    "6-3": {
      name: "6-3 (Trabaja 6, descansa 3)",
      parts: [{ workDays: 6, restDays: 3 }],
    },
    "6-2": {
      name: "6-2 (Trabaja 6, descansa 2)",
      parts: [{ workDays: 6, restDays: 2 }],
    },
    "6-3-6-3-6-3-6-2": {
      name: "6-3-6-3-6-3-6-2 (Ciclo de 4 partes)",
      parts: [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ],
    },
  };

  // Handle mode change
  const handleModeChange = (mode: CycleMode) => {
    setSelectedMode(mode);
  };

  // Handle template selection
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);

    if (templateKey !== "custom") {
      const template = templates[templateKey as keyof typeof templates];
      if (template && template.parts.length > 0) {
        const newParts = [...template.parts];
        setParts(newParts);
        configureParts(newParts);
      }
    }
  };

  // Handle weekly checkbox toggle
  const handleWeeklyDayToggle = (dayIndex: number) => {
    const newMask = [...weeklyMask] as WeeklyMask;
    newMask[dayIndex] = !newMask[dayIndex];
    setWeeklyMask(newMask);

    // Auto-configure when user toggles
    configureWeekly(newMask);
  };

  // Handle part input change
  const handlePartChange = (
    index: number,
    field: "workDays" | "restDays",
    value: string
  ) => {
    const newParts = [...parts];

    // Mark as custom when user modifies a template
    if (selectedTemplate !== "custom") {
      setSelectedTemplate("custom");
    }

    // Allow empty string for easier editing
    if (value === "") {
      newParts[index] = {
        ...newParts[index],
        [field]: 0,
      };
      setParts(newParts);
      return;
    }

    const numValue = Number.parseInt(value, 10);

    if (!isNaN(numValue) && numValue >= 0) {
      newParts[index] = {
        ...newParts[index],
        [field]: numValue,
      };
      setParts(newParts);

      // Auto-configure when user changes values (only if valid)
      if (numValue > 0) {
        configureParts(newParts);
      }
    }
  };

  // Add new part
  const handleAddPart = () => {
    // Mark as custom when user adds a part
    if (selectedTemplate !== "custom") {
      setSelectedTemplate("custom");
    }
    const newParts = [...parts, { workDays: 6, restDays: 3 }];
    setParts(newParts);
    configureParts(newParts);
  };

  // Remove part
  const handleRemovePart = (index: number) => {
    if (parts.length > 1) {
      // Mark as custom when user removes a part
      if (selectedTemplate !== "custom") {
        setSelectedTemplate("custom");
      }
      const newParts = parts.filter((_, i) => i !== index);
      setParts(newParts);
      configureParts(newParts);
    }
  };

  // Initialize configuration when mode changes
  useEffect(() => {
    if (selectedMode === CycleMode.WEEKLY) {
      configureWeekly(weeklyMask);
    } else if (selectedMode === CycleMode.PARTS) {
      configureParts(parts);
    }
  }, [selectedMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of validation state changes
  const prevValidRef = React.useRef<boolean | null>(null);
  const prevCycleRef = React.useRef<WorkCycle | null>(null);

  useEffect(() => {
    // Only notify if the values actually changed
    if (prevValidRef.current !== state.isValid) {
      onConfigurationChange?.(state.isValid);
      prevValidRef.current = state.isValid;
    }

    if (state.isValid && state.cycle && prevCycleRef.current !== state.cycle) {
      onCycleConfigured?.(state.cycle);
      prevCycleRef.current = state.cycle;
    }
  }, [state.isValid, state.cycle, onConfigurationChange, onCycleConfigured]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mode Selection */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          ¿Cómo es tu patrón de trabajo?
        </h3>

        <div className="flex flex-col gap-4">
          {/* Weekly Mode Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedMode === CycleMode.WEEKLY
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleModeChange(CycleMode.WEEKLY)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6" />
                  <CardTitle className="text-lg">Semanal (7 días)</CardTitle>
                </div>
                <CardDescription className="text-sm mt-2">
                  Repites el mismo patrón cada semana. Por ejemplo: L-V
                  trabajas, S-D descansas.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Parts Mode Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedMode === CycleMode.PARTS
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleModeChange(CycleMode.PARTS)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6" />
                  <CardTitle className="text-lg">
                    Por partes (bloques)
                  </CardTitle>
                </div>
                <CardDescription className="text-sm mt-2">
                  Defines bloques de trabajo/descanso que se repiten. Por
                  ejemplo: 4 días trabajo, 2 días descanso (4-2).
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Configuration Content */}
      <AnimatePresence mode="wait">
        {selectedMode === CycleMode.WEEKLY && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Selecciona los días que trabajas
                </CardTitle>
                <CardDescription className="text-xs">
                  Marca los días de la semana en los que trabajas habitualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {dayNamesShort.map((dayShort, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {dayShort}
                      </span>
                      <Button
                        type="button"
                        variant={weeklyMask[index] ? "default" : "outline"}
                        size="icon"
                        className="h-12 w-12 rounded-lg"
                        onClick={() => handleWeeklyDayToggle(index)}
                        title={dayNames[index]}
                      >
                        {weeklyMask[index] && (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">
                    {weeklyMask.filter((d) => d).length} de 7 días seleccionados
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedMode === CycleMode.PARTS && (
          <motion.div
            key="parts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Template Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Plantillas predefinidas
                </CardTitle>
                <CardDescription className="text-xs">
                  Selecciona un ciclo común o configura uno personalizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(templates).map(([key, template]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant={
                          selectedTemplate === key ? "default" : "outline"
                        }
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => handleTemplateChange(key)}
                      >
                        <span className="text-xs">{template.name}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Parts Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Configuración de bloques
                </CardTitle>
                <CardDescription className="text-xs">
                  Define tus bloques de trabajo/descanso (se repetirán
                  indefinidamente)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {parts.map((part, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="bg-muted/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="shrink-0">
                              Parte {index + 1}
                            </Badge>

                            <div className="flex flex-1 items-center gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={part.workDays || ""}
                                onChange={(e) =>
                                  handlePartChange(
                                    index,
                                    "workDays",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="6"
                              />
                              <span className="text-xs text-muted-foreground">
                                días trabajo
                              </span>
                            </div>

                            <div className="flex flex-1 items-center gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={part.restDays || ""}
                                onChange={(e) =>
                                  handlePartChange(
                                    index,
                                    "restDays",
                                    e.target.value
                                  )
                                }
                                className="w-16 rounded-md border border-input bg-background px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="3"
                              />
                              <span className="text-xs text-muted-foreground">
                                días descanso
                              </span>
                            </div>

                            {parts.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleRemovePart(index)}
                                title="Eliminar parte"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleAddPart}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir otra parte
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Ejemplo:</strong> Si defines 6-3, 6-2, trabajarás 6
                    días, descansarás 3, trabajarás 6, descansarás 2, y así
                    sucesivamente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      <AnimatePresence>
        {state.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {state.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success indicator */}
      <AnimatePresence>
        {state.isValid && state.cycle && selectedMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm">
                <strong className="text-green-900 dark:text-green-100">
                  {state.cycle.getDisplayText()}
                </strong>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {state.cycle.getDescription()}
                </p>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
