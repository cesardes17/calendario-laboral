/**
 * ConfigureWorkCycle Use Case
 *
 * Business logic for configuring work cycles.
 * Implements HU-003 requirements:
 * - Configure weekly cycles (7-day mask)
 * - Configure parts-based cycles (work/rest blocks)
 * - Validate cycle configurations
 */

import { Result } from '../domain/result';
import { WorkCycle, WeeklyMask, CyclePart } from '../domain/work-cycle';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CycleInfo {
  mode: 'weekly' | 'parts';
  description: string;
  totalParts: number;
  weeklyWorkDays?: number;
  parts?: CyclePart[];
}

export class ConfigureWorkCycleUseCase {
  /**
   * Configures a weekly work cycle
   * @param mask - 7-day boolean mask (Mon-Sun)
   * @returns Result containing WorkCycle or error
   */
  public configureWeekly(mask: WeeklyMask): Result<WorkCycle> {
    return WorkCycle.createWeekly(mask);
  }

  /**
   * Configures a parts-based work cycle
   * @param parts - Array of work/rest day parts
   * @returns Result containing WorkCycle or error
   */
  public configureParts(parts: CyclePart[]): Result<WorkCycle> {
    return WorkCycle.createParts(parts);
  }

  /**
   * Validates a weekly mask configuration
   * @param mask - 7-day boolean mask
   * @returns Validation result with errors if any
   */
  public validateWeeklyMask(mask: WeeklyMask): ValidationResult {
    const result = WorkCycle.createWeekly(mask);

    if (result.isFailure()) {
      return {
        isValid: false,
        errors: [result.errorValue()],
      };
    }

    return {
      isValid: true,
      errors: [],
    };
  }

  /**
   * Validates a parts configuration
   * @param parts - Array of work/rest day parts
   * @returns Validation result with errors if any
   */
  public validateParts(parts: CyclePart[]): ValidationResult {
    const result = WorkCycle.createParts(parts);

    if (result.isFailure()) {
      return {
        isValid: false,
        errors: [result.errorValue()],
      };
    }

    return {
      isValid: true,
      errors: [],
    };
  }

  /**
   * Gets information about a configured cycle
   * @param cycle - The work cycle
   * @returns Cycle information
   */
  public getCycleInfo(cycle: WorkCycle): CycleInfo {
    const info: CycleInfo = {
      mode: cycle.isWeekly() ? 'weekly' : 'parts',
      description: cycle.getDisplayText(),
      totalParts: cycle.getTotalParts(),
    };

    if (cycle.isWeekly()) {
      info.weeklyWorkDays = cycle.getWorkDaysInWeek();
    }

    if (cycle.isParts()) {
      info.parts = cycle.getParts() || [];
    }

    return info;
  }

  /**
   * Validates if a cycle offset is valid for a given cycle
   * @param cycle - The work cycle
   * @param partNumber - The part number (1-based)
   * @param dayWithinPart - The day within the part (1-based)
   * @returns Validation result
   */
  public validateOffsetForCycle(
    cycle: WorkCycle,
    partNumber: number,
    dayWithinPart: number
  ): ValidationResult {
    const errors: string[] = [];

    // Weekly cycles don't use part-based offsets
    if (cycle.isWeekly()) {
      errors.push('Los ciclos semanales no utilizan offsets por partes');
      return { isValid: false, errors };
    }

    // Validate part number exists
    const totalParts = cycle.getTotalParts();
    if (partNumber < 1 || partNumber > totalParts) {
      errors.push(
        `El número de parte debe estar entre 1 y ${totalParts} (tu ciclo tiene ${totalParts} parte${totalParts > 1 ? 's' : ''})`
      );
    }

    // Validate day within part
    const part = cycle.getPart(partNumber);
    if (part) {
      const maxDays = part.workDays + part.restDays;
      if (dayWithinPart < 1 || dayWithinPart > maxDays) {
        errors.push(
          `El día dentro de la parte ${partNumber} debe estar entre 1 y ${maxDays} (${part.workDays} trabajo + ${part.restDays} descanso)`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
