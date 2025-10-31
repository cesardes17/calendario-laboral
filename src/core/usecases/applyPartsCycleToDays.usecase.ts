/**
 * Apply Parts Cycle to Days Use Case (HU-022)
 *
 * Applies the parts-based work/rest pattern to all calendar days.
 * Supports complex cycles like 6-3, 6-3, 6-3, 6-2 that repeat indefinitely.
 *
 * Business Rules:
 * - Only applies if cycle mode is PARTS
 * - Expands parts into a sequential pattern [T,T,T,D,D,D,...]
 * - Handles offset for users who were already working before the year
 * - Pattern repeats indefinitely throughout the year
 * - Saves metadata (part number, day within part, type) for each day
 */

import { CalendarDay, WorkCycle, Result, CycleOffset } from '../domain';

/**
 * Represents a day in the expanded cycle sequence
 */
interface CycleSequenceDay {
  /** Whether this is a work day (true) or rest day (false) */
  isWorkDay: boolean;
  /** The part number this day belongs to (1-based) */
  partNumber: number;
  /** The day within the part (1-based) */
  dayWithinPart: number;
  /** The type of day (Trabajo or Descanso) */
  dayType: 'Trabajo' | 'Descanso';
}

/**
 * Input for applying parts cycle to calendar days
 */
export interface ApplyPartsCycleToDaysInput {
  /** Array of calendar days to process */
  days: CalendarDay[];

  /** The work cycle configuration (must be PARTS mode) */
  workCycle: WorkCycle;

  /** Optional cycle offset for users who were already working */
  cycleOffset?: CycleOffset;

  /** Optional contract start date for users who started this year */
  contractStartDate?: Date;
}

/**
 * Output of the parts cycle application process
 */
export interface ApplyPartsCycleToDaysOutput {
  /** Number of days marked as 'Trabajo' */
  workDaysMarked: number;

  /** Number of days marked as 'Descanso' */
  restDaysMarked: number;

  /** Total days processed */
  totalDaysProcessed: number;

  /** Length of the complete cycle */
  cycleLength: number;
}

/**
 * Use Case: Apply Parts Cycle to Days
 *
 * Applies a multi-part work/rest cycle to all calendar days.
 * The cycle repeats indefinitely throughout the year.
 *
 * Business Rules (from HU-022):
 * - Only applies to PARTS mode cycles
 * - Expands each part into [T,T,T,...,D,D,D,...] sequence
 * - Concatenates all parts into a complete cycle
 * - Determines start index based on offset or contract start
 * - Applies pattern sequentially, wrapping at cycle end
 * - Never overrides 'NoContratado' days
 * - Saves metadata with part info for each day
 *
 * @example
 * ```typescript
 * // Cycle: 6-3, 6-3 (two parts)
 * const workCycle = WorkCycle.createParts([
 *   { workDays: 6, restDays: 3 },
 *   { workDays: 6, restDays: 3 }
 * ]);
 * const offset = CycleOffset.create(2, 4, CycleDayType.WORK);
 * const useCase = new ApplyPartsCycleToDaysUseCase();
 *
 * const result = useCase.execute({
 *   days,
 *   workCycle: workCycle.getValue(),
 *   cycleOffset: offset.getValue()
 * });
 * ```
 */
export class ApplyPartsCycleToDaysUseCase {
  /**
   * Executes the use case to apply parts cycle to calendar days
   *
   * @param input - Contains the days array and cycle configuration
   * @returns Result containing statistics or error message
   */
  public execute(input: ApplyPartsCycleToDaysInput): Result<ApplyPartsCycleToDaysOutput> {
    try {
      const { days, workCycle, cycleOffset, contractStartDate } = input;

      // Validate that cycle is in PARTS mode
      if (!workCycle.isParts()) {
        return Result.fail<ApplyPartsCycleToDaysOutput>(
          'Este use case solo aplica para ciclos en modo PARTS'
        );
      }

      // Get the parts
      const parts = workCycle.getParts();
      if (!parts || parts.length === 0) {
        return Result.fail<ApplyPartsCycleToDaysOutput>(
          'No se pudieron obtener las partes del ciclo'
        );
      }

      // Expand parts into a sequential pattern
      const cycleSequence = this.expandPartsToSequence(parts);
      if (cycleSequence.length === 0) {
        return Result.fail<ApplyPartsCycleToDaysOutput>(
          'No se pudo generar la secuencia del ciclo'
        );
      }

      // Calculate starting index
      const startIndex = this.calculateStartIndex(cycleSequence, cycleOffset);

      // Apply the pattern to all eligible days
      let workDaysMarked = 0;
      let restDaysMarked = 0;
      let totalDaysProcessed = 0;
      let currentIndex = startIndex;

      for (const day of days) {
        // Skip days that are already marked as "NoContratado"
        if (day.estado === 'NoContratado') {
          continue;
        }

        // Skip days before contract start date if applicable
        if (contractStartDate && day.fecha.getTime() < contractStartDate.getTime()) {
          continue;
        }

        // Get the current day in the cycle
        const cycleDay = cycleSequence[currentIndex % cycleSequence.length];

        // Apply the state
        if (cycleDay.isWorkDay) {
          day.estado = 'Trabajo';
          workDaysMarked++;
        } else {
          day.estado = 'Descanso';
          restDaysMarked++;
        }

        // Save metadata
        day.metadata = {
          parte: cycleDay.partNumber,
          diaDentroParte: cycleDay.dayWithinPart,
          tipoDentroParte: cycleDay.dayType,
        };

        totalDaysProcessed++;
        currentIndex++;
      }

      return Result.ok<ApplyPartsCycleToDaysOutput>({
        workDaysMarked,
        restDaysMarked,
        totalDaysProcessed,
        cycleLength: cycleSequence.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ApplyPartsCycleToDaysOutput>(
        `Error al aplicar el ciclo por partes: ${errorMessage}`
      );
    }
  }

  /**
   * Expands parts into a sequential pattern
   *
   * Example: [{ workDays: 6, restDays: 3 }, { workDays: 6, restDays: 2 }]
   * Results in: [T,T,T,T,T,T,D,D,D,T,T,T,T,T,T,D,D] (18 days total)
   *
   * @param parts - Array of cycle parts
   * @returns Array representing the complete cycle sequence
   */
  private expandPartsToSequence(parts: Array<{ workDays: number; restDays: number }>): CycleSequenceDay[] {
    const sequence: CycleSequenceDay[] = [];

    for (let partIndex = 0; partIndex < parts.length; partIndex++) {
      const part = parts[partIndex];
      const partNumber = partIndex + 1; // 1-based

      // Add work days
      for (let workDay = 1; workDay <= part.workDays; workDay++) {
        sequence.push({
          isWorkDay: true,
          partNumber,
          dayWithinPart: workDay,
          dayType: 'Trabajo',
        });
      }

      // Add rest days
      for (let restDay = 1; restDay <= part.restDays; restDay++) {
        sequence.push({
          isWorkDay: false,
          partNumber,
          dayWithinPart: restDay,
          dayType: 'Descanso',
        });
      }
    }

    return sequence;
  }

  /**
   * Calculates the starting index in the cycle sequence
   *
   * If no offset is provided, starts at index 0 (first day of cycle).
   * If offset is provided, calculates the exact position based on:
   * - Which part the user was in
   * - Which day within that part
   * - Whether it was a work or rest day
   *
   * @param sequence - The complete cycle sequence
   * @param offset - Optional cycle offset
   * @returns The starting index (0-based)
   */
  private calculateStartIndex(sequence: CycleSequenceDay[], offset?: CycleOffset): number {
    if (!offset) {
      return 0; // Start from the beginning
    }

    // Find the position in the sequence that matches the offset
    for (let i = 0; i < sequence.length; i++) {
      const day = sequence[i];

      // Check if this day matches the offset
      if (
        day.partNumber === offset.partNumber &&
        day.dayWithinPart === offset.dayWithinPart &&
        ((offset.isWorkDay() && day.isWorkDay) || (offset.isRestDay() && !day.isWorkDay))
      ) {
        return i;
      }
    }

    // If not found, start from beginning (fallback)
    console.warn('Offset position not found in cycle sequence, starting from beginning');
    return 0;
  }
}
