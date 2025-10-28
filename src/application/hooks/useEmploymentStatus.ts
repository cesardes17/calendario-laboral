/**
 * useEmploymentStatus Hook
 *
 * Application layer hook for managing employment status state in UI components.
 * Coordinates between UI and use cases, following Clean Architecture principles.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  SelectEmploymentStatusUseCase,
  CycleOffsetInput,
  ValidationResult,
} from '@/src/core/usecases/selectEmploymentStatus.usecase';
import {
  EmploymentStatus,
  EmploymentStatusType,
} from '@/src/core/domain/employmentStatus';
import { ContractStartDate } from '@/src/core/domain/contractStartDate';
import { CycleOffset, CycleDayType } from '@/src/core/domain/cycleOffset';
import { Year } from '@/src/core/domain/year';

export interface EmploymentStatusState {
  status: EmploymentStatus | null;
  contractStartDate: ContractStartDate | null;
  cycleOffset: CycleOffset | null;
  errors: string[];
  isValid: boolean;
}

export interface UseEmploymentStatusReturn {
  state: EmploymentStatusState;
  selectStatus: (type: EmploymentStatusType) => void;
  setContractStartDate: (date: Date, year: Year) => void;
  setCycleOffset: (partNumber: number, dayWithinPart: number, dayType: CycleDayType) => void;
  validateConfiguration: (year: Year, isWeeklyCycle?: boolean) => ValidationResult;
  reset: () => void;
}

const INITIAL_STATE: EmploymentStatusState = {
  status: null,
  contractStartDate: null,
  cycleOffset: null,
  errors: [],
  isValid: false,
};

/**
 * Hook for managing employment status state
 * @returns Employment status state and actions
 */
export function useEmploymentStatus(): UseEmploymentStatusReturn {
  const useCase = useMemo(() => new SelectEmploymentStatusUseCase(), []);
  const [state, setState] = useState<EmploymentStatusState>(INITIAL_STATE);

  /**
   * Selects an employment status type
   */
  const selectStatus = useCallback(
    (type: EmploymentStatusType) => {
      const result = useCase.selectStatus(type);

      if (result.isSuccess()) {
        setState((prev) => ({
          ...prev,
          status: result.getValue(),
          errors: [],
          // Clear dependent data when changing status
          contractStartDate: null,
          cycleOffset: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          status: null,
          errors: [result.errorValue()],
          isValid: false,
        }));
      }
    },
    [useCase]
  );

  /**
   * Sets the contract start date (for STARTED_THIS_YEAR)
   */
  const setContractStartDate = useCallback(
    (date: Date, year: Year) => {
      const result = useCase.setContractStartDate(date, year);

      if (result.isSuccess()) {
        setState((prev) => ({
          ...prev,
          contractStartDate: result.getValue(),
          errors: [],
          isValid: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          contractStartDate: null,
          errors: [result.errorValue()],
          isValid: false,
        }));
      }
    },
    [useCase]
  );

  /**
   * Sets the cycle offset (for WORKED_BEFORE)
   */
  const setCycleOffset = useCallback(
    (partNumber: number, dayWithinPart: number, dayType: CycleDayType) => {
      const result = useCase.setCycleOffset(partNumber, dayWithinPart, dayType);

      if (result.isSuccess()) {
        setState((prev) => ({
          ...prev,
          cycleOffset: result.getValue(),
          errors: [],
          isValid: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          cycleOffset: null,
          errors: [result.errorValue()],
          isValid: false,
        }));
      }
    },
    [useCase]
  );

  /**
   * Validates the complete configuration
   * @param year - The year
   * @param isWeeklyCycle - Whether the work cycle is weekly
   */
  const validateConfiguration = useCallback(
    (year: Year, isWeeklyCycle?: boolean): ValidationResult => {
      if (!state.status) {
        return {
          isValid: false,
          errors: ['Debe seleccionar una situación laboral'],
        };
      }

      const contractDate = state.contractStartDate?.value;
      const cycleOffset: CycleOffsetInput | undefined = state.cycleOffset
        ? {
            partNumber: state.cycleOffset.partNumber,
            dayWithinPart: state.cycleOffset.dayWithinPart,
            dayType: state.cycleOffset.dayType,
          }
        : undefined;

      const validation = useCase.validateConfiguration(
        state.status.type,
        year,
        contractDate,
        cycleOffset,
        isWeeklyCycle
      );

      // Solo actualizar el estado si realmente cambió
      if (
        validation.isValid !== state.isValid ||
        JSON.stringify(validation.errors) !== JSON.stringify(state.errors)
      ) {
        setState((prev) => ({
          ...prev,
          errors: validation.errors,
          isValid: validation.isValid,
        }));
      }

      return validation;
    },
    [useCase, state.status, state.contractStartDate, state.cycleOffset, state.isValid, state.errors]
  );

  /**
   * Resets the state to initial values
   */
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    selectStatus,
    setContractStartDate,
    setCycleOffset,
    validateConfiguration,
    reset,
  };
}
