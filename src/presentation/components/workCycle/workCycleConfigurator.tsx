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
 *
 * Refactored to use sub-components for better maintainability.
 * Fixed spacing issues (space-y-8 for better breathing room).
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CycleMode, CyclePart, WeeklyMask, WorkCycle } from "@/src/core/domain";
import { useWorkCycle } from "@/src/application/hooks";
import { CYCLE_TEMPLATES, TemplateKey } from "./workCycleConstants";
import { WorkCycleModeSelector } from "./workCycleModeSelector";
import { WorkCycleWeeklyConfig } from "./workCycleWeeklyConfig";
import { WorkCycleTemplateSelector } from "./workCycleTemplateSelector";
import { WorkCyclePartsList } from "./workCyclePartsList";
import { WorkCycleStatusAlerts } from "./workCycleStatusAlerts";

export interface WorkCycleConfiguratorProps {
  /**
   * Initial mode to load (optional)
   */
  initialMode?: CycleMode;

  /**
   * Initial weekly mask for WEEKLY mode (optional)
   */
  initialWeeklyMask?: WeeklyMask;

  /**
   * Initial parts for PARTS mode (optional)
   */
  initialParts?: CyclePart[];

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
  initialMode,
  initialWeeklyMask,
  initialParts,
  onConfigurationChange,
  onCycleConfigured,
  className = "",
}) => {
  const { state, configureWeekly, configureParts } = useWorkCycle();

  // Local state for mode selection
  const [selectedMode, setSelectedMode] = useState<CycleMode | null>(initialMode ?? null);

  // Local state for weekly mode
  const [weeklyMask, setWeeklyMask] = useState<WeeklyMask>(
    initialWeeklyMask ?? [true, true, true, true, true, false, false]
  );

  // Local state for parts mode
  const [parts, setParts] = useState<CyclePart[]>(
    initialParts ?? [{ workDays: 4, restDays: 2 }]
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom");

  // Load initial configuration on mount
  useEffect(() => {
    if (initialMode === CycleMode.WEEKLY && initialWeeklyMask) {
      configureWeekly(initialWeeklyMask);
    } else if (initialMode === CycleMode.PARTS && initialParts) {
      configureParts(initialParts);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle mode change
  const handleModeChange = (mode: CycleMode) => {
    setSelectedMode(mode);
  };

  // Handle template selection
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);

    if (templateKey !== "custom") {
      const template = CYCLE_TEMPLATES[templateKey as TemplateKey];
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
    <div className={`space-y-8 ${className}`}>
      {/* Mode Selection */}
      <WorkCycleModeSelector
        selectedMode={selectedMode}
        onModeChange={handleModeChange}
      />

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
            <WorkCycleWeeklyConfig
              weeklyMask={weeklyMask}
              onDayToggle={handleWeeklyDayToggle}
            />
          </motion.div>
        )}

        {selectedMode === CycleMode.PARTS && (
          <motion.div
            key="parts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Template Selector */}
            <WorkCycleTemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
            />

            {/* Parts Configuration */}
            <WorkCyclePartsList
              parts={parts}
              onPartChange={handlePartChange}
              onAddPart={handleAddPart}
              onRemovePart={handleRemovePart}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Alerts (Errors and Success) */}
      <WorkCycleStatusAlerts
        isValid={state.isValid}
        errors={state.errors}
        cycle={state.cycle}
        hasSelectedMode={selectedMode !== null}
      />
    </div>
  );
};
