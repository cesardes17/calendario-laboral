import { useMemo } from 'react';
import { Year } from '@/src/core/domain/year';
import { WorkCycle } from '@/src/core/domain/workCycle';
import { EmploymentStatus } from '@/src/core/domain/employmentStatus';
import { ContractStartDate } from '@/src/core/domain/contractStartDate';
import { CycleOffset } from '@/src/core/domain/cycleOffset';
import { WorkingHours } from '@/src/core/domain/workingHours';
import { AnnualContractHours } from '@/src/core/domain/annualContractHours';
import { Holiday } from '@/src/core/domain/holiday';
import { VacationPeriod } from '@/src/core/domain/vacationPeriod';
import {
  validateCompleteConfiguration,
  getMissingFields,
  getWarningFields,
  type ConfigurationValidation,
  type FieldValidation,
} from '@/src/core/usecases/validateConfiguration.usecase';

/**
 * Hook input parameters
 */
export interface UseConfigurationValidationParams {
  year: Year | null;
  workCycle: WorkCycle | null;
  employmentStatus: EmploymentStatus | null;
  contractStartDate: ContractStartDate | null;
  cycleOffset: CycleOffset | null;
  workingHours: WorkingHours | null;
  annualContractHours: AnnualContractHours | null;
  holidays: Holiday[];
  vacations: VacationPeriod[];
}

/**
 * Custom hook for validating complete configuration
 *
 * Validates all required and optional fields for generating a calendar.
 * Returns validation status, missing fields, warnings, and helper methods.
 *
 * @param params - Configuration parameters to validate
 * @returns Validation state and helpers
 *
 * @example
 * ```typescript
 * const {
 *   validation,
 *   canGenerate,
 *   missingFields,
 *   warnings,
 *   progressPercentage
 * } = useConfigurationValidation({
 *   year,
 *   workCycle,
 *   // ... other params
 * });
 *
 * <button disabled={!canGenerate}>Generar Calendario</button>
 * ```
 */
export function useConfigurationValidation(params: UseConfigurationValidationParams) {
  /**
   * Perform validation (memoized)
   */
  const validation: ConfigurationValidation = useMemo(() => {
    return validateCompleteConfiguration(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.year,
    params.workCycle,
    params.employmentStatus,
    params.contractStartDate,
    params.cycleOffset,
    params.workingHours,
    params.annualContractHours,
    params.holidays.length, // Only length matters for validation
    params.vacations.length,
  ]);

  /**
   * Get missing (required) fields
   */
  const missingFields: FieldValidation[] = useMemo(() => {
    return getMissingFields(validation);
  }, [validation]);

  /**
   * Get warning (optional) fields
   */
  const warningFields: FieldValidation[] = useMemo(() => {
    return getWarningFields(validation);
  }, [validation]);

  /**
   * Calculate progress percentage (0-100)
   */
  const progressPercentage = useMemo(() => {
    return Math.round((validation.completedSections / validation.totalSections) * 100);
  }, [validation.completedSections, validation.totalSections]);

  /**
   * Check if can generate calendar
   */
  const canGenerate = validation.canGenerate;

  /**
   * Check if configuration is complete (no warnings)
   */
  const isComplete = validation.isComplete;

  /**
   * Get summary text for progress
   */
  const progressText = useMemo(() => {
    return `${validation.completedSections}/${validation.totalSections} secciones completadas`;
  }, [validation.completedSections, validation.totalSections]);

  return {
    // Validation result
    validation,

    // Quick checks
    canGenerate,
    isComplete,
    isValid: validation.isValid,

    // Missing and warning fields
    missingFields,
    warningFields,
    warnings: validation.warnings,

    // Progress
    progressPercentage,
    progressText,
    completedSections: validation.completedSections,
    totalSections: validation.totalSections,

    // All fields
    fields: validation.fields,
  };
}
