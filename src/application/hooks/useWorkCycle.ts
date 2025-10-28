/**
 * useWorkCycle Hook
 *
 * Application layer hook for managing work cycle configuration state.
 * Coordinates between UI and use cases, following Clean Architecture principles.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ConfigureWorkCycleUseCase,
  ValidationResult,
} from '@/src/core/usecases/configureWorkCycle.usecase';
import { WorkCycle, CycleMode, WeeklyMask, CyclePart } from '@/src/core/domain/workCycle';

export interface WorkCycleState {
  cycle: WorkCycle | null;
  mode: CycleMode | null;
  errors: string[];
  isValid: boolean;
}

export interface UseWorkCycleReturn {
  state: WorkCycleState;
  configureWeekly: (mask: WeeklyMask) => void;
  configureParts: (parts: CyclePart[]) => void;
  validateWeeklyMask: (mask: WeeklyMask) => ValidationResult;
  validateParts: (parts: CyclePart[]) => ValidationResult;
  reset: () => void;
}

const INITIAL_STATE: WorkCycleState = {
  cycle: null,
  mode: null,
  errors: [],
  isValid: false,
};

/**
 * Hook for managing work cycle configuration state
 * @returns Work cycle state and actions
 */
export function useWorkCycle(): UseWorkCycleReturn {
  const useCase = useMemo(() => new ConfigureWorkCycleUseCase(), []);
  const [state, setState] = useState<WorkCycleState>(INITIAL_STATE);

  /**
   * Configures a weekly work cycle
   */
  const configureWeekly = useCallback(
    (mask: WeeklyMask) => {
      const result = useCase.configureWeekly(mask);

      if (result.isSuccess()) {
        setState({
          cycle: result.getValue(),
          mode: CycleMode.WEEKLY,
          errors: [],
          isValid: true,
        });
      } else {
        setState({
          cycle: null,
          mode: CycleMode.WEEKLY,
          errors: [result.errorValue()],
          isValid: false,
        });
      }
    },
    [useCase]
  );

  /**
   * Configures a parts-based work cycle
   */
  const configureParts = useCallback(
    (parts: CyclePart[]) => {
      const result = useCase.configureParts(parts);

      if (result.isSuccess()) {
        setState({
          cycle: result.getValue(),
          mode: CycleMode.PARTS,
          errors: [],
          isValid: true,
        });
      } else {
        setState({
          cycle: null,
          mode: CycleMode.PARTS,
          errors: [result.errorValue()],
          isValid: false,
        });
      }
    },
    [useCase]
  );

  /**
   * Validates a weekly mask without setting state
   */
  const validateWeeklyMask = useCallback(
    (mask: WeeklyMask): ValidationResult => {
      return useCase.validateWeeklyMask(mask);
    },
    [useCase]
  );

  /**
   * Validates parts without setting state
   */
  const validateParts = useCallback(
    (parts: CyclePart[]): ValidationResult => {
      return useCase.validateParts(parts);
    },
    [useCase]
  );

  /**
   * Resets the state to initial values
   */
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    configureWeekly,
    configureParts,
    validateWeeklyMask,
    validateParts,
    reset,
  };
}
