/**
 * ContractStartConfigurator Component
 *
 * Main component for configuring contract start information (HU-002)
 * Implements:
 * - Employment status selection (started this year / worked before)
 * - Contract start date picker (if started this year)
 * - Cycle offset configuration (if worked before with parts mode)
 * - Automatic validation based on work cycle mode
 * - Clear visual feedback
 *
 * Follows the same pattern as WorkCycleConfigurator with sub-components
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useEmploymentStatus } from "@/src/application/hooks/useEmploymentStatus";
import { useYearSelection } from "@/src/application/hooks/useYearSelection";
import { EmploymentStatusType } from "@/src/core/domain/employmentStatus";
import { CycleDayType } from "@/src/core/domain/cycleOffset";
import { WorkCycle } from "@/src/core/domain/workCycle";
import { Year } from "@/src/core/domain/year";
import { EmploymentStatusSelector } from "./employmentStatusSelector";
import { ContractDatePicker } from "./contractDatePicker";
import { CycleOffsetConfig } from "./cycleOffsetConfig";
import { ContractStartStatusAlerts } from "./contractStartStatusAlerts";

export interface ContractStartConfig {
  statusType: EmploymentStatusType;
  contractStartDate?: Date;
  cycleOffset?: {
    partNumber: number;
    dayWithinPart: number;
    dayType: CycleDayType;
  };
}

export interface ContractStartConfiguratorProps {
  /**
   * Initial year (optional, will use current year if not provided)
   */
  initialYear?: number;

  /**
   * Initial contract start configuration to load (optional)
   */
  initialConfig?: ContractStartConfig;

  /**
   * Work cycle configuration (needed to determine if offset is required)
   */
  workCycle?: WorkCycle | null;

  /**
   * Callback when configuration validity changes
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when valid contract start configuration changes
   */
  onContractStartChange?: (config: ContractStartConfig) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ContractStartConfigurator: React.FC<
  ContractStartConfiguratorProps
> = ({ initialYear, initialConfig, workCycle, onConfigurationChange, onContractStartChange, className = "" }) => {
  const { selectedYear } = useYearSelection(initialYear);
  const {
    state,
    selectStatus,
    setContractStartDate,
    setCycleOffset,
    validateConfiguration,
  } = useEmploymentStatus();

  // Local state for form inputs
  const [contractDate, setContractDate] = useState<Date | null>(initialConfig?.contractStartDate ?? null);
  const [offsetPartNumber, setOffsetPartNumber] = useState<number>(initialConfig?.cycleOffset?.partNumber ?? 1);
  const [offsetDayWithinPart, setOffsetDayWithinPart] = useState<number>(initialConfig?.cycleOffset?.dayWithinPart ?? 1);
  const [offsetDayType, setOffsetDayType] = useState<CycleDayType>(
    initialConfig?.cycleOffset?.dayType ?? CycleDayType.WORK
  );

  // Load initial configuration on mount
  useEffect(() => {
    if (initialConfig) {
      // Select status
      selectStatus(initialConfig.statusType);

      // Set contract start date if present
      if (initialConfig.contractStartDate && selectedYear) {
        const yearObj = Year.create(selectedYear);
        if (yearObj.isSuccess()) {
          // Convert string to Date (comes from localStorage as string)
          const dateObj = new Date(initialConfig.contractStartDate);
          setContractStartDate(dateObj, yearObj.getValue());
        }
      }

      // Set cycle offset if present
      if (initialConfig.cycleOffset) {
        setCycleOffset(
          initialConfig.cycleOffset.partNumber,
          initialConfig.cycleOffset.dayWithinPart,
          initialConfig.cycleOffset.dayType
        );
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine if cycle is weekly (offset not required for "worked before")
  const isWeeklyCycle = workCycle?.isWeekly() ?? false;

  // Initialize cycle offset with default values when showing the config for the first time
  useEffect(() => {
    // Only initialize if:
    // 1. Status is WORKED_BEFORE
    // 2. Cycle is PARTS mode (not weekly)
    // 3. No initial config was provided (first time showing)
    if (
      state.status?.type === EmploymentStatusType.WORKED_BEFORE &&
      !isWeeklyCycle &&
      !initialConfig?.cycleOffset &&
      workCycle?.isParts()
    ) {
      // Initialize with default values (Parte 1, Día 1 de trabajo)
      setCycleOffset(offsetPartNumber, offsetDayWithinPart, offsetDayType);
    }
  }, [state.status?.type, isWeeklyCycle, workCycle, initialConfig, offsetPartNumber, offsetDayWithinPart, offsetDayType, setCycleOffset]);

  // Handle employment status change
  const handleStatusChange = useCallback(
    (statusType: EmploymentStatusType) => {
      selectStatus(statusType);
      // Reset dependent states
      setContractDate(null);
      setOffsetPartNumber(1);
      setOffsetDayWithinPart(1);
      setOffsetDayType(CycleDayType.WORK);
    },
    [selectStatus]
  );

  // Handle contract date change
  const handleContractDateChange = useCallback(
    (date: Date) => {
      setContractDate(date);
      const yearObj = Year.create(selectedYear);
      if (yearObj.isSuccess()) {
        setContractStartDate(date, yearObj.getValue());
      }
    },
    [selectedYear, setContractStartDate]
  );

  // Handle cycle offset changes
  const handleOffsetPartNumberChange = useCallback(
    (value: number) => {
      if (value < 1) return;
      setOffsetPartNumber(value);
      setCycleOffset(value, offsetDayWithinPart, offsetDayType);
    },
    [offsetDayWithinPart, offsetDayType, setCycleOffset]
  );

  const handleOffsetDayWithinPartChange = useCallback(
    (value: number) => {
      if (value < 1) return;
      setOffsetDayWithinPart(value);
      setCycleOffset(offsetPartNumber, value, offsetDayType);
    },
    [offsetPartNumber, offsetDayType, setCycleOffset]
  );

  const handleOffsetDayTypeChange = useCallback(
    (type: CycleDayType) => {
      setOffsetDayType(type);
      setCycleOffset(offsetPartNumber, offsetDayWithinPart, type);
    },
    [offsetPartNumber, offsetDayWithinPart, setCycleOffset]
  );

  // Validate configuration whenever state changes
  useEffect(() => {
    if (!state.status) {
      onConfigurationChange?.(false);
      return;
    }

    const yearObj = Year.create(selectedYear);
    if (yearObj.isFailure()) {
      onConfigurationChange?.(false);
      return;
    }

    const validation = validateConfiguration(yearObj.getValue(), isWeeklyCycle);
    onConfigurationChange?.(validation.isValid);
  }, [
    state.status,
    state.contractStartDate,
    state.cycleOffset,
    selectedYear,
    isWeeklyCycle,
    validateConfiguration,
    onConfigurationChange,
  ]);

  // Notify parent when valid configuration changes
  useEffect(() => {
    if (!state.isValid || !state.status || !onContractStartChange) {
      return;
    }

    const config: ContractStartConfig = {
      statusType: state.status.type,
      contractStartDate: state.contractStartDate?.value,
      cycleOffset: state.cycleOffset ? {
        partNumber: offsetPartNumber,
        dayWithinPart: offsetDayWithinPart,
        dayType: offsetDayType,
      } : undefined,
    };

    onContractStartChange(config);
  }, [
    state.isValid,
    state.status,
    state.contractStartDate,
    state.cycleOffset,
    offsetPartNumber,
    offsetDayWithinPart,
    offsetDayType,
    onContractStartChange,
  ]);

  // Get cycle offset display summary
  const getCycleOffsetSummary = (): string | undefined => {
    if (!state.cycleOffset) return undefined;
    return state.cycleOffset.getDisplayText();
  };

  // Determine what sections to show
  const showContractDatePicker =
    state.status?.type === EmploymentStatusType.STARTED_THIS_YEAR;
  const showCycleOffsetConfig =
    state.status?.type === EmploymentStatusType.WORKED_BEFORE &&
    !isWeeklyCycle;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Inicio de Contrato
        </CardTitle>
        <CardDescription>
          Indica cuándo comenzaste a trabajar en este puesto
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 pb-6">
        {/* Section 1: Employment Status Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <EmploymentStatusSelector
            selectedStatus={state.status?.type ?? null}
            onStatusChange={handleStatusChange}
          />
        </motion.div>

        {/* Section 2: Contract Date Picker (conditional) */}
        {showContractDatePicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ContractDatePicker
              selectedDate={contractDate}
              onDateChange={handleContractDateChange}
              yearValue={selectedYear}
            />
          </motion.div>
        )}

        {/* Section 3: Cycle Offset Config (conditional) */}
        {showCycleOffsetConfig && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <CycleOffsetConfig
              partNumber={offsetPartNumber}
              dayWithinPart={offsetDayWithinPart}
              dayType={offsetDayType}
              onPartNumberChange={handleOffsetPartNumberChange}
              onDayWithinPartChange={handleOffsetDayWithinPartChange}
              onDayTypeChange={handleOffsetDayTypeChange}
              workCycle={workCycle}
            />
          </motion.div>
        )}

        {/* Section 4: Weekly Cycle Info (if worked before + weekly) */}
        {state.status?.type === EmploymentStatusType.WORKED_BEFORE &&
          isWeeklyCycle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg"
            >
              <p>
                <strong>Modo semanal detectado:</strong> El offset se calculará
                automáticamente según el día de la semana. No necesitas
                configurar nada más.
              </p>
            </motion.div>
          )}

        {/* Section 5: Status Alerts */}
        <ContractStartStatusAlerts
          isValid={state.isValid}
          errors={state.errors}
          selectedStatus={state.status?.type ?? null}
          contractDate={contractDate}
          cycleOffsetSummary={getCycleOffsetSummary()}
        />
      </CardContent>
    </Card>
  );
};
